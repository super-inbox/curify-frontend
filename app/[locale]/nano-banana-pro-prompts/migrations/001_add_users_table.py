import sqlite3
import os
from datetime import datetime

def migrate():
    """Migration to add users table and nano_banana_gallery_subscribed column"""
    db_path = os.path.join(os.path.dirname(__file__), '..', 'nano_banana.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Create users table if it doesn't exist
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                nano_banana_gallery_subscribed BOOLEAN DEFAULT 0
            )
        ''')
        
        # Add nano_banana_gallery_subscribed column if it doesn't exist
        cursor.execute("PRAGMA table_info(users)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'nano_banana_gallery_subscribed' not in columns:
            cursor.execute('''
                ALTER TABLE users 
                ADD COLUMN nano_banana_gallery_subscribed BOOLEAN DEFAULT 0
            ''')
        
        conn.commit()
        print("✅ Migration completed successfully!")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Migration failed: {str(e)}")
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
