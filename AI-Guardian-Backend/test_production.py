import os
import sys
import asyncio
from dotenv import load_dotenv
from gophish import Gophish

# S'assurer qu'on peut importer l'app
sys.path.insert(0, os.path.dirname(__file__))
load_dotenv()

def test_gophish():
    print("--- TEST GOPHISH ---")
    api_key = os.getenv("GOPHISH_API_KEY")
    url = os.getenv("GOPHISH_URL", "https://127.0.0.1:3333")
    
    if not api_key:
        print("❌ ERREUR: GOPHISH_API_KEY non trouvée dans .env")
        return False
        
    try:
        api = Gophish(api_key, host=url, verify=False)
        campaigns = api.campaigns.get()
        print(f"✅ SUCCÈS ! Connexion à Gophish établie sur {url}.")
        print(f"✅ Gophish répond correctement (Trouvé {len(campaigns)} campagnes existantes).")
        return True
    except Exception as e:
        print(f"❌ ERREUR de connexion à Gophish : {e}")
        return False

def test_ml_models():
    print("\n--- TEST MACHINE LEARNING ---")
    try:
        # Import tardif pour éviter les crashs si les dépendances manquent
        from app.ml.service import analyze_text_ml
        
        test_text = "Félicitations, vous avez gagné un iPhone gratuit ! Cliquez ici."
        result = analyze_text_ml(test_text)
        
        print("✅ SUCCÈS ! Les modèles ML se sont chargés correctement.")
        print(f"   Texte de test analysé: '{test_text}'")
        print(f"   Résultat: {'Phishing' if result['is_phishing'] else 'Légitime'} (Confiance: {result['confidence']}%)")
        return True
    except Exception as e:
        print(f"❌ ERREUR ML : {e}")
        return False

if __name__ == "__main__":
    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
    
    print("====================================")
    print("🚀 VÉRIFICATION DU DÉPLOIEMENT 🚀")
    print("====================================\n")
    
    gophish_ok = test_gophish()
    ml_ok = test_ml_models()
    
    print("\n====================================")
    if gophish_ok and ml_ok:
        print("🏆 TOUT EST OPÉRATIONNEL ! Le projet est prêt pour la production.")
    else:
        print("⚠️ CERTAINS TESTS ONT ÉCHOUÉ. Vérifiez les logs ci-dessus.")
    print("====================================")
