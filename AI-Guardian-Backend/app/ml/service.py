import re
import numpy as np
import joblib
from typing import Optional
from fastapi import Request
from app.database import SessionLocal
from app.models.ml_analysis import MLAnalysis
from app.core.audit import log_audit
from app.ml.loader import nlp_pipeline, url_model, url_scaler, url_features_list

def extract_url_features(url):
    """Extrait les caractéristiques numériques d'une URL pour le modèle URL."""
    if not url_features_list:
        return None
        
    features = {
        "NumDots": url.count('.'),
        "SubdomainLevel": max(0, url.count('.') - 1),
        "PathLevel": url.count('/'),
        "UrlLength": len(url),
        "NumDash": url.count('-'),
        "AtSymbol": 1 if '@' in url else 0,
        "TildeSymbol": 1 if '~' in url else 0,
        "NumUnderscore": url.count('_'),
        "NumPercent": url.count('%'),
        "NumQueryComponents": url.count('&') + url.count('?')
    }
    # Remplissage du vecteur selon l'ordre des colonnes du CSV
    vector = [features.get(col, 0) for col in url_features_list]
    return np.array(vector).reshape(1, -1)

def analyze_text_ml(content: str):
    reasons = []
    text_lower = content.lower()
    
    # --- 1. Analyse NLP ---
    prob_nlp = 0.0
    if nlp_pipeline:
        prob_nlp = float(nlp_pipeline.predict_proba([content])[0][1])

    # --- 2. Heuristiques Spécifiques (Le filet de sécurité) ---
    
    gift_keywords = ["gagner", "prix exclusif", "coffret", "cadeau", "sélectionné", "chanceux", "gratuit", "récompense"]
    if any(word in text_lower for word in gift_keywords):
        match_count = sum(1 for word in gift_keywords if word in text_lower)
        if match_count >= 2:
            reasons.append("**Appât de gain** : Les promesses de cadeaux gratuits (outils, smartphones) sont souvent utilisées pour voler vos informations personnelles.")
            prob_nlp = max(prob_nlp, 0.85)

    # Détection d'Urgence
    urgency_words = ["immédiat", "urgent", "répondez simplement", "obtenez-le maintenant", "vite", "24h"]
    if any(word in text_lower for word in urgency_words):
        reasons.append("**Pression temporelle** : L'attaquant essaie de vous faire agir dans la précipitation pour que vous ne vérifiiez pas l'authenticité du message.")
        prob_nlp = max(prob_nlp, 0.70)

    # Détection de l'Usurpation de marque
    brands = ["lidl", "amazon", "makita", "samsung", "iphone", "ameli", "banque"]
    if any(b in text_lower for b in brands) and any(g in text_lower for g in gift_keywords):
        reasons.append("**Usurpation d'identité** : Le message utilise le nom d'une marque connue pour gagner votre confiance.")
        prob_nlp = max(prob_nlp, 0.90)

    # 2. Analyse technique des URLs
    prob_url = 0.0
    urls = re.findall(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', content)
    
    if urls and prob_url > 0.7:
        reasons.append("🔗 **Lien suspect** : L'adresse de destination (URL) ne correspond pas aux sites officiels ou utilise des techniques de camouflage.")

    if urls and url_model and url_scaler:
        url_probs = []
        for url in urls:
            feat = extract_url_features(url)
            if feat is not None:
                feat_scaled = url_scaler.transform(feat)
                p = float(url_model.predict_proba(feat_scaled)[0][1])
                url_probs.append(p)
                
                cloud_services = ["googleapis.com", "s3.amazonaws.com", "windows.net", "pages.dev", "firebaseapp.com"]
                if any(service in url for service in cloud_services):
                    reasons.append("**Hébergement Cloud suspect** : Ce lien utilise un service de stockage légitime (Google/Azure) pour masquer une page frauduleuse. C'est une technique très courante en phishing.")
                    p = max(p, 0.80) # On augmente la probabilité

                if len(url.split('#')[-1]) > 30 or len(url.split('?')[-1]) > 30:
                    reasons.append("**Paramètres de suivi détectés** : Le lien contient des identifiants encodés. Les pirates utilisent cela pour savoir quel employé a cliqué sur le lien.")
                    p = max(p, 0.75)

                if url.endswith(".html") or ".html?" in url or ".html#" in url:
                    if any(x in url.lower() for x in ["login", "verify", "secure", "href"]):
                        reasons.append("**Page de formulaire suspecte** : Le lien dirige vers un fichier HTML isolé, souvent utilisé pour afficher de faux formulaires de connexion.")
                
                url_probs[-1] = p 

        prob_url = max(url_probs) if url_probs else 0.0

    # 3. Score Final
    final_prob = max(prob_nlp, prob_url)
    is_phishing = final_prob >= 0.5
    confidence = round(final_prob * 100, 2)

    if not reasons:
        reasons.append("Aucun indicateur de menace majeur détecté.")

    return {
        "is_phishing": is_phishing,
        "probability": round(final_prob, 4),
        "confidence": confidence,
        "explanation": reasons
    }

async def save_analysis_and_audit(text: str, request: Request, user_id: Optional[int] = None):
    """Réalise l'analyse, l'enregistre en base et crée un log d'audit."""
    
    # On lance l'analyse hybride
    result = analyze_text_ml(text)

    # Sauvegarde dans la table ml_analysis
    async with SessionLocal() as db:
        analysis = MLAnalysis(
            user_id=user_id,
            content=text,
            is_phishing=result["is_phishing"],
            probability=result["probability"],
            confidence=result["confidence"]
        )
        db.add(analysis)
        await db.commit()

    # Log d'audit pour la traçabilité
    await log_audit(
        user_id=user_id,
        action="ML_ANALYSIS_HYBRID",
        endpoint=str(request.url.path),
        method=request.method,
        ip_address=request.client.host if request.client else "unknown",
        user_agent=request.headers.get("User-Agent", "unknown"),
        status_code=200
    )
    
    return result