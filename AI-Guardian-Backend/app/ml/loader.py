# app/ml/loader.py (Version simplifiée pour l'automatisation)
import joblib
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "models"

# Variables globales qui seront remplies au démarrage
nlp_pipeline = None
url_model = None
url_scaler = None
url_features_list = None

def load_all_models():
    global nlp_pipeline, url_model, url_scaler, url_features_list
    
    nlp_path = MODEL_DIR / "nlp_pipeline.pkl"
    if nlp_path.exists():
        nlp_pipeline = joblib.load(nlp_path)

    url_m_path = MODEL_DIR / "url_model.pkl"
    if url_m_path.exists():
        url_model = joblib.load(url_m_path)
        url_scaler = joblib.load(MODEL_DIR / "url_scaler.pkl")
        url_features_list = joblib.load(MODEL_DIR / "url_features_list.pkl")

# Appel initial
load_all_models()