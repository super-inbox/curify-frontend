import json
import requests
import time
import hashlib
import re
import os
import csv
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple, Union
from bs4 import BeautifulSoup
from urllib.parse import urlparse, parse_qs

# Try to import YouTubeTranscriptApi with error handling
try:
    from youtube_transcript_api import YouTubeTranscriptApi
    from youtube_transcript_api._errors import TranscriptsDisabled, NoTranscriptFound
    YOUTUBE_TRANSCRIPT_AVAILABLE = True
except ImportError:
    YouTubeTranscriptApi = None
    YOUTUBE_TRANSCRIPT_AVAILABLE = False
    print("⚠️  youtube-transcript-api not installed. Install with: pip install youtube-transcript-api")

# Twitter API v2 is now used directly via requests

# Try to import ollama with error handling
try:
    import ollama
    OLLAMA_AVAILABLE = True
except ImportError:
    ollama = None
    OLLAMA_AVAILABLE = False
    print("⚠️  ollama not installed. Install with: pip install ollama")

from database.models import NanoBananaDatabase
from config import TWITTER_BEARER_TOKEN, NEWS_API_KEY, YOUTUBE_API_KEY, DEFAULT_CATEGORY, DATABASE_PATH

class HybridPromptCollector:
    def __init__(self, twitter_token: str = None, news_api_key: str = None, 
                 db_path: str = None, youtube_api_key: str = None, 
                 data_dir: str = 'data'):
        """
        Initialize the HybridPromptCollector with API tokens and database connection.
        
        Args:
            twitter_token: Twitter API bearer token
            news_api_key: News API key
            db_path: Path to SQLite database file
            youtube_api_key: YouTube Data API key (optional for search)
            data_dir: Directory to store CSV fallback files
        """
        self.twitter_token = twitter_token or TWITTER_BEARER_TOKEN
        self.news_api_key = news_api_key or NEWS_API_KEY
        self.youtube_api_key = youtube_api_key or YOUTUBE_API_KEY
        self.db = NanoBananaDatabase(db_path or DATABASE_PATH)
        self.prompts = []
        
        # Set up data directory for CSV fallback
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(exist_ok=True)
        self.twitter_csv_path = self.data_dir / 'twitter_posts.csv'
        
        # Twitter API v2 is used directly via requests
        # No need for tweepy client initialization
        if not self.twitter_token:
            print("⚠️  Twitter API token not properly configured. Will use CSV fallback if available.")
        
        # Check for YouTube dependencies
        if not YOUTUBE_TRANSCRIPT_AVAILABLE:
            print("⚠️  YouTube transcript functionality not available. Install youtube-transcript-api.")
            
    def run(self, query: str = None, max_results: int = 5) -> Dict[str, List[Dict[str, Any]]]:
        """
        Run the prompt collection from all available sources.
        
        Args:
            query: Search query (for Twitter and News API)
            max_results: Maximum number of results per source
            
        Returns:
            Dictionary containing collected prompts from all sources
        """
        print(f"🔍 Running collection with query: {query if query else 'None'}")
        
        results = {
            'twitter': [],
            'news': [],
            'hackernews': [],
            'youtube': [],
            'total_collected': 0
        }
        
        if query:
            # Collect from Twitter if token is available
            if self.twitter_token:
                print(f"🔍 Collecting from Twitter with query: {query}")
                twitter_results = self.collect_from_twitter(query, max_results)
                results['twitter'] = twitter_results
            else:
                print("⚠️  Twitter API token not configured. Skipping Twitter collection.")
                results['twitter'] = []
            
            results['total_collected'] += len(results['twitter'])
            
            # Collect from News
            if self.news_api_key:
                print(f"📰 Collecting news with query: {query}")
                try:
                    news_results = self.collect_from_news(query, max_results)
                    results['news'] = news_results
                    results['total_collected'] += len(news_results)
                except Exception as e:
                    print(f"⚠️  News API Error: {str(e)}")
                    print("ℹ️  Continuing without news data...")
        
        # Always try to get Hacker News (no query needed)
        print("🖥️  Collecting top stories from Hacker News")
        try:
            hn_results = self.collect_from_hackernews(max_results)
            results['hackernews'] = hn_results
            results['total_collected'] += len(hn_results)
        except Exception as e:
            print(f"⚠️  Error collecting from Hacker News: {str(e)}")
        
        # Collect from YouTube if API key is available
        if self.youtube_api_key and YOUTUBE_TRANSCRIPT_AVAILABLE:
            print("🎥 Collecting from YouTube")
            try:
                youtube_results = self.collect_from_youtube(
                    search_query=query or "nano banna prompts",
                    max_results=max_results
                )
                results['youtube'] = youtube_results
                results['total_collected'] += len(youtube_results)
            except Exception as e:
                print(f"⚠️  Error collecting from YouTube: {str(e)}")
        
        print(f"\n✅ Collection complete. Total collected: {results['total_collected']}")
        return results
    
    def _save_tweets_to_csv(self, tweets_data: List[Dict[str, Any]]) -> None:
        """Save tweets to CSV file for fallback purposes.
        
        Args:
            tweets_data: List of tweet data dictionaries
        """
        if not tweets_data:
            return
            
        file_exists = self.twitter_csv_path.exists()
        
        with open(self.twitter_csv_path, 'a', newline='', encoding='utf-8') as csvfile:
            fieldnames = [
                'source_id', 'title', 'description', 'prompt_text', 'author',
                'author_handle', 'date', 'category', 'source_url', 'likes', 'retweets', 'source_hash'
            ]
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            if not file_exists:
                writer.writeheader()
            
            for tweet in tweets_data:
                # Only write if tweet with same ID doesn't exist
                if not self._tweet_exists_in_csv(tweet['source_id']):
                    writer.writerow(tweet)
    
    def _tweet_exists_in_csv(self, tweet_id: str) -> bool:
        """Check if a tweet with the given ID exists in the CSV.
        
        Args:
            tweet_id: The tweet ID to check
            
        Returns:
            bool: True if tweet exists, False otherwise
        """
        if not self.twitter_csv_path.exists():
            return False
            
        try:
            with open(self.twitter_csv_path, 'r', newline='', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                return any(row['source_id'] == tweet_id for row in reader)
        except Exception as e:
            print(f"⚠️  Error checking tweet in CSV: {str(e)}")
            return False
    
    def _get_tweets_from_csv(self, query: str = None, max_results: int = 10) -> List[Dict[str, Any]]:
        """Get tweets from CSV fallback file.
        
        Args:
            query: Optional search query to filter tweets
            max_results: Maximum number of results to return
            
        Returns:
            List of tweet data dictionaries
        """
        if not self.twitter_csv_path.exists():
            return []
            
        tweets = []
        
        try:
            with open(self.twitter_csv_path, 'r', newline='', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                for row in reader:
                    if query and query.lower() not in row['prompt_text'].lower():
                        continue
                    tweets.append(dict(row))
                    if len(tweets) >= max_results:
                        break
        except Exception as e:
            print(f"⚠️  Error reading from CSV fallback: {str(e)}")
            
        return tweets
    
    def _make_twitter_request(self, url: str, params: Dict, max_retries: int = 3, retry_delay: int = 60) -> Optional[Dict]:
        """
        Make a request to the Twitter API with retry logic and rate limit handling.
        
        Args:
            url: API endpoint URL
            params: Request parameters
            max_retries: Maximum number of retry attempts
            retry_delay: Initial delay between retries in seconds (will increase with each retry)
            
        Returns:
            JSON response data or None if all retries fail
        """
        headers = {
            'Authorization': f'Bearer {self.twitter_token}',
            'User-Agent': 'NanoBananaPromptCollector/1.0'
        }
        
        for attempt in range(max_retries):
            try:
                response = requests.get(url, headers=headers, params=params, timeout=30)
                
                # Check for rate limiting (429)
                if response.status_code == 429:
                    retry_after = int(response.headers.get('x-rate-limit-reset', 300))  # Default to 5 minutes
                    wait_time = retry_after - int(time.time()) + 5  # Add 5 seconds buffer
                    if wait_time < 0:
                        wait_time = retry_delay * (attempt + 1)  # Fallback to exponential backoff
                    
                    print(f"⚠️  Rate limited. Waiting {wait_time} seconds before retry... (Attempt {attempt + 1}/{max_retries})")
                    time.sleep(wait_time)
                    continue
                    
                # Handle other HTTP errors
                response.raise_for_status()
                return response.json()
                
            except requests.exceptions.RequestException as e:
                if attempt == max_retries - 1:  # Last attempt
                    print(f"⚠️  Twitter API request failed after {max_retries} attempts: {str(e)}")
                    return None
                
                wait_time = retry_delay * (attempt + 1)  # Exponential backoff
                print(f"⚠️  Request failed: {str(e)}. Retrying in {wait_time} seconds... (Attempt {attempt + 1}/{max_retries})")
                time.sleep(wait_time)
        
        return None

    def collect_from_twitter(self, query: str, max_results: int = 10) -> List[Dict[str, Any]]:
        """
        Collect tweets from Twitter API v2 based on a search query.
        
        Args:
            query: Search query for tweets
            max_results: Maximum number of results to return (between 10 and 100)
            
        Returns:
            List of collected tweets
        """
        max_results = max(10, min(100, max_results))  # Clamp between 10 and 100
        
        if not self.twitter_token:
            print("⚠️  Twitter API token not properly configured. Will use CSV fallback if available.")
            return self._process_csv_fallback(query, max_results) if hasattr(self, '_process_csv_fallback') else []
        
        try:
            # Twitter API v2 endpoint for recent search
            url = 'https://api.twitter.com/2/tweets/search/recent'
            
            # Set up query parameters with specific hashtags
            params = {
                'query': 'Nano Banana Pro Prompt: lang:en -is:retweet',
                'max_results': min(max_results, 100),  # Max 100 results per request
                'tweet.fields': 'author_id,created_at,public_metrics,text,entities',
                'user.fields': 'name,username,profile_image_url',
                'expansions': 'author_id'
            }
            
            # Make the request with retry logic
            data = self._make_twitter_request(url, params)
            if data is None:
                print("⚠️  Failed to fetch data from Twitter API after multiple attempts")
                return self._process_csv_fallback(query, max_results) if hasattr(self, '_process_csv_fallback') else []
            
            # Process the response
            if 'data' not in data or not data['data']:
                print("ℹ️  No tweets found matching the query")
                return []
            
            # Process users data
            users = {user['id']: user for user in data.get('includes', {}).get('users', [])}
            collected_prompts = []
            
            for tweet in data['data']:
                author = users.get(tweet.get('author_id', ''), {})
                
                prompt_data = {
                    'source_type': 'twitter',
                    'source_id': tweet['id'],
                    'title': tweet['text'][:100] + '...' if len(tweet['text']) > 100 else tweet['text'],
                    'description': tweet['text'],
                    'prompt_text': tweet['text'],
                    'author': author.get('name', 'Unknown'),
                    'author_handle': f"@{author.get('username', '')}",
                    'date': tweet.get('created_at', ''),
                    'category': 'SOCIAL MEDIA',
                    'source_url': f"https://twitter.com/i/web/status/{tweet['id']}",
                    'image_url': '',
                    'likes': tweet.get('public_metrics', {}).get('like_count', 0),
                    'retweets': tweet.get('public_metrics', {}).get('retweet_count', 0),
                    'source_hash': self._generate_hash(f"twitter_{tweet['id']}")
                }
                
                # Save to database
                prompt_id = self.db.save_prompt(prompt_data)
                if prompt_id:
                    prompt_data['id'] = prompt_id
                    collected_prompts.append(prompt_data)
            
            print(f"✅ Collected {len(collected_prompts)} tweets")
            return collected_prompts
            
        except requests.exceptions.RequestException as e:
            print(f"⚠️  Twitter API connection error: {str(e)}")
            print("ℹ️  Falling back to CSV if available...")
            return self._process_csv_fallback(query, max_results) if hasattr(self, '_process_csv_fallback') else []
        except Exception as e:
            print(f"⚠️  Error collecting from Twitter: {str(e)}")
            return self._process_csv_fallback(query, max_results) if hasattr(self, '_process_csv_fallback') else []
    
    def _process_twitter_response(self, json_response: Dict) -> List[Dict]:
        """Process Twitter API response and return list of formatted prompt data."""
        prompts = []
        
        # Create user lookup dictionary
        users = {user['id']: user for user in json_response.get('includes', {}).get('users', [])}
        
        for tweet in json_response['data']:
            user = users.get(tweet.get('author_id', ''), {})
            created_at = tweet.get('created_at', datetime.utcnow().isoformat())
            public_metrics = tweet.get('public_metrics', {})
            
            prompt_data = {
                'source_type': 'twitter',
                'source_id': str(tweet['id']),
                'title': f"Tweet by {user.get('username', 'Unknown')}",
                'description': tweet['text'][:200] + '...' if len(tweet['text']) > 200 else tweet['text'],
                'prompt_text': tweet['text'],
                'author': user.get('name', 'Unknown'),
                'author_handle': f"@{user.get('username', '')}",
                'date': created_at,
                'category': DEFAULT_CATEGORY,
                'source_url': f"https://twitter.com/{user.get('username', '')}/status/{tweet['id']}",
                'likes': public_metrics.get('like_count', 0),
                'retweets': public_metrics.get('retweet_count', 0),
                'replies': public_metrics.get('reply_count', 0),
                'source_hash': self._generate_hash(f"twitter_{tweet['id']}")
            }
            
            # Save to database
            prompt_id = self.db.save_prompt(prompt_data)
            if prompt_id:
                prompt_data['id'] = prompt_id
                prompts.append(prompt_data)
        
        return prompts

    def _process_csv_fallback(self, query: str, max_results: int) -> List[Dict]:
        """Process CSV fallback when Twitter API is not available."""
        collected_prompts = []
        
        if not self.twitter_csv_path.exists():
            print("""ℹ️  No CSV fallback file found.
To create a CSV fallback file:
1. Create a 'data' directory in the project root
2. Add a 'twitter_posts.csv' file with columns: 'text','author','created_at','likes','retweets'
3. Add your tweet data to the CSV file
            """)
            return collected_prompts
            
        print("ℹ️  Using CSV fallback for Twitter data...")
        csv_tweets = self._get_tweets_from_csv(query, max_results)
        
        # Process CSV tweets
        for tweet in csv_tweets:
            if len(collected_prompts) >= max_results:
                break
                
            # Convert string numbers back to integers
            tweet['likes'] = int(tweet.get('likes', 0))
            tweet['retweets'] = int(tweet.get('retweets', 0))
            
            # Save to database if not already there
            if not self.db.get_prompt_by_source_id(tweet.get('source_id', '')):
                prompt_id = self.db.save_prompt(tweet)
                if prompt_id:
                    tweet['id'] = prompt_id
            
            collected_prompts.append(tweet)
        
        if collected_prompts:
            print(f"✅ Retrieved {len(collected_prompts)} tweets from CSV fallback")
        else:
            print("ℹ️  No matching tweets found in CSV fallback")
        
        return collected_prompts
    
    def _generate_hash(self, text: str) -> str:
        """Generate a hash for a given text."""
        return hashlib.md5(text.encode('utf-8')).hexdigest()
        
    # Fixed version of the YouTube collection method

    def collect_from_youtube(self, search_query: str = " nano banana prompts", max_results: int = 5) -> List[Dict[str, Any]]:
        """
        Collect prompts from YouTube videos by searching for a query and analyzing transcripts.
        """
        if not self.youtube_api_key:
            print("⚠️  YouTube API key not configured. Please set YOUTUBE_API_KEY environment variable.")
            return []
            
        if not YOUTUBE_TRANSCRIPT_AVAILABLE:
            print("⚠️  youtube-transcript-api not installed. Install with: pip install youtube-transcript-api")
            return []

        print(f"🎥 Searching YouTube for: {search_query}")

        try:
            # Search for videos
            search_url = "https://www.googleapis.com/youtube/v3/search"
            params = {
                'part': 'snippet',
                'q': search_query,
                'type': 'video',
                'maxResults': min(max_results, 25),  # Increased to account for filtering
                'key': self.youtube_api_key
            }
            
            response = requests.get(search_url, params=params, timeout=10)
            response.raise_for_status()
            search_results = response.json()
            
            if not search_results.get('items'):
                print("ℹ️  No videos found for the given query.")
                return []
                
            collected_prompts = []
            
            for item in search_results['items']:
                video_id = item['id']['videoId']
                video_title = item['snippet']['title']
                channel_title = item['snippet']['channelTitle']
                published_at = item['snippet']['publishedAt']
                video_url = f"https://www.youtube.com/watch?v={video_id}"
                
                try:
                    # Get video details for duration
                    video_details_url = "https://www.googleapis.com/youtube/v3/videos"
                    video_params = {
                        'part': 'contentDetails',
                        'id': video_id,
                        'key': self.youtube_api_key
                    }
                    video_response = requests.get(video_details_url, params=video_params, timeout=10)
                    video_response.raise_for_status()
                    video_details = video_response.json()
                    
                    if not video_details.get('items'):
                        continue
                        
                    duration = video_details['items'][0]['contentDetails']['duration']
                    # Skip videos longer than 30 minutes
                    if self._parse_duration(duration) > 30 * 60:
                        print(f"⏭️  Skipping long video: {video_title} ({duration})")
                        continue
                    
                    # Get transcript using the new fetch() method with improved error handling
                    try:
                        from youtube_transcript_api import YouTubeTranscriptApi
                        
                        ytt_api = YouTubeTranscriptApi()
                        # Try to get transcript with preferred languages first
                        try:
                            captions = ytt_api.fetch(video_id, languages=['en', 'en-US', 'en-GB'])
                        except Exception:
                            # Fallback to any available transcript
                            captions = ytt_api.fetch(video_id)
                        
                        # Format transcript with timestamps (for debugging/logging)
                        transcript_segments = []
                        for line in captions:
                            start_time = line.start
                            duration = line.duration
                            text = line.text
                            timestamp = f"[{start_time:.2f}s-{start_time + duration:.2f}s]"
                            transcript_segments.append(f"{timestamp} {text}")
                        transcript_text = "\n".join(transcript_segments)
                        
                        # Convert to list of dicts for compatibility with existing code
                        transcript_data = [
                            {'text': line.text, 'start': line.start, 'duration': line.duration}
                            for line in captions
                        ]
                        
                        # Extract prompts from the formatted transcript data
                        prompts = self._extract_prompts_from_transcript(transcript_data)
                        
                    except Exception as e:
                        print(f"⚠️  Error getting transcript for video {video_id}: {str(e)}")
                        continue
                    
                    if not prompts:
                        print(f"ℹ️  No prompts found in video: {video_title}")
                        continue
                        
                    # Create a prompt entry for each found prompt
                    for i, prompt_text in enumerate(prompts[:5]):  # Limit to top 5 prompts per video
                        prompt_data = {
                            'source_type': 'youtube',
                            'source_id': f"{video_id}_{i}",
                            'title': f"{video_title} - Prompt {i+1}",
                            'description': f"Prompt from video by {channel_title}",
                            'prompt_text': prompt_text,
                            'author': channel_title,
                            'author_handle': channel_title,
                            'date': published_at,
                            'category': 'YOUTUBE_PROMPT',
                            'source_url': video_url,
                            'likes': 0,
                            'retweets': 0,
                            'source_hash': self._generate_hash(f"youtube_{video_id}_{i}")
                        }
                        
                        # Save to database
                        prompt_id = self.db.save_prompt(prompt_data)
                        if prompt_id:
                            prompt_data['id'] = prompt_id
                            collected_prompts.append(prompt_data)
                            print(f"✅ Found prompt in: {video_title}")
                            
                except Exception as e:
                    print(f"⚠️  Error processing video {video_id}: {str(e)}")
                    continue
                    
            print(f"✅ Collected {len(collected_prompts)} prompts from {len(search_results['items'])} YouTube videos")
            return collected_prompts
            
        except Exception as e:
            print(f"⚠️  Error collecting from YouTube: {str(e)}")
            return []


    def _extract_prompts_from_transcript(self, transcript: Any) -> List[str]:
        """
        Extract potential prompts from a YouTube video transcript.
        Improved to capture more context and better identify prompts.
        
        Args:
            transcript: Either a list of dicts or a FetchedTranscriptSnippet object
        """
        prompts = []
        
        # Handle both dict-style and object-style transcript formats
        if hasattr(transcript, 'fetch'):  # It's a FetchedTranscriptSnippet
            full_text = ' '.join([entry.text for entry in transcript.fetch()])
        elif isinstance(transcript, (list, tuple)) and transcript and hasattr(transcript[0], 'text'):  # List of objects with text attribute
            full_text = ' '.join([entry.text for entry in transcript])
        elif isinstance(transcript, (list, tuple)) and transcript and isinstance(transcript[0], dict):  # List of dicts
            full_text = ' '.join([entry.get('text', '') for entry in transcript])
        else:
            print(f"⚠️  Unknown transcript format: {type(transcript)}")
            return []
        
        # Split into sentences
        sentences = re.split(r'[.!?]+', full_text)
        
        current_prompt = []
        in_prompt = False
        
        for sentence in sentences:
            sentence = sentence.strip()
            if not sentence:
                continue
                
            # Look for prompt indicators
            prompt_indicators = [
                'prompt:', 'prompt is', 'prompt -', 'the prompt',
                'use this prompt', 'here\'s the prompt', 'copy this prompt',
                'my prompt', 'this prompt', 'prompt would be'
            ]
            
            if any(indicator in sentence.lower() for indicator in prompt_indicators):
                # Save previous prompt if exists
                if current_prompt:
                    prompt_text = ' '.join(current_prompt).strip()
                    if len(prompt_text.split()) > 5:  # At least 5 words
                        prompts.append(prompt_text)
                
                # Start new prompt
                current_prompt = [sentence]
                in_prompt = True
            elif in_prompt:
                # Continue building current prompt
                current_prompt.append(sentence)
                
                # End prompt if we've collected enough or hit a topic change
                if len(' '.join(current_prompt).split()) > 50:  # Max 50 words per prompt
                    prompt_text = ' '.join(current_prompt).strip()
                    prompts.append(prompt_text)
                    current_prompt = []
                    in_prompt = False
        
        # Add any remaining prompt
        if current_prompt:
            prompt_text = ' '.join(current_prompt).strip()
            if len(prompt_text.split()) > 5:
                prompts.append(prompt_text)
        
        # If no prompts found with indicators, look for descriptive sentences
        if not prompts:
            for sentence in sentences:
                sentence = sentence.strip()
                # Look for sentences that sound like image descriptions
                if (len(sentence.split()) > 10 and 
                    any(word in sentence.lower() for word in ['create', 'image', 'generate', 'photo', 'picture', 'scene', 'showing'])):
                    prompts.append(sentence)
        
        return prompts[:10]  # Return max 10 prompts
    
    def _parse_duration(self, duration: str) -> int:
        """Parse ISO 8601 duration to seconds."""
        match = re.match(r'^PT(?:\d+H)?(?:\d+M)?(?:\d+S)?$', duration)
        if not match:
            return 0
            
        hours = 0
        minutes = 0
        seconds = 0
        
        # Extract hours
        h_match = re.search(r'(\d+)H', duration)
        if h_match:
            hours = int(h_match.group(1))
            
        # Extract minutes
        m_match = re.search(r'(\d+)M', duration)
        if m_match:
            minutes = int(m_match.group(1))
            
        # Extract seconds
        s_match = re.search(r'(\d+)S', duration)
        if s_match:
            seconds = int(s_match.group(1))
            
        return hours * 3600 + minutes * 60 + seconds
        
        
    def _extract_video_id(self, url: str) -> Optional[str]:
        """Extract video ID from YouTube URL."""
        patterns = [
            r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/e\/|youtube\.com\/watch\?.*&v=)([^#&?\n\"]+)',
            r'^([a-zA-Z0-9_-]{11})$'  # Just the video ID
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        return None
        
        


class PromptCollector:
    def __init__(self, db, youtube_api_key: Optional[str] = None):
        self.db = db
        self.youtube_api_key = youtube_api_key or os.getenv("YOUTUBE_API_KEY")

    def collect_from_youtube(
        self,
        search_query: str = "nano banana prompts",
        max_results: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Collect prompts from YouTube videos by searching for a query and analyzing transcripts.
        """
        if not self.youtube_api_key:
            print("⚠️  YouTube API key not configured. Please set YOUTUBE_API_KEY environment variable.")
            return []

        if not YOUTUBE_TRANSCRIPT_AVAILABLE or not YouTubeTranscriptApi:
            print("⚠️  youtube-transcript-api not installed or disabled. Install with: pip install youtube-transcript-api")
            return []

        print(f"🎥 Searching YouTube for: {search_query}")

        try:
            # Search for videos
            search_url = "https://www.googleapis.com/youtube/v3/search"
            params = {
                "part": "snippet",
                "q": search_query,
                "type": "video",
                "maxResults": min(max_results, 10),  # API limit [web:27]
                "key": self.youtube_api_key,
            }

            response = requests.get(search_url, params=params, timeout=10)
            response.raise_for_status()
            search_results = response.json()

            if not search_results.get("items"):
                print("ℹ️  No videos found for the given query.")
                return []

            collected_prompts: List[Dict[str, Any]] = []

            for item in search_results["items"]:
                video_id = item["id"]["videoId"]
                video_title = item["snippet"]["title"]
                channel_title = item["snippet"]["channelTitle"]
                published_at = item["snippet"]["publishedAt"]
                video_watch_url = f"https://www.youtube.com/watch?v={video_id}"

                try:
                    # Get video details (duration) [web:25][web:29]
                    video_details_url = "https://www.googleapis.com/youtube/v3/videos"
                    video_params = {
                        "part": "contentDetails",
                        "id": video_id,
                        "key": self.youtube_api_key,
                    }
                    video_response = requests.get(video_details_url, params=video_params, timeout=10)
                    video_response.raise_for_status()
                    video_details = video_response.json()

                    if not video_details.get("items"):
                        continue

                    duration_str = video_details["items"][0]["contentDetails"]["duration"]
                    if self._parse_duration(duration_str) > 30 * 60:
                        print(f"⏭️  Skipping long video: {video_title} ({duration_str})")
                        continue

                    # Get transcript with improved error handling and fallbacks
                    from youtube_transcript_api import YouTubeTranscriptApi
                    from youtube_transcript_api.formatters import TextFormatter
                    
                    # Create a formatter to get plain text
                    formatter = TextFormatter()
                    
                    try:
                        # Try to get English transcript first
                        transcript_data = YouTubeTranscriptApi().fetch(
                            video_id, 
                            languages=['en', 'en-US', 'en-GB']
                        )
                        transcript_text = formatter.format_transcript(transcript_data)
                        prompts = self._extract_prompts_from_transcript(transcript_data)
                        
                    except Exception as e:
                        print(f"⚠️  No English transcript available for video {video_id}: {str(e)}")
                        # Try to get any available transcript as fallback
                        try:
                            transcript_data = YouTubeTranscriptApi().fetch(video_id)
                            transcript_text = formatter.format_transcript(transcript_data)
                            prompts = self._extract_prompts_from_transcript(transcript_data)
                        except Exception as e2:
                            print(f"⚠️  Could not find any transcript for video {video_id}: {str(e2)}")
                            prompts = []
                    except Exception as e:
                        print(f"⚠️  Error getting transcript for video {video_id}: {str(e)}")
                        prompts = []

                    if not prompts:
                        print(f"ℹ️  No prompts found in video: {video_title}")
                        continue

                    # Extract prompts from transcript
                    prompts = self._extract_prompts_from_transcript(transcript_chunks)
                    if not prompts:
                        print(f"ℹ️  No prompts found in video: {video_title}")
                        continue

                    # Create a prompt entry for each found prompt
                    for i, prompt_text in enumerate(prompts[:5]):  # Limit to top 5 prompts per video
                        prompt_data: Dict[str, Any] = {
                            "source_type": "youtube",
                            "source_id": f"{video_id}_{i}",
                            "title": f"{video_title} - Prompt {i + 1}",
                            "description": f"Prompt from video by {channel_title}",
                            "prompt_text": prompt_text,
                            "author": channel_title,
                            "author_handle": channel_title,
                            "date": published_at,
                            "category": "YOUTUBE_PROMPT",
                            "source_url": video_watch_url,
                            "likes": 0,
                            "retweets": 0,
                            "source_hash": self._generate_hash(f"youtube_{video_id}_{i}"),
                        }

                        # Save to database
                        prompt_id = self.db.save_prompt(prompt_data)
                        if prompt_id:
                            prompt_data["id"] = prompt_id
                            collected_prompts.append(prompt_data)

                except Exception as e:
                    print(f"⚠️  Error processing video {video_id}: {str(e)}")
                    continue

            print(
                f"✅ Collected {len(collected_prompts)} prompts from {len(search_results['items'])} YouTube videos"
            )
            return collected_prompts

        except Exception as e:
            print(f"⚠️  Error collecting from YouTube: {str(e)}")
            return []

    def _parse_duration(self, duration: str) -> int:
        """
        Parse ISO 8601 duration (e.g. 'PT4M13S') to seconds. [web:25][web:31]
        """
        match = re.match(r"^PT(?:\d+H)?(?:\d+M)?(?:\d+S)?$", duration)
        if not match:
            return 0

        hours = 0
        minutes = 0
        seconds = 0

        h_match = re.search(r"(\d+)H", duration)
        if h_match:
            hours = int(h_match.group(1))

        m_match = re.search(r"(\d+)M", duration)
        if m_match:
            minutes = int(m_match.group(1))

        s_match = re.search(r"(\d+)S", duration)
        if s_match:
            seconds = int(s_match.group(1))

        return hours * 3600 + minutes * 60 + seconds

    def _extract_prompts_from_transcript(self, transcript: Any) -> List[str]:
        """
        Extract potential prompts from a YouTube video transcript.
        Improved to capture more context and better identify prompts.
        
        Args:
            transcript: Either a list of dicts or a FetchedTranscriptSnippet object
        """
        prompts = []
        
        # Handle both dict-style and object-style transcript formats
        if hasattr(transcript, 'fetch'):  # It's a FetchedTranscriptSnippet
            full_text = ' '.join([entry.text for entry in transcript.fetch()])
        elif isinstance(transcript, (list, tuple)) and transcript and hasattr(transcript[0], 'text'):  # List of objects with text attribute
            full_text = ' '.join([entry.text for entry in transcript])
        elif isinstance(transcript, (list, tuple)) and transcript and isinstance(transcript[0], dict):  # List of dicts
            full_text = ' '.join([entry.get('text', '') for entry in transcript])
        else:
            print(f"⚠️  Unknown transcript format: {type(transcript)}")
            return []
        
        # Split into sentences
        sentences = re.split(r'[.!?]+', full_text)
        
        current_prompt = []
        in_prompt = False
        
        for sentence in sentences:
            sentence = sentence.strip()
            if not sentence:
                continue
                
            # Look for prompt indicators
            prompt_indicators = [
                'prompt:', 'prompt is', 'prompt -', 'the prompt',
                'use this prompt', 'here\'s the prompt', 'copy this prompt',
                'my prompt', 'this prompt', 'prompt would be'
            ]
            
            if any(indicator in sentence.lower() for indicator in prompt_indicators):
                # Save previous prompt if exists
                if current_prompt:
                    prompt_text = ' '.join(current_prompt).strip()
                    if len(prompt_text.split()) > 5:  # At least 5 words
                        prompts.append(prompt_text)
                
                # Start new prompt
                current_prompt = [sentence]
                in_prompt = True
            elif in_prompt:
                # Continue building current prompt
                current_prompt.append(sentence)
                
                # End prompt if we've collected enough or hit a topic change
                if len(' '.join(current_prompt).split()) > 50:  # Max 50 words per prompt
                    prompt_text = ' '.join(current_prompt).strip()
                    prompts.append(prompt_text)
                    current_prompt = []
                    in_prompt = False
        
        # Add any remaining prompt
        if current_prompt:
            prompt_text = ' '.join(current_prompt).strip()
            if len(prompt_text.split()) > 5:
                prompts.append(prompt_text)
        
        # If no prompts found with indicators, look for descriptive sentences
        if not prompts:
            for sentence in sentences:
                sentence = sentence.strip()
                # Look for sentences that sound like image descriptions
                if (len(sentence.split()) > 10 and 
                    any(word in sentence.lower() for word in ['create', 'image', 'generate', 'photo', 'picture', 'scene', 'showing'])):
                    prompts.append(sentence)
        
        return prompts[:10]  # Return max 10 prompts

    def extract_article_content(self, url: str) -> Optional[str]:
        """
        Extract main text content from a URL using BeautifulSoup.
        """
        try:
            response = requests.get(
                url,
                timeout=10,
                headers={"User-Agent": "Mozilla/5.0"},
            )
            response.raise_for_status()
            soup = BeautifulSoup(response.text, "html.parser")

            # Remove script and style elements
            for script in soup(["script", "style", "nav", "footer"]):
                script.decompose()

            text = soup.get_text(separator="\n", strip=True)
            return text[:10000]
        except Exception as e:
            print(f"⚠️  Error extracting content from {url}: {str(e)}")
            return None

    def _generate_hash(self, value: str) -> str:
        """
        Placeholder hash generator.
        Replace with your real implementation.
        """
        import hashlib

        return hashlib.sha256(value.encode("utf-8")).hexdigest()


    def generate_prompt_with_ollama(self, article_content: str) -> tuple[str, str]:
        """Generate a title and prompt using Ollama"""
        if not article_content:
            return "Untitled Article", "No content available for this article."
        
        try:
            # Generate a title
            title_response = ollama.generate(
                model="llama2",  # or your preferred model
                prompt=f"Generate a concise, informative title for this article in 10 words or less. Return only the title, nothing else.\n\n{article_content[:2000]}"  # Use first 2000 chars for context
            )
            title = title_response['response'].strip('\'" \n')
            
            # Generate a prompt
            prompt_response = ollama.generate(
                model="llama2",
                prompt=f""" Create a detailed image generation prompt based on this article. The prompt should:
    1. Start with "Create an image of" followed by a clear visual description
2. Describe the main subject and setting in detail
3. Include 2-3 specific visual elements from the article
4. Specify the art style (e.g., digital art, watercolor, cyberpunk, etc.)
5. Set the mood/atmosphere
6. Include lighting and composition details
Example format:
"Create an image of [main subject] in [setting], [action/description]. [Visual elements]. [Art style] with [mood/atmosphere]. [Lighting and composition details]."
Article content:
{article_content[:2000]}
Now create an image prompt following the format above:""",
            options={
                'temperature': 0.8,
                'max_tokens': 150
            }
            )
            prompt = prompt_response['response'].strip()
            
            return title, prompt
        except Exception as e:
            print(f"⚠️  Error generating content with Ollama: {str(e)}")
            return "Untitled Article", "Could not generate prompt for this article."

    def _matches_search_query(self, text: str) -> bool:
        """Check if text contains any of the search keywords."""
        if not text:
            return False
            
        search_queries = [
            "prompts",
            "nano banana prompts"
        ]
        
        text_lower = text.lower()
        return any(query.lower() in text_lower for query in search_queries)

    def collect_from_hackernews(self, max_results: int = 0, max_attempts: int = 0) -> List[Dict[str, Any]]:
        """
        Collect top stories from Hacker News with enhanced content extraction and AI processing.
        
        Args:
            max_results: Maximum number of matching stories to return
            max_attempts: Maximum number of stories to check before giving up
            
        Returns:
            List of collected Hacker News stories as prompts with AI-enhanced content
        """
        print("🖥️  Collecting relevant stories from Hacker News with AI enhancement")
        try:
            # Get top story IDs (fetch more than needed to account for filtering)
            response = requests.get('https://hacker-news.firebaseio.com/v0/topstories.json', timeout=10)
            response.raise_for_status()
            story_ids = response.json()[:max_attempts]
            
            collected_prompts = []
            
            for story_id in story_ids:
                try:
                    # Get story details
                    story_url = f'https://hacker-news.firebaseio.com/v0/item/{story_id}.json'
                    story = requests.get(story_url, timeout=5).json()
                    
                    if not story or story.get('type') != 'story' or story.get('dead') or story.get('deleted'):
                        continue
                    
                    # Skip if no URL (Ask HN, Show HN, etc.)
                    if not story.get('url'):
                        continue
                        
                    # Skip if story doesn't match our search queries
                    title = story.get('title', '')
                    if not self._matches_search_query(title):
                        continue
                    
                    # Extract article content
                    article_content = self.extract_article_content(story['url'])
                    
                    # Generate title and prompt with Ollama
                    title, prompt = self.generate_prompt_with_ollama(article_content)
                    
                    prompt_data = {
                        'source_type': 'hackernews',
                        'source_id': f"hn_{story_id}",
                        'title': title or story.get('title', 'Untitled Story'),
                        'description': story.get('title', ''),
                        'prompt_text': prompt or f"{story.get('title', '')}\n\n{story.get('text', '')}",
                        'author': story.get('by', 'Unknown'),
                        'author_handle': f"@{story.get('by', '')}",
                        'date': datetime.utcfromtimestamp(story.get('time', 0)).isoformat(),
                        'category': 'TECHNOLOGY',
                        'source_url': story.get('url', f"https://news.ycombinator.com/item?id={story_id}"),
                        'likes': story.get('score', 0),
                        'retweets': story.get('descendants', 0),
                        'source_hash': self._generate_hash(f"hn_{story_id}")
                    }
                    
                    # Save to database
                    prompt_id = self.db.save_prompt(prompt_data)
                    if prompt_id:
                        prompt_data['id'] = prompt_id
                        collected_prompts.append(prompt_data)
                        print(f"✅ Saved: {prompt_data['title']}")
                    else:
                        print(f"⚠️  Skipped duplicate: {prompt_data['title']}")
                    
                except Exception as e:
                    print(f"⚠️  Error processing Hacker News story {story_id}: {str(e)}")
                    continue
            
            if collected_prompts:
                print(f"✅ Collected {len(collected_prompts)} relevant stories from Hacker News")
            else:
                print("ℹ️  No stories matching the search criteria found in top {max_attempts} stories")
            return collected_prompts
            
        except requests.exceptions.RequestException as e:
            print(f"⚠️  Hacker News API Error: {str(e)}")
            print("ℹ️  Continuing without Hacker News data...")
            return []
        except Exception as e:
            print(f"⚠️  Error collecting from Hacker News: {str(e)}")
            print("ℹ️  Continuing without Hacker News data...")
            return []
    
    def collect_from_news(self, query: str, max_results: int = 5) -> List[Dict[str, Any]]:
        """
        Collect prompts from News API based on a search query.
        
        Args:
            query: Search query for news
            max_results: Maximum number of results to return
            
        Returns:
            List of collected news prompts
        """
        if not self.news_api_key or self.news_api_key == 'your_news_api_key_here':
            print("⚠️  News API key not properly configured. Skipping news collection.")
            return []
        
        try:
            # News API endpoint
            url = 'https://newsapi.org/v2/everything'
            
            # Set up query parameters
            params = {
                'q': query,
                'pageSize': min(max_results, 100),  # Max 100 results per page
                'apiKey': self.news_api_key,
                'sortBy': 'publishedAt',
                'language': 'en'
            }
            
            # Make the request
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()  # Raise an exception for HTTP errors
            
            data = response.json()
            
            if data.get('status') != 'ok' or not data.get('articles'):
                print("ℹ️  No news articles found for the given query.")
                return []
                
            collected_prompts = []
            
            for article in data['articles']:
                if not article.get('title') or not article.get('content'):
                    continue
                    
                prompt_data = {
                    'source_type': 'news',
                    'source_id': str(hash(article['url'])) if article.get('url') else str(hash(article['title'])),
                    'title': article['title'],
                    'description': article.get('description') or article['title'],
                    'prompt_text': f"{article['title']}\n\n{article.get('content', '')}",
                    'author': article.get('author', 'Unknown'),
                    'author_handle': article.get('source', {}).get('name', ''),
                    'date': article.get('publishedAt', ''),
                    'category': 'NEWS',
                    'source_url': article.get('url', ''),
                    'image_url': article.get('urlToImage', ''),
                    'likes': 0,
                    'retweets': 0,
                    'source_hash': self._generate_hash(f"news_{article['title']}")
                }
                
                # Save to database
                prompt_id = self.db.save_prompt(prompt_data)
                if prompt_id:
                    prompt_data['id'] = prompt_id
                    collected_prompts.append(prompt_data)
            
            print(f"✅ Collected {len(collected_prompts)} news articles")
            return collected_prompts
            
        except requests.exceptions.RequestException as e:
            print(f"⚠️  News API Error: {str(e)}")
            print("ℹ️  Continuing without news data...")
            return []
        except Exception as e:
            print(f"⚠️  Error collecting from News API: {str(e)}")
            print("ℹ️  Continuing without news data...")
            return []
    
    def _process_twitter_response(self, response: requests.Response) -> List[Dict]:
        """Process Twitter API response and return list of prompts."""
        try:
            response.raise_for_status()
            data = response.json()
            
            if 'data' not in data:
                return []
                
            return data['data']
            
        except requests.exceptions.HTTPError as e:
            error_data = {}
            try:
                error_data = e.response.json()
            except:
                pass
                
            if e.response.status_code == 403 and 'client-not-enrolled' in str(error_data):
                print("""
⚠️  Twitter API Access Required:
1. Go to https://developer.twitter.com/
2. Create a new Project
3. Add the 'Twitter API v2' product to your project
4. Generate new API keys and update your .env file with the new bearer token
5. Make sure your project has the appropriate access level (Elevated or Academic)

For now, falling back to CSV if available.
                """)
            else:
                error_msg = f"Twitter API error: {e.response.status_code} - {e.response.text[:200]}"
                print(f"⚠️  {error_msg}")
                
            return []
            
        except Exception as e:
            print(f"⚠️  Unexpected error processing Twitter response: {str(e)}")
            return []

    def collect_from_twitter(self, query: str, max_results: int = 10) -> List[Dict[str, Any]]:
        """
        Collect tweets from Twitter API based on a search query.
        
        Args:
            query: Search query for tweets
            max_results: Maximum number of results to return
            
        Returns:
            List of collected tweets
        """
        if not hasattr(self, 'twitter_bearer_token') or not self.twitter_bearer_token or self.twitter_bearer_token == 'your_twitter_bearer_token_here':
            print("⚠️  Twitter API key not properly configured. Skipping Twitter collection.")
            return []
        
        try:
            # Twitter API endpoint
            url = 'https://api.twitter.com/2/tweets/search/recent'
            
            # Clean and format the query
            clean_query = query.strip()
            
            # Set up query parameters - start with minimal required fields
            params = {
                'query': f'{clean_query} -is:retweet lang:en',
                'max_results': min(max_results, 10),  # Start with a smaller number
                'tweet.fields': 'author_id,created_at,public_metrics,text',
                'expansions': 'author_id',
                'user.fields': 'name,username'
            }
            
            print(f"🔍 Twitter API request: {params['query']}")
            
            # Set up headers
            headers = {
                'Authorization': f'Bearer {self.twitter_bearer_token}'
            }
            
            # Make the request with debug info
            print(f"🔍 Making request to: {url}")
            print(f"🔍 Headers: {headers}")
            print(f"🔍 Params: {params}")
            
            try:
                response = requests.get(url, params=params, headers=headers, timeout=30)
                print(f"🔍 Response status: {response.status_code}")
                print(f"🔍 Response headers: {response.headers}")
                
                if response.status_code != 200:
                    print(f"⚠️  Twitter API Error: {response.status_code}")
                    print(f"⚠️  Response: {response.text}")
                    return []
                    
            except requests.exceptions.RequestException as e:
                print(f"⚠️  Request failed: {str(e)}")
                return []
            
            # Process the response
            tweets = self._process_twitter_response(response)
            
            if not tweets:
                print("ℹ️  No tweets found for the given query.")
                return []
                
            collected_prompts = []
            
            for tweet in tweets:
                prompt_data = {
                    'source_type': 'twitter',
                    'source_id': tweet['id'],
                    'title': tweet['text'],
                    'description': tweet['text'],
                    'prompt_text': tweet['text'],
                    'author': tweet.get('author', {}).get('name', 'Unknown'),
                    'author_handle': f"@{tweet.get('author', {}).get('username', '')}",
                    'date': tweet.get('created_at', ''),
                    'category': 'SOCIAL MEDIA',
                    'source_url': f"https://twitter.com/i/web/status/{tweet['id']}",
                    'image_url': '',
                    'likes': tweet.get('public_metrics', {}).get('like_count', 0),
                    'retweets': tweet.get('public_metrics', {}).get('retweet_count', 0),
                    'source_hash': self._generate_hash(f"twitter_{tweet['id']}")
                }
                
                # Save to database
                prompt_id = self.db.save_prompt(prompt_data)
                if prompt_id:
                    prompt_data['id'] = prompt_id
                    collected_prompts.append(prompt_data)
            
            print(f"✅ Collected {len(collected_prompts)} tweets")
            return collected_prompts
            
        except requests.exceptions.RequestException as e:
            print(f"⚠️  Twitter API Error: {str(e)}")
            print("ℹ️  Continuing without Twitter data...")
            return []
        except Exception as e:
            print(f"⚠️  Error collecting from Twitter API: {str(e)}")
            print("ℹ️  Continuing without Twitter data...")
            return []
    
    def run(self, query: str = None, max_results: int = 10, skip_sources: List[str] = None) -> Dict[str, Any]:
        """
        Run the collection process.
        
        Args:
            query: Search query (if None, uses default sources)
            max_results: Maximum number of results per source
            skip_sources: List of source types to skip (e.g., ['youtube', 'twitter'])
            
        Returns:
            Dictionary with collection results
        """
        skip_sources = skip_sources or []
        results = {
            'twitter': [],
            'news': [],
            'hackernews': [],
            'youtube': [],
            'total_collected': 0,
            'skipped_sources': skip_sources
        }
        
        if query:
            # Collect from Twitter if not skipped
            if 'twitter' not in skip_sources:
                print(f"🔍 Collecting from Twitter with query: {query}")
                twitter_results = self.collect_from_twitter(query, max_results)
                results['twitter'] = twitter_results
                results['total_collected'] += len(twitter_results)
            else:
                print("⏭️  Skipping Twitter collection as requested")
            
            # Collect from News if not skipped
            if 'news' not in skip_sources:
                print(f"📰 Collecting news with query: {query}")
                news_results = self.collect_from_news(query, max_results)
                results['news'] = news_results
                results['total_collected'] += len(news_results)
            else:
                print("⏭️  Skipping News collection as requested")
        
        # Always try to get Hacker News (no query needed) if not skipped
        if 'hackernews' not in skip_sources:
            print("🖥️  Collecting top stories from Hacker News")
            hn_results = self.collect_from_hackernews(max_results)
            results['hackernews'] = hn_results
            results['total_collected'] += len(hn_results)
        else:
            print("⏭️  Skipping Hacker News collection as requested")
        
        # Collect from YouTube if API key is available and not skipped
        if 'youtube' not in skip_sources and self.youtube_api_key and self.youtube_api_key != 'your_youtube_api_key_here':
            print("🎥 Collecting from YouTube")
            youtube_results = self.collect_from_youtube(max_results=max_results)
            results['youtube'] = youtube_results
            results['total_collected'] += len(youtube_results)
        elif 'youtube' in skip_sources:
            print("⏭️  Skipping YouTube collection as requested")
        else:
            print("ℹ️  YouTube API key not configured. Skipping YouTube collection.")
        
        print(f"\n✅ Collection complete. Total collected: {results['total_collected']}")
        if skip_sources:
            print(f"⏭️  Skipped sources: {', '.join(skip_sources)}")
        return results
