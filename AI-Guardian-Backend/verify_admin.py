
import sqlite3
import os
import sys
from passlib.context import CryptContext

# Adjust path to include app directory for imports if needed
sys.path.insert(0, os.getcwd())

pwd_context = CryptContext(
    schemes=["argon2"],
    deprecated="auto",
    argon2__time_cost=2,
    argon2__memory_cost=1024,
    argon2__parallelism=2,
)

def verify():
    db_path = 'app.db'
    if not os.path.exists(db_path):
        print(f"Error: {db_path} not found")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    email = 'admin@aiguardian.com'
    cursor.execute('SELECT mot_de_passe, role FROM users WHERE email = ?', (email,))
    row = cursor.fetchone()
    
    if not row:
        print(f"User {email} not found in database.")
    else:
        hashed_password, role = row
        print(f"User: {email}")
        print(f"Role: {role}")
        print(f"Hashed Password: {hashed_password}")
        
        test_pass = "Admin@2024!"
        is_correct = pwd_context.verify(test_pass, hashed_password)
        print(f"Is password '{test_pass}' correct? {is_correct}")

    conn.close()

if __name__ == "__main__":
    verify()
