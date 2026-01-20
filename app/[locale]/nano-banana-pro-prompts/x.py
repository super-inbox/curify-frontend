import json
import requests
import os
import sqlite3
from datetime import datetime
import time
import hashlib
import re

# Required installations:
# pip install requests tweepy ollama

try:
    import tweepy
except ImportError:
    tweepy = None

try:
    import ollama
except ImportError:
    ollama = None

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

class HybridPromptCollector:
    def __init__(self, twitter_token=None, news_api_key=None, db_path='nano_banana.db'):
        self.twitter_token = twitter_token or os.getenv('TWITTER_BEARER_TOKEN')
        self.news_api_key = news_api_key or os.getenv('NEWS_API_KEY')
        self.db = NanoBananaDatabase(db_path)
        self.prompts = []
        
        if self.twitter_token and tweepy:
            self.twitter_client = tweepy.Client(bearer_token=self.twitter_token)
        else:
            self.twitter_client = None
    
    # ==================== TWITTER METHODS ====================
    
    def extract_prompt_from_tweet(self, text):
        """Extract prompt from tweet text using patterns"""
        prompt_patterns = [
            r'[Pp]rompt[:\s]+(.+)',
            r'[Ii]mage [Pp]rompt[:\s]+(.+)',
            r'[Mm]idjourney[:\s]+(.+)',
            r'[Ss]table [Dd]iffusion[:\s]+(.+)',
            r'DALL-E[:\s]+(.+)',
            r'/imagine\s+(.+)',
        ]
        
        for pattern in prompt_patterns:
            match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
            if match:
                prompt = match.group(1).strip()
                prompt = re.sub(r'http\S+', '', prompt)
                prompt = re.sub(r'\s+', ' ', prompt).strip()
                return prompt
        
        clean_text = re.sub(r'(#\w+|\@\w+|http\S+)\s*$', '', text).strip()
        if len(clean_text) > 50:
            return clean_text
        
        return None
    
    def search_twitter_prompts(self, query='midjourney prompt', max_results=20):
        """Search Twitter for prompt-related tweets"""
        if not self.twitter_client:
            return []
        
        print(f"🐦 Searching Twitter: '{query}'...")
        
        try:
            tweets = self.twitter_client.search_recent_tweets(
                query=query,
                max_results=max_results,
                tweet_fields=['created_at', 'public_metrics', 'author_id', 'attachments'],
                expansions=['author_id', 'attachments.media_keys'],
                user_fields=['username', 'name'],
                media_fields=['url', 'preview_image_url']
            )
            
            if not tweets.data:
                return []
            
            users = {user.id: user for user in tweets.includes.get('users', [])}
            media = {m.media_key: m for m in tweets.includes.get('media', [])} if tweets.includes.get('media') else {}
            
            results = []
            for tweet in tweets.data:
                source_hash = hashlib.md5(str(tweet.id).encode()).hexdigest()
                if self.db.source_exists(source_hash):
                    continue
                
                prompt_text = self.extract_prompt_from_tweet(tweet.text)
                if not prompt_text:
                    continue
                
                author = users.get(tweet.author_id)
                image_url = None
                if hasattr(tweet, 'attachments') and tweet.attachments:
                    media_keys = tweet.attachments.get('media_keys', [])
                    if media_keys and media_keys[0] in media:
                        media_obj = media[media_keys[0]]
                        image_url = getattr(media_obj, 'url', None) or getattr(media_obj, 'preview_image_url', None)
                
                results.append({
                    'source_type': 'twitter',
                    'source_id': str(tweet.id),
                    'source_hash': source_hash,
                    'prompt_text': prompt_text,
                    'author': author.name if author else 'Unknown',
                    'author_handle': author.username if author else '',
                    'date': tweet.created_at.strftime('%Y-%m-%d'),
                    'likes': tweet.public_metrics['like_count'],
                    'retweets': tweet.public_metrics['retweet_count'],
                    'image_url': image_url,
                    'source_url': f'https://twitter.com/{author.username}/status/{tweet.id}' if author else ''
                })
            
            print(f"   ✅ Found {len(results)} new Twitter prompts")
            return results
            
        except Exception as e:
            print(f"   ❌ Twitter error: {e}")
            return []
    
    # ==================== NEWS API METHODS ====================
    
    def fetch_news_articles(self, keywords=None, max_articles=20):
        """Fetch news articles about AI art and prompts"""
        if not self.news_api_key:
            return []
        
        if not keywords:
            keywords = ['midjourney', 'stable diffusion', 'AI art', 'DALL-E', 'image generation']
        
        # Build query string
        query = ' OR '.join(keywords)
        
        url = 'https://newsapi.org/v2/everything'
        params = {
            'q': query,
            'apiKey': self.news_api_key,
            'language': 'en',
            'sortBy': 'publishedAt',
            'pageSize': max_articles
        }
        
        print(f"📰 Searching NewsAPI: '{query[:50]}...'")
        
        try:
            response = requests.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if data['status'] == 'ok':
                articles = data['articles']
                
                # Filter out already processed
                new_articles = []
                for article in articles:
                    source_hash = hashlib.md5(article.get('url', '').encode()).hexdigest()
                    if not self.db.source_exists(source_hash):
                        article['source_hash'] = source_hash
                        new_articles.append(article)
                
                print(f"   ✅ Found {len(new_articles)} new articles")
                return new_articles
            else:
                print(f"   ❌ API Error: {data.get('message')}")
                return []
                
        except Exception as e:
            print(f"   ❌ Request error: {e}")
            return []
    
    def generate_prompt_with_ollama(self, article, model='llama3.2'):
        """Generate image prompts using a two-step process: summary then image prompt"""
        if not ollama:
            return self._fallback_news_prompt(article)
        
        try:
            # Step 1: Generate a summary
            summary_prompt = f"""Create a concise 2-3 sentence summary of this article, focusing on the core concept and any visual elements:
            
            {article.get('title', '')}
            {article.get('description', '')}
            {article.get('content', '')[:1000]}"""
            
            summary_response = ollama.chat(
                model=model,
                messages=[{'role': 'user', 'content': summary_prompt}]
            )
            # Extract the content from the response
            summary = summary_response.get('message', {}).get('content', '').strip()
            if not summary:
                print("   ⚠️  Empty summary received from Ollama, using fallback")
                return self._fallback_news_prompt(article)
            
            # Step 2: Generate image prompt with more specific instructions
            system_prompt = (
    "You are an expert at creating vivid image prompts for AI art generation.\n"
    "Return exactly ONE sentence that STARTS with the exact phrase:\n"
    "\"Create an image of\" and nothing else before it.\n"
    "Do not add introductions, explanations, quotes, or labels.\n"
)

            # Create a cleaner image prompt with clear instructions
            image_prompt = f"""ARTICLE TITLE: {article.get('title', '')}
            
            ARTICLE SUMMARY:
            {summary}
            
            Based on the article above, create a detailed AI image generation prompt that starts with 'Create an image of...'
            
            Include these elements in your response:
            1. Start with 'Create an image of' followed by the main subject
            2. Describe the scene, setting, and any important elements
            3. Specify the style, mood, and lighting
            4. Keep it concise but visually descriptive (2-4 sentences)
            
            Example response:
            Create an image of a futuristic cityscape at night with neon-lit skyscrapers and flying cars, in a cyberpunk art style with vibrant colors and dramatic lighting.
            
            Now create a prompt for the article above:"""
            
            try:
                print("\nSending request to Ollama for image prompt generation...")
                print(f"System prompt: {system_prompt[:200]}...")
                print(f"Image prompt: {image_prompt[:200]}...")
                
                response = ollama.chat(
                    model=model,
                    messages=[
                        {'role': 'system', 'content': system_prompt},
                        {'role': 'user', 'content': image_prompt}
                    ],
                    options={
                        'temperature': 0.7,
                        'max_tokens': 500
                    }
                )
                
                # Debug the response structure
                print("\nRaw Ollama response:")
                print(response)
                
                # Extract the content safely
                if isinstance(response, dict):
                    if 'message' in response and 'content' in response['message']:
                        prompt_text = response['message']['content'].strip()
                    else:
                        # If the response structure is different, try to extract the content directly
                        prompt_text = response.get('content', str(response)).strip()
                else:
                    prompt_text = str(response).strip()
                
                print(f"\nExtracted prompt text: {prompt_text[:200]}...")
                
                # Clean up the prompt text
                prompt_text = prompt_text.strip().strip('"').strip("'")

                # Find the first occurrence of the key phrase if the model wrapped it
                idx = prompt_text.lower().find("create an image of")
                if idx != -1:
                    prompt_text = prompt_text[idx:]
                else:
                    # Fallback: just prepend cleanly
                    prompt_text = f"Create an image of {prompt_text}"

                # Optional: collapse newlines
                prompt_text = " ".join(prompt_text.split())
                
                print("MODEL RAW TEXT:\n", repr(prompt_text))


                # Ensure prompt starts correctly
                if not prompt_text.lower().startswith(('create an image of', 'a ', 'an ')):
                    prompt_text = f"Create an image of {prompt_text[0].lower()}{prompt_text[1:]}"
                elif prompt_text.lower().startswith('an '):
                    prompt_text = f"Create an image of {prompt_text[3:]}"
                elif prompt_text.lower().startswith('a '):
                    prompt_text = f"Create an image of {prompt_text[2:]}"
                    
                # Remove any markdown code blocks if present
                prompt_text = prompt_text.replace('```', '').strip()
                
                print(f"\nFinal prompt: {prompt_text[:200]}...")
                
            except Exception as e:
                print(f"\n⚠️  Error generating image prompt: {e}")
                prompt_text = self._fallback_news_prompt(article).get('prompt_text', '')
                print(f"Using fallback prompt: {prompt_text[:200]}...")
            
            return {
                'title': article.get('title', 'Technical Concept')[:60],
                'description': summary[:200],
                'prompt_text': prompt_text,
                'category': 'TECHNICAL CONCEPT ART'
            }
                
        except Exception as e:
            print(f"   ⚠️  Ollama error: {e}, using fallback")
            return self._fallback_news_prompt(article)
    
    def _fallback_news_prompt(self, article):
        """Fallback if Ollama is not available"""
        title = article.get('title', 'AI Art')
        description = article.get('description', 'Creative visualization')
        
        return {
            'title': title[:60],
            'description': description[:200],
            'prompt_text': f"A detailed image of {title} in a modern digital art style. "
                         f"The scene has dynamic lighting and a vibrant, engaging mood. "
                         f"Use a balanced composition with the main subject prominently featured. "
                         f"Emphasize key visual elements with a colorful, high-contrast palette and smooth digital finish. "
                         f"8k resolution, professional quality, trending on artstation.",
            'category': 'INFOGRAPHIC / EDU VISUAL'
        }
    
    # ==================== UNIFIED COLLECTION ====================
    
    def categorize_prompt(self, text):
        """Auto-categorize based on content"""
        text_lower = text.lower()
        
        if any(word in text_lower for word in ['portrait', 'face', 'person', 'character', 'avatar']):
            return 'PROFILE / AVATAR'
        elif any(word in text_lower for word in ['infographic', 'diagram', 'chart', 'educational', 'tutorial']):
            return 'INFOGRAPHIC / EDU VISUAL'
        elif any(word in text_lower for word in ['thumbnail', 'youtube', 'video cover']):
            return 'YOUTUBE THUMBNAIL'
        elif any(word in text_lower for word in ['comic', 'manga', 'storyboard', 'panel']):
            return 'COMIC / STORYBOARD'
        elif any(word in text_lower for word in ['poster', 'flyer', 'advertisement', 'billboard']):
            return 'POSTER / FLYER'
        elif any(word in text_lower for word in ['app', 'ui', 'interface', 'website', 'logo']):
            return 'APP / WEB'
        else:
            return 'SOCIAL MEDIA POST'
    
    def collect_from_twitter(self, queries=None, max_per_query=10):
        """Collect prompts from Twitter"""
        if not queries:
            queries = ['midjourney prompt', 'stable diffusion prompt', 'AI art prompt']
        
        all_results = []
        for query in queries:
            results = self.search_twitter_prompts(query, max_per_query)
            all_results.extend(results)
            time.sleep(2)
        
        print(f"\n💾 Saving {len(all_results)} Twitter prompts...")
        saved = 0
        
        for i, result in enumerate(all_results):
            title = result['prompt_text'][:60]
            if len(result['prompt_text']) > 60:
                title += '...'
            
            prompt_data = {
                **result,
                'title': title,
                'description': f"AI prompt from @{result['author_handle']}",
                'category': self.categorize_prompt(result['prompt_text']),
                'featured': i < 3,
                'original': True,
            }
            
            if self.db.save_prompt(prompt_data):
                print(f"   ✅ Saved: {title}")
                saved += 1
        
        print(f"✅ Saved {saved} Twitter prompts")
        return saved
    
    def collect_from_news(self, keywords=None, max_articles=10, ollama_model='llama3.2'):
        """Collect articles from NewsAPI and generate prompts with Ollama"""
        articles = self.fetch_news_articles(keywords, max_articles)
        
        if not articles:
            return 0
        
        print(f"\n🤖 Generating prompts with Ollama ({ollama_model})...")
        saved = 0
        
        for i, article in enumerate(articles):
            print(f"   Processing {i+1}/{len(articles)}...")
            print("   Calling generate_prompt_with_ollama...", flush=True)
            try:
                prompt_data = self.generate_prompt_with_ollama(article, ollama_model)
                print(f"   generate_prompt_with_ollama returned: {prompt_data is not None}", flush=True)
                if prompt_data:
                    print(f"   prompt_data keys: {list(prompt_data.keys())}", flush=True)
                    print(f"   prompt_text length: {len(prompt_data.get('prompt_text', ''))} chars", flush=True)
                else:
                    print("   ⚠️  generate_prompt_with_ollama returned None", flush=True)
            except Exception as e:
                print(f"   ❌ Error in generate_prompt_with_ollama: {e}", flush=True)
                prompt_data = None
            
            full_prompt = {
                'source_type': 'news',
                'source_id': article['source_hash'],
                'source_hash': article['source_hash'],
                'title': prompt_data.get('title', article.get('title', '')[:60]),
                'description': prompt_data.get('description', article.get('description', '')[:200]),
                'prompt_text': prompt_data.get('prompt_text', ''),
                'author': article.get('source', {}).get('name', 'News'),
                'author_handle': '',
                'date': article.get('publishedAt', datetime.now().isoformat())[:10],
                'category': prompt_data.get('category', 'SOCIAL MEDIA POST'),
                'featured': saved < 3,
                'original': True,
                'image_url': article.get('urlToImage') or 'https://via.placeholder.com/400x300/667eea/ffffff?text=AI+News',
                'source_url': article.get('url', ''),
                'likes': 0,
                'retweets': 0
            }
            
            if self.db.save_prompt(full_prompt):
                print(f"   ✅ Saved: {full_prompt['title']}")
                saved += 1
            
            time.sleep(0.5)
        
        print(f"✅ Generated {saved} prompts from news")
        return saved
    
    def load_prompts_from_db(self, limit=None):
        """Load prompts from database"""
        prompts = self.db.get_all_prompts(limit=limit)
        
        self.prompts = [
            {
                'id': str(p['id']),
                'source_type': p['source_type'],
                'title': p['title'],
                'description': p['description'],
                'prompt_text': p['prompt_text'],
                'author': p['author'],
                'author_handle': p.get('author_handle', ''),
                'date': p['date'],
                'category': p['category'],
                'featured': bool(p['featured']),
                'original': bool(p['original']),
                'image_url': p['image_url'],
                'source_url': p['source_url'],
                'likes': p.get('likes', 0),
                'retweets': p.get('retweets', 0)
            }
            for p in prompts
        ]
        
        return self.prompts
    
    def generate_html(self, output_file='nano_banana_gallery.html'):
        """Generate the HTML gallery"""
        if not self.prompts:
            self.load_prompts_from_db()
        
        stats = self.db.get_stats()
        
        html_template = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nano Banana Pro Prompts - Hybrid Gallery</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f5f5;
        }
        
        .top-banner {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 20px;
            text-align: center;
            font-weight: 600;
        }
        
        .header {
            background: linear-gradient(135deg, #ff6b9d 0%, #ff8fa3 100%);
            padding: 60px 20px 80px;
            text-align: center;
            position: relative;
        }
        
        h1 {
            font-size: 4em;
            font-weight: 900;
            color: white;
            text-shadow: 4px 4px 0px rgba(0,0,0,0.1);
            letter-spacing: -2px;
        }
        
        .prompts-title {
            font-size: 5em;
            font-weight: 900;
            color: white;
            background: black;
            display: inline-block;
            padding: 10px 30px;
            box-shadow: 8px 8px 0px rgba(0,0,0,0.2);
            position: relative;
        }
        
        .prompts-title::after {
            content: '🔥';
            position: absolute;
            right: -20px;
            top: -20px;
            font-size: 40px;
        }
        
        .stats-bar {
            background: black;
            color: white;
            padding: 15px;
            text-align: center;
            font-weight: 600;
        }
        
        .stats-bar span { margin: 0 15px; }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        
        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            flex-wrap: wrap;
            gap: 20px;
        }
        
        .section-title { font-size: 2.5em; font-weight: 900; }
        
        .total-count {
            background: #FFD700;
            color: black;
            padding: 10px 20px;
            font-weight: 700;
            border: 3px solid black;
            box-shadow: 4px 4px 0px rgba(0,0,0,0.2);
        }
        
        .filters {
            display: flex;
            gap: 10px;
            margin-bottom: 40px;
            flex-wrap: wrap;
        }
        
        .filter-btn {
            padding: 12px 24px;
            border: 2px solid black;
            background: white;
            cursor: pointer;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 13px;
        }
        
        .filter-btn.active { background: #FFD700; }
        
        .gallery {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
            gap: 30px;
        }
        
        .prompt-card {
            background: white;
            border: 4px solid black;
            box-shadow: 8px 8px 0px rgba(0,0,0,0.2);
            position: relative;
            transition: all 0.2s;
        }
        
        .prompt-card:hover {
            transform: translate(-2px, -2px);
            box-shadow: 12px 12px 0px rgba(0,0,0,0.2);
        }
        
        .card-badges {
            position: absolute;
            top: 20px;
            left: 20px;
            display: flex;
            gap: 10px;
            z-index: 5;
            flex-wrap: wrap;
        }
        
        .badge {
            background: white;
            border: 2px solid black;
            padding: 6px 12px;
            font-weight: 700;
            font-size: 11px;
            text-transform: uppercase;
        }
        
        .badge.featured {
            background: #FFD700;
            transform: rotate(-3deg);
        }
        
        .badge.twitter {
            background: #1DA1F2;
            color: white;
        }
        
        .badge.news {
            background: #FF6B6B;
            color: white;
        }
        
        .card-image {
            width: 100%;
            height: 240px;
            object-fit: cover;
            border-bottom: 4px solid black;
        }
        
        .card-content { padding: 25px; }
        
        .card-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            font-size: 13px;
        }
        
        .card-title {
            font-size: 1.5em;
            font-weight: 900;
            margin-bottom: 12px;
            line-height: 1.3;
        }
        
        .card-description {
            color: #555;
            line-height: 1.6;
            margin-bottom: 15px;
        }
        
        .card-prompt-box {
            background: white;
            border: 2px solid black;
            padding: 15px;
            margin: 15px 0;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            line-height: 1.6;
            max-height: 120px;
            overflow-y: auto;
        }
        
        .card-prompt-label {
            background: black;
            color: white;
            padding: 4px 8px;
            font-size: 11px;
            font-weight: 700;
            display: inline-block;
            margin-bottom: 10px;
        }
        
        .card-actions {
            display: flex;
            gap: 10px;
        }
        
        .action-btn {
            flex: 1;
            padding: 15px;
            border: 2px solid black;
            background: black;
            color: white;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .action-btn:hover { background: #333; }
        
        .action-btn.secondary {
            background: white;
            color: black;
            flex: 0 0 50px;
        }
        
        @media (max-width: 768px) {
            h1 { font-size: 2.5em; }
            .prompts-title { font-size: 3em; }
            .gallery { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="top-banner">
        🔥 HYBRID GALLERY: TWITTER + NEWS + AI-GENERATED PROMPTS 🚀
    </div>
    
    <div class="header">
        <div class="header-content">
            <h1>NANO BANANA PRO</h1>
            <div class="prompts-title">PROMPTS</div>
        </div>
    </div>
    
    <div class="stats-bar">
        <span>📊 Total: ''' + str(stats['total_prompts']) + '''</span>
        <span>🐦 Twitter: ''' + str(stats['twitter_prompts']) + '''</span>
        <span>📰 News: ''' + str(stats['news_prompts']) + '''</span>
        <span>❤️ Likes: ''' + str(stats['total_likes']) + '''</span>
    </div>
    
    <div class="container">
        <div class="section-header">
            <h2 class="section-title">ALL PROMPTS</h2>
            <div class="total-count">SHOWING: <span id="totalCount">0</span></div>
        </div>
        
        <div class="filters">
            <button class="filter-btn active" data-filter="all">ALL</button>
            <button class="filter-btn" data-filter="twitter">🐦 TWITTER</button>
            <button class="filter-btn" data-filter="news">📰 NEWS</button>
            <button class="filter-btn" data-category="SOCIAL MEDIA POST">SOCIAL MEDIA</button>
            <button class="filter-btn" data-category="PROFILE / AVATAR">AVATAR</button>
            <button class="filter-btn" data-category="APP / WEB">APP/WEB</button>
        </div>
        
        <div class="gallery" id="gallery"></div>
    </div>
    
    <script>
        const prompts = ''' + json.dumps(self.prompts) + ''';
        let currentFilter = 'all';
        let currentCategory = 'all';
        
        function createCard(prompt) {
            const sourceIcon = prompt.source_type === 'twitter' ? '🐦' : '📰';
            return `
                <div class="prompt-card">
                    <div class="card-badges">
                        <div class="badge ${prompt.source_type}">${sourceIcon} ${prompt.source_type.toUpperCase()}</div>
                        ${prompt.featured ? '<div class="badge featured">FEATURED</div>' : ''}
                    </div>
                    <img src="${prompt.image_url}" alt="${prompt.title}" class="card-image" onerror="this.src='https://via.placeholder.com/400x300/667eea/ffffff?text=Prompt'">
                    <div class="card-content">
                        <div class="card-meta">
                            <span><strong>${prompt.author}</strong></span>
                            ${prompt.likes > 0 ? `<span>❤️ ${prompt.likes}</span>` : ''}
                        </div>
                        <h3 class="card-title">${prompt.title}</h3>
                        <p class="card-description">${prompt.description}</p>
                        <div class="card-prompt-box">
                            <div class="card-prompt-label">PROMPT</div>
                            ${prompt.prompt_text}
                        </div>
                        <div class="card-actions">
                            <button class="action-btn" onclick="window.open('${prompt.source_url}', '_blank')">
                                ${sourceIcon} VIEW SOURCE
                            </button>
                            <button class="action-btn secondary" onclick="copyPrompt('${prompt.id}')">📋</button>
                        </div>
                    </div>
                </div>
            `;
        }
        
        function renderGallery() {
            const gallery = document.getElementById('gallery');
            const totalCount = document.getElementById('totalCount');
            
            let filtered = prompts.filter(prompt => {
                const matchesFilter = currentFilter === 'all' || prompt.source_type === currentFilter;
                const matchesCategory = currentCategory === 'all' || prompt.category === currentCategory;
                return matchesFilter && matchesCategory;
            });
            
            totalCount.textContent = filtered.length;
            gallery.innerHTML = filtered.map(createCard).join('');
        }
        
        function copyPrompt(id) {
            const prompt = prompts.find(p => p.id === id);
            navigator.clipboard.writeText(prompt.prompt_text);
            alert('✅ Prompt copied!');
        }
        
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                if (btn.dataset.filter) {
                    currentFilter = btn.dataset.filter;
                    currentCategory = 'all';
                } else if (btn.dataset.category) {
                    currentCategory = btn.dataset.category;
                    currentFilter = 'all';
                }
                
                renderGallery();
            });
        });
        
        renderGallery();
    </script>
</body>
</html>'''
        
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(html_template)
        
        print(f"\n✅ Gallery created: {output_file}")

def main():
    print("🍌 NANO BANANA HYBRID COLLECTOR")
    print("=" * 60)
    print("Collect prompts from Twitter + Generate from News with Ollama")
    
    # Initialize
    collector = HybridPromptCollector(
        twitter_token=os.getenv('TWITTER_BEARER_TOKEN'),
        news_api_key=os.getenv('NEWS_API_KEY')
    )
    
    # Show stats
    stats = collector.db.get_stats()
    print(f"\n📊 Current Database:")
    print(f"   Total: {stats['total_prompts']}")
    print(f"   Twitter: {stats['twitter_prompts']}")
    print(f"   News: {stats['news_prompts']}")
    
    # Menu
    print(f"\n🎯 Choose Collection Method:")
    print(f"   1. Collect from TWITTER (real prompts)")
    print(f"   2. Generate from NEWS + Ollama (AI-created prompts)")
    print(f"   3. Do BOTH (recommended!)")
    print(f"   4. Just regenerate HTML")
    print(f"   5. Clear database")
    
    choice = input("\nChoice (1/2/3/4/5): ").strip() or "4"
    
    if choice in ["1", "3"]:
        if collector.twitter_client:
            print("\n🐦 Collecting from Twitter...")
            collector.collect_from_twitter(
                queries=['midjourney prompt', 'stable diffusion prompt'],
                max_per_query=10
            )
        else:
            print("\n⚠️  Twitter API not configured (get token at developer.twitter.com)")
    
    if choice in ["2", "3"]:
        if collector.news_api_key and ollama:
            print("\n📰 Generating from News + Ollama...")
            collector.collect_from_news(
                keywords=['midjourney', 'stable diffusion', 'AI art', 'DALL-E'],
                max_articles=5,
                ollama_model='llama3.2'
            )
        else:
            print("\n⚠️  Need NewsAPI key + Ollama installed")
    
    if choice == "5":
        if input("Clear ALL data? (yes/no): ").lower() == 'yes':
            conn = sqlite3.connect(collector.db.db_path)
            cursor = conn.cursor()
            cursor.execute('DELETE FROM prompts')
            cursor.execute('DELETE FROM processed_sources')
            conn.commit()
            conn.close()
            print("✅ Database cleared")
            return
    
    # Generate HTML
    print(f"\n🎨 Generating gallery...")
    collector.load_prompts_from_db()
    collector.generate_html()
    
    # Final stats
    stats = collector.db.get_stats()
    print(f"\n📊 Final Stats:")
    print(f"   Total: {stats['total_prompts']}")
    print(f"   Twitter: {stats['twitter_prompts']}")
    print(f"   News-generated: {stats['news_prompts']}")
    
    print("\n🎉 Done! Open 'nano_banana_gallery.html'")
    print("\n💡 Setup:")
    print("   Twitter: export TWITTER_BEARER_TOKEN='...'")
    print("   News: export NEWS_API_KEY='...'")
    print("   Ollama: ollama pull llama3.2")

if __name__ == "__main__":
    main()