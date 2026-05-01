# app/ml/trainer.py
import pandas as pd
import joblib
import os
from pathlib import Path
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "models"
CSV_URL_FILE = Path("phishing_dataset.csv")

def check_and_train_models():
    """Vérifie la présence des modèles et entraîne si nécessaire."""
    
    # Liste des fichiers requis
    required_files = [
        MODEL_DIR / "nlp_pipeline.pkl",
        MODEL_DIR / "url_model.pkl",
        MODEL_DIR / "url_scaler.pkl",
        MODEL_DIR / "url_features_list.pkl"
    ]

    # Si tous les fichiers existent, on ne fait rien
    if all(f.exists() for f in required_files):
        print("INFO: Modèles IA déjà présents. Passage à la suite.")
        return

    print("INFO: Modèles IA manquants ou incomplets. Démarrage de l'apprentissage automatique...")
    
    if not MODEL_DIR.exists():
        MODEL_DIR.mkdir(parents=True)

    # --- 1. Entraînement NLP (Texte) ---
    data_nlp = {
        'text': [
            "Your account is suspended, click here", "Urgent action required", 
            "Win a gift card", "Pay your invoice now", "Meeting at 10am", 
            "The report is attached", "Hello, how are you?", "Project update"
            "Félicitations! Vous pouvez gagner un prix exclusif Coffret d'outils Makita Lidl",
            "Vous avez été sélectionné pour recevoir un cadeau gratuit, cliquez ici",
            "Urgent: votre colis Amazon est bloqué, payez les frais",
        ],
        'label': [1, 1, 1, 1, 0, 0, 0, 0]
    }
    df_nlp = pd.DataFrame(data_nlp)
    nlp_pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(stop_words='english', max_features=5000)),
        ('rf', RandomForestClassifier(n_estimators=100, random_state=42))
    ])
    nlp_pipeline.fit(df_nlp['text'], df_nlp['label'])
    joblib.dump(nlp_pipeline, MODEL_DIR / "nlp_pipeline.pkl")

    # --- 2. Entraînement URL (Numérique) ---
    if CSV_URL_FILE.exists():
        df = pd.read_csv(CSV_URL_FILE)
        if 'id' in df.columns:
            df = df.drop(columns=['id'])
        
        X = df.drop(columns=['CLASS_LABEL'])
        y = df['CLASS_LABEL']
        
        joblib.dump(X.columns.tolist(), MODEL_DIR / "url_features_list.pkl")
        
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        
        model = RandomForestClassifier(n_estimators=100, random_state=42)
        model.fit(X_scaled, y)
        
        joblib.dump(model, MODEL_DIR / "url_model.pkl")
        joblib.dump(scaler, MODEL_DIR / "url_scaler.pkl")
        print("INFO: Apprentissage automatique terminé avec succès.")
    else:
        print("ERREUR: Impossible d'entraîner le modèle URL car phishing_dataset.csv est absent.")