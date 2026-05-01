import os

# --- CONFIGURATION ---

# Dossiers à ignorer (pour ne pas polluer le contexte)
IGNORE_DIRS = {
    '.git', '.idea', '.vscode', '__pycache__', 'node_modules', 
    'venv', 'env', '.env', 'build', 'dist', 'target', 'bin', 'obj',
    'migrations' # Souvent inutile pour la logique métier
}

# Extensions de fichiers à ignorer (images, binaires, logs, etc.)
IGNORE_EXTENSIONS = {
    '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.bmp', 
    '.exe', '.dll', '.so', '.dylib', '.class', '.jar', 
    '.pyc', '.log', '.lock', '.zip', '.tar', '.gz', '.pdf', 
    '.sqlite3', '.db'
}

# Fichiers spécifiques à ignorer
IGNORE_FILES = {
    'package-lock.json', 'yarn.lock', '.DS_Store'
}

# Nom du fichier de sortie
OUTPUT_FILE = "projet_context.txt"

def is_ignored(path):
    """Vérifie si le chemin doit être ignoré."""
    parts = path.split(os.sep)
    for part in parts:
        if part in IGNORE_DIRS:
            return True
    return False

def is_text_file(file_path):
    """Tente de vérifier si un fichier est textuel (pas binaire)."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            f.read(1024)
        return True
    except (UnicodeDecodeError, Exception):
        return False

def generate_tree(start_path, output_file):
    """Génère l'arborescence du projet."""
    output_file.write(f"--- ARBORESCENCE DU PROJET ({start_path}) ---\n\n")
    
    for root, dirs, files in os.walk(start_path):
        # Filtrer les dossiers ignorés sur place pour os.walk
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        
        level = root.replace(start_path, '').count(os.sep)
        indent = ' ' * 4 * (level)
        output_file.write(f"{indent}{os.path.basename(root)}/\n")
        
        subindent = ' ' * 4 * (level + 1)
        for f in files:
            if not any(f.endswith(ext) for ext in IGNORE_EXTENSIONS) and f not in IGNORE_FILES and f != OUTPUT_FILE:
                 output_file.write(f"{subindent}{f}\n")
    
    output_file.write("\n" + "="*50 + "\n\n")

def collect_content(start_path, output_file):
    """Collecte le contenu des fichiers."""
    output_file.write("--- CONTENU DES FICHIERS ---\n\n")
    
    for root, dirs, files in os.walk(start_path):
        # Filtrer les dossiers ignorés
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        
        for file in files:
            file_path = os.path.join(root, file)
            
            # Vérifications d'exclusion
            if file == OUTPUT_FILE: continue
            if file in IGNORE_FILES: continue
            if any(file.endswith(ext) for ext in IGNORE_EXTENSIONS): continue
            
            # On essaie de lire le fichier
            if is_text_file(file_path):
                relative_path = os.path.relpath(file_path, start_path)
                output_file.write(f"FILE_START: {relative_path}\n")
                output_file.write("-" * 20 + "\n")
                
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
                        output_file.write(f.read())
                except Exception as e:
                    output_file.write(f"[Erreur de lecture: {e}]")
                    
                output_file.write("\n" + "-" * 20 + "\n")
                output_file.write(f"FILE_END: {relative_path}\n\n")

def main():
    # Chemin actuel (là où le script est lancé)
    current_dir = os.getcwd()
    
    print(f"Analyse du dossier : {current_dir}")
    print(f"Génération de {OUTPUT_FILE} en cours...")
    
    try:
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            # 1. Écrire l'arborescence
            generate_tree(current_dir, f)
            # 2. Écrire les contenus
            collect_content(current_dir, f)
            
        print(f"✅ Terminé ! Le fichier '{OUTPUT_FILE}' a été créé.")
        print("Tu peux maintenant uploader ce fichier ou copier son contenu.")
        
    except Exception as e:
        print(f"❌ Une erreur est survenue : {e}")

if __name__ == "__main__":
    main()
