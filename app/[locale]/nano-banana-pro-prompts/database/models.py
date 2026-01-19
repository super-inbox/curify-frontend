import sqlite3
import os

class NanoBananaDatabase:
    def __init__(self, db_path='nano_banana.db'):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Create database tables if they don't exist"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS prompts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source_type TEXT,
                source_id TEXT UNIQUE,
                title TEXT NOT NULL,
                description TEXT,
                prompt_text TEXT NOT NULL,
                author TEXT,
                author_handle TEXT,
                date TEXT,
                category TEXT,
                featured BOOLEAN DEFAULT 0,
                original BOOLEAN DEFAULT 1,
                image_url TEXT,
                source_url TEXT,
                likes INTEGER DEFAULT 0,
                retweets INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS processed_sources (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source_type TEXT,
                source_hash TEXT UNIQUE,
                title TEXT,
                processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
        print(f"✅ Database initialized: {self.db_path}")
    
    def source_exists(self, source_hash):
        """Check if source has already been processed"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('SELECT id FROM processed_sources WHERE source_hash = ?', (source_hash,))
        exists = cursor.fetchone() is not None
        conn.close()
        return exists
    
    def save_prompt(self, prompt_data):
        """Save a prompt to the database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT INTO prompts (
                    source_type, source_id, title, description, prompt_text, author, 
                    author_handle, date, category, featured, original, image_url, 
                    source_url, likes, retweets
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                prompt_data.get('source_type', 'unknown'),
                prompt_data.get('source_id', ''),
                prompt_data['title'],
                prompt_data.get('description', ''),
                prompt_data['prompt_text'],
                prompt_data.get('author', ''),
                prompt_data.get('author_handle', ''),
                prompt_data.get('date', ''),
                prompt_data.get('category', 'SOCIAL MEDIA POST'),
                prompt_data.get('featured', False),
                prompt_data.get('original', True),
                prompt_data.get('image_url', ''),
                prompt_data.get('source_url', ''),
                prompt_data.get('likes', 0),
                prompt_data.get('retweets', 0)
            ))
            
            # Mark source as processed
            source_hash = prompt_data.get('source_hash', '')
            if source_hash:
                cursor.execute('''
                    INSERT OR IGNORE INTO processed_sources (source_type, source_hash, title)
                    VALUES (?, ?, ?)
                ''', (
                    prompt_data.get('source_type', 'unknown'),
                    source_hash,
                    prompt_data.get('title', '')
                ))
            
            conn.commit()
            return cursor.lastrowid
            
        except sqlite3.IntegrityError:
            print(f"   ⚠️  Prompt already exists in database")
            return None
        finally:
            conn.close()
    
    def get_all_prompts(self, limit=None, category=None, source_type=None):
        """Retrieve all prompts from database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        query = 'SELECT * FROM prompts WHERE 1=1'
        params = []
        
        if category:
            query += ' AND category = ?'
            params.append(category)
        
        if source_type:
            query += ' AND source_type = ?'
            params.append(source_type)
        
        query += ' ORDER BY featured DESC, created_at DESC'
        
        if limit:
            query += ' LIMIT ?'
            params.append(limit)
        
        cursor.execute(query, params)
        
        columns = [description[0] for description in cursor.description]
        prompts = []
        
        for row in cursor.fetchall():
            prompt = dict(zip(columns, row))
            prompts.append(prompt)
        
        conn.close()
        return prompts
    
    def get_stats(self):
        """Get database statistics"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT COUNT(*) FROM prompts')
        total_prompts = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM prompts WHERE source_type = "twitter"')
        twitter_prompts = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM prompts WHERE source_type = "news"')
        news_prompts = cursor.fetchone()[0]
        
        cursor.execute('SELECT SUM(likes) FROM prompts')
        total_likes = cursor.fetchone()[0] or 0
        
        conn.close()
        
        return {
            'total_prompts': total_prompts,
            'twitter_prompts': twitter_prompts,
            'news_prompts': news_prompts,
            'total_likes': total_likes
        }
