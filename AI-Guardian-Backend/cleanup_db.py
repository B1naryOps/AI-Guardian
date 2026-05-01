import sqlite3
import os

def cleanup():
    conn = sqlite3.connect('app.db')
    cursor = conn.cursor()
    try:
        # Drop company_settings
        cursor.execute("DROP TABLE IF EXISTS company_settings")
        cursor.execute("DROP INDEX IF EXISTS ix_company_settings_id")
        
        # Check users table
        cursor.execute("PRAGMA table_info(users)")
        columns = [row[1] for row in cursor.fetchall()]
        
        if 'department_id' in columns:
            print("Removing department_id from users table...")
            # SQLite way to drop a column before 3.35 or just safer way
            cursor.execute("CREATE TABLE users_new AS SELECT id, email, nom, prenoms, mot_de_passe, role FROM users")
            cursor.execute("DROP TABLE users")
            cursor.execute("ALTER TABLE users_new RENAME TO users")
            # Recreate indexes if any (Initial migration had ix_users_id and ix_users_email)
            cursor.execute("CREATE UNIQUE INDEX ix_users_email ON users (email)")
            cursor.execute("CREATE INDEX ix_users_id ON users (id)")
            print("department_id removed.")
            
        conn.commit()
        print("Cleanup successful")
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    cleanup()
