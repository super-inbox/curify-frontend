import sqlite3
from datetime import datetime
from typing import Optional, Dict, Any

class UserModel:
    def __init__(self, db_path: str):
        self.db_path = db_path
        self._init_table()
    
    def _get_connection(self):
        """Create and return a database connection"""
        return sqlite3.connect(self.db_path)
    
    def _init_table(self):
        """Initialize the users table if it doesn't exist"""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    email TEXT UNIQUE NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    nano_banana_gallery_subscribed BOOLEAN DEFAULT 0
                )
            ''')
            conn.commit()
    
    def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get a user by ID"""
        with self._get_connection() as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))
            user = cursor.fetchone()
            return dict(user) if user else None
    
    def create_or_update_user(self, user_id: str, email: str) -> Dict[str, Any]:
        """Create or update a user"""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO users (id, email, updated_at)
                VALUES (?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    email = excluded.email,
                    updated_at = ?
                RETURNING *
            ''', (user_id, email, datetime.utcnow(), datetime.utcnow()))
            
            user = cursor.fetchone()
            conn.commit()
            return dict(user) if user else None
    
    def update_subscription_status(self, user_id: str, subscribed: bool) -> bool:
        """Update the nano banana gallery subscription status"""
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    UPDATE users
                    SET nano_banana_gallery_subscribed = ?,
                        updated_at = ?
                    WHERE id = ?
                ''', (subscribed, datetime.utcnow(), user_id))
                
                conn.commit()
                return cursor.rowcount > 0
        except Exception as e:
            print(f"Error updating subscription status: {e}")
            return False
