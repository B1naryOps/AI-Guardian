import sqlite3
c = sqlite3.connect('app.db')
print(c.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'").fetchone()[0])
