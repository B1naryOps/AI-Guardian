import pandas as pd
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

# Configuration des chemins
CSV_URL_FILE = "Phishing_Legitimate_full.csv" 
MODEL_DIR = "app/ml/models"

if not os.path.exists(MODEL_DIR):
    os.makedirs(MODEL_DIR)

def train_nlp_model():
    print("Entrainement du modele NLP (Texte)...")
    # Dataset de secours pour le texte (A completer avec un plus gros volume plus tard)
    data = {
        'text': [
            "Your account is suspended, click here", "Urgent action required", 
            "Win a gift card", "Pay your invoice now", "Meeting at 10am", 
            "The report is attached", "Hello, how are you?", "Project update"
        ],
        'label': [1, 1, 1, 1, 0, 0, 0, 0]
    }
    df_nlp = pd.DataFrame(data)
    
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(stop_words='english', max_features=5000)),
        ('rf', RandomForestClassifier(n_estimators=100, random_state=42))
    ])
    
    pipeline.fit(df_nlp['text'], df_nlp['label'])
    joblib.dump(pipeline, f"{MODEL_DIR}/nlp_pipeline.pkl")
    print("Modele NLP sauvegarde.")

def train_url_model():
    if not os.path.exists(CSV_URL_FILE):
        print(f"Erreur : {CSV_URL_FILE} introuvable pour le modele URL.")
        return

    print("Entrainement du modele URL (Numerique)...")
    df = pd.read_csv(CSV_URL_FILE)
    
    if 'id' in df.columns:
        df = df.drop(columns=['id'])
    
    X = df.drop(columns=['CLASS_LABEL'])
    y = df['CLASS_LABEL']
    
    # On sauvegarde la liste des colonnes pour l'extraction en temps reel
    joblib.dump(X.columns.tolist(), f"{MODEL_DIR}/url_features_list.pkl")

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train_scaled, y_train)
    
    joblib.dump(model, f"{MODEL_DIR}/url_model.pkl")
    joblib.dump(scaler, f"{MODEL_DIR}/url_scaler.pkl")
    print("Modele URL sauvegarde.")

if __name__ == "__main__":
    train_nlp_model()
    train_url_model()