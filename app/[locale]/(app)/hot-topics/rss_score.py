#!/usr/bin/env python3
"""
RSS Scoring and JSON Conversion Script for Curify
Converts RSS crawled data into scored, structured JSON for growth engine
Uses GPT-4o for advanced content analysis and scoring
"""

import csv
import json
import re
import os
import time
import openai
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple
from collections import defaultdict, Counter
from functools import lru_cache

# Load environment variables from .env file
from dotenv import load_dotenv
load_dotenv()

# Configure OpenAI API
print("\n🔑 Initializing OpenAI client...")
api_key = os.getenv('OPENAI_API_KEY')
print(f"API Key: {'Found' if api_key else 'MISSING - check .env file'}")

client = None
ollama_client = None

try:
    if not api_key:
        raise ValueError("No API key provided in .env file")
        
    client = openai.OpenAI(api_key=api_key)
    print("✅ OpenAI client initialized successfully")
    
    # Test the client
    print("Testing API connection...")
    models = client.models.list()
    print(f"✅ Connected to OpenAI API. Available models: {len(models.data)}")
    
except Exception as e:
    print("\n❌ WARNING: Failed to initialize OpenAI client.")
    print(f"Error details: {str(e)}")
    if 'Incorrect API key' in str(e):
        print("The API key appears to be invalid. Please check your .env file.")
    client = None

# Always try to initialize Ollama as fallback
print("\n🦙 Initializing Ollama client as fallback...")
try:
    ollama_client = openai.OpenAI(
        base_url="http://localhost:11434/v1",
        api_key="ollama"  # Required but not used by Ollama
    )
    # Test Ollama connection
    models = ollama_client.models.list()
    print(f"✅ Connected to Ollama. Available models: {[model.id for model in models.data]}")
except Exception as ollama_error:
    print(f"❌ Failed to initialize Ollama: {str(ollama_error)}")
    print("⚠️  Will fall back to keyword-based scoring only if OpenAI fails.")
    ollama_client = None

class GPTScorer:
    """Handles scoring using GPT-4o model"""
    
    @classmethod
    @lru_cache(maxsize=1000)
    def get_all_scores_batch(cls, title: str, summary: str) -> Optional[Tuple[float, float, float]]:
        """
        Get relevance, visual, and shareability scores in one API call
        Tries OpenAI first, then Ollama as fallback
        
        Args:
            title: Article title
            summary: Article summary/content
            
        Returns:
            List of [relevance, visual_potential, shareability] scores, or None if scoring fails
        """
        global client, ollama_client
        content = f"Title: {title}\n\nSummary: {summary}"
        print(f"\n🔍 Batch scoring content: {content[:100]}...")
            
        prompt = """
        Score this content on three dimensions (0-5 each):
        
        1. RELEVANCE (Curify audience alignment):
        - AI/creativity/social media/education → 4.5-5.0
        - Tech product news → 3.0-4.0  
        - General politics/crime → 1.0-2.0
        - Pure shopping deals → 0.0-1.0
        - Other topics → 2.0-3.0
        
        2. VISUAL POTENTIAL (content transformation ability):
        - Perfect for What-If scenarios → 4.5-5.0
        - Great for Character Dossier/Comparison Card → 4.0-4.5
        - Good for Visual Explainer → 3.5-4.0
        - Some visual potential (charts/diagrams) → 2.5-3.5
        - Limited visual potential → 1.0-2.5
        - Minimal visual potential → 0.0-1.0
        
        3. SHAREABILITY (social media viral potential):
        - Strong emotional hooks + controversy + cultural relevance → 4.5-5.0
        - High emotional impact or trending topic → 4.0-4.5
        - Moderate interest/useful insights → 3.0-4.0
        - Some shareable elements → 2.0-3.0
        - Limited shareability → 1.0-2.0
        - Minimal shareability → 0.0-1.0
        
        Return format: "relevance:score,visual:score,shareability:score"
        Example: "relevance:4.2,visual:3.8,shareability:4.5"
        
        Content to score:
        """
            
        messages = [
            {"role": "system", "content": "You are a content scoring assistant. Provide scores in the exact format: relevance:score,visual:score,shareability:score where each score is between 0-5 with one decimal place."},
            {"role": "user", "content": f"{prompt}\n{content}\n\nScores:"}
        ]
        
        # Try OpenAI first
        if client:
            try:
                response = client.chat.completions.create(
                    model="gpt-4o",
                    messages=messages,
                    max_tokens=50,
                    temperature=0.1
                )
                
                score_text = response.choices[0].message.content.strip()
                print(f"📊 OpenAI Response: {score_text}")
                
                parsed = cls._parse_scores(score_text)
                if parsed:
                    scores_list = list(parsed)
                    print(f"✅ Scores: {scores_list}")
                    return tuple(scores_list)
                    
            except Exception as e:
                print(f"❌ OpenAI API error: {str(e)}")
        
        # Fallback to Ollama
        if ollama_client:
            try:
                print("🦙 Trying Ollama fallback...")
                response = ollama_client.chat.completions.create(
                    model="llama2",
                    messages=messages,
                    max_tokens=30,
                    temperature=0.1
                )
                
                score_text = response.choices[0].message.content.strip()
                print(f"📊 Ollama Response: {score_text}")
                
                parsed = cls._parse_scores(score_text)
                if parsed:
                    scores_list = list(parsed)
                    print(f"✅ Scores: {scores_list}")
                    return tuple(scores_list)
                    
            except Exception as e:
                print(f"❌ Ollama API error: {str(e)}")
        
        print("⚠️  Both OpenAI and Ollama failed - falling back to keyword scoring")
        return None
    
    @classmethod
    def _parse_scores(cls, score_text: str) -> Optional[Tuple[float, float, float]]:
        """Parse the score response format"""
        # Try exact format first (for OpenAI)
        pattern = r'relevance:([0-9]\.[0-9]|[0-5]),visual:([0-9]\.[0-9]|[0-5]),shareability:([0-9]\.[0-9]|[0-5])'
        match = re.search(pattern, score_text.lower())
        
        if match:
            relevance = float(match.group(1))
            visual = float(match.group(2))
            shareability = float(match.group(3))
            
            # Ensure scores are between 0-5
            relevance = max(0.0, min(5.0, relevance))
            visual = max(0.0, min(5.0, visual))
            shareability = max(0.0, min(5.0, shareability))
            
            return (relevance, visual, shareability)
        
        # Try to extract numbers from Ollama's verbose responses
        relevance_patterns = [
            r'relevance:\s*([0-9]\.[0-9]|[0-5])',
            r'relevance:\s*([0-9]\.[0-9]|[0-5])/5',
            r'relevance.*?([0-9]\.[0-9]|[0-5])'
        ]
        
        visual_patterns = [
            r'visual:\s*([0-9]\.[0-9]|[0-5])',
            r'visual:\s*([0-9]\.[0-9]|[0-5])/5',
            r'visual.*?([0-9]\.[0-9]|[0-5])'
        ]
        
        shareability_patterns = [
            r'shareability:\s*([0-9]\.[0-9]|[0-5])',
            r'shareability:\s*([0-9]\.[0-9]|[0-5])/5',
            r'shareability.*?([0-9]\.[0-9]|[0-5])'
        ]
        
        def extract_score(patterns, text):
            for pattern in patterns:
                match = re.search(pattern, text.lower())
                if match:
                    return float(match.group(1))
            return None
        
        relevance = extract_score(relevance_patterns, score_text)
        visual = extract_score(visual_patterns, score_text)
        shareability = extract_score(shareability_patterns, score_text)
        
        if relevance is not None and visual is not None and shareability is not None:
            relevance = max(0.0, min(5.0, relevance))
            visual = max(0.0, min(5.0, visual))
            shareability = max(0.0, min(5.0, shareability))
            
            return (relevance, visual, shareability)
        
        return None

    @classmethod
    @lru_cache(maxsize=1000)
    def get_gpt_score(cls, prompt: str, content: str, max_retries: int = 3) -> Optional[float]:
        """
        Get a score from GPT-4o with retry logic and caching
        
        Args:
            prompt: The scoring prompt to use
            content: The content to score
            max_retries: Number of retry attempts
            
        Returns:
            Score as float between 0-5, or None if scoring fails
        """
        global client
        if not client:
            print("⚠️  GPT scoring disabled - no OpenAI client available")
            return None
            
        print(f"\n🔍 GPT Scoring content: {content[:100]}...")
            
        messages = [
            {"role": "system", "content": "You are a content scoring assistant. Provide a single numerical score between 0-5 for the given content based on the specified criteria."},
            {"role": "user", "content": f"{prompt}\n\nContent to score:\n{content}\n\nScore (0-5):"}
        ]
        
        for attempt in range(max_retries):
            try:
                response = client.chat.completions.create(
                    model="gpt-4o",
                    messages=messages,
                    max_tokens=10,
                    temperature=0.1
                )
                
                # Extract numerical score from response
                score_text = response.choices[0].message.content.strip()
                score_match = re.search(r'([0-9]\.[0-9]|[0-5])', score_text)
                if score_match:
                    score = float(score_match.group(1))
                    return max(0.0, min(5.0, score))  # Ensure score is between 0-5
                
            except Exception as e:
                print(f"GPT API error (attempt {attempt + 1}/{max_retries}): {str(e)}")
                if attempt == max_retries - 1:
                    return None
                time.sleep(2 ** attempt)  # Exponential backoff
        
        return None


class RSSScorer:
    """Score RSS items based on Curify's strategic dimensions"""
    
    # Relevance scoring keywords
    RELEVANCE_KEYWORDS = {
    # Score 0: Pure shopping deals (check this first to filter out)
    0: [
        'deal', 'deals', 'sale', 'sales', 'discount', 'coupon', 'voucher',
        'offer', 'bargain', 'clearance', 'promotion', 'flash sale',
        'limited time', 'buy now', 'shop now', 'checkout', 'add to cart'
    ],
    # Score 1: General politics / crime
    1: [
        'politics', 'political', 'election', 'government', 'policy', 'law',
        'crime', 'criminal', 'arrest', 'investigation', 'lawsuit', 'court',
        'congress', 'senate', 'parliament', 'legislation'
    ],
    # Score 3: Tech product news
    3: [
        'tech', 'technology', 'startup', 'product launch', 'app', 'software',
        'platform', 'digital product', 'saas', 'tech news', 'gadget',
        'device', 'tech review', 'product update', 'new feature'
    ],
    # Score 5: AI / creativity / social media / education (most specific matches last)
    5: [
        # More specific AI terms
        'generative ai', 'large language model', 'neural network', 'machine learning model',
        # More specific creative terms
        'creator economy', 'generative art', 'design thinking', 'content strategy',
        # More specific education terms
        'edtech', 'e-learning', 'online course', 'educational technology'
    ]
}
    
    # Visual potential keywords
    VISUAL_POTENTIAL_KEYWORDS = {
    # Score 1: Minimal visual potential (check first)
    1: [
        'opinion', 'editorial', 'commentary', 'thoughts on', 'perspective',
        'analysis of'
    ],
    # Score 2: Limited visual potential
    2: [
        'announcement', 'launch', 'release', 'update', 'news', 'report',
        'findings', 'research', 'study'
    ],
    # Score 3: Some visual potential - might require more work
    3: [
        'story', 'narrative', 'journey', 'experience', 'review', 'tutorial',
        'how to', 'guide', 'tips', 'lessons from'
    ],
    # Score 4: Good visual potential - can be turned into multiple visual formats
    4: [
        'trend', 'analysis', 'data shows', 'statistics', 'chart', 'graph',
        'infographic', 'visual guide', 'interactive', 'case study'
    ],
    # Score 5: High visual potential
    5: [
        # What-If scenarios
        'what if', 'imagine if', 'future of', 'what would happen if', 'scenario',
        # Character Dossier
        'profile of', 'who is', 'about', 'biography', 'background', 'career of',
        # Comparison Card
        'vs', 'versus', 'compared to', 'difference between',
        # Visual Explainer
        'how it works', 'explained', 'beginners guide', 'understanding', 'breakdown of',
        # Visual storytelling
        'timeline', 'evolution of', 'history of', 'step by step', 'process of'
    ]
}

    # Shareability keywords
    SHAREABILITY_KEYWORDS = {
    # Score 1: Limited shareability (check first)
    1: [
        'opinion', 'editorial', 'commentary', 'perspective', 'thoughts on',
        'analysis of', 'review of', 'recap'
    ],
    # Score 2: Some shareable elements
    2: [
        'insight', 'analysis', 'research', 'findings', 'study',
        'report', 'data', 'statistics', 'numbers'
    ],
    # Score 3: Moderately shareable
    3: [
        'new', 'latest', 'update', 'announcement', 'introducing',
        'now available', 'just launched', 'first', 'revealed'
    ],
    # Score 4: Strong emotional or cultural appeal
    4: [
        'amazing', 'incredible', 'unexpected', 'surprising', 'must see',
        'breaking', 'exclusive', 'first look', 'you need to know', 'important'
    ],
    # Score 5: High shareability
    5: [
        # Emotional hooks
        'shocking', 'heartwarming', 'heartbreaking', 'inspiring', 'unbelievable',
        # Controversy (safe level)
        'debate', 'controversy', 'divided', 'heated', 'backlash', 'outrage',
        # Cultural relevance
        'viral', 'trending', 'everyone is talking about', 'breaking the internet',
        # Creator relevance
        'creator', 'influencer', 'youtuber', 'tiktoker', 'content creator'
    ]
}
    
    def __init__(self):
        self.trend_tracker = defaultdict(int)
        self.keyword_frequency = Counter()
        self._batch_cache = {}  # Cache for batch results
        
    def get_all_scores(self, title: str, summary: str) -> List[float]:
        """
        Get all three scores (relevance, visual, shareability) in one batch call
        
        Args:
            title: Article title
            summary: Article summary/content
            
        Returns:
            List of [relevance, visual_potential, shareability] scores
        """
        # Create a cache key for this content
        cache_key = f"{title[:100]}|{summary[:200]}"
        
        if cache_key in self._batch_cache:
            return self._batch_cache[cache_key]
        
        # Try batch GPT scoring first
        batch_scores = GPTScorer.get_all_scores_batch(title, summary)
        
        if batch_scores is not None:
            scores_list = list(batch_scores)
            print(f"📋 Final scores list: {scores_list}")
            self._batch_cache[cache_key] = scores_list
            return scores_list
        
        # Fall back to individual keyword-based scoring
        relevance = self._get_keyword_relevance_score(title, summary)
        visual = self._get_keyword_visual_score(title, summary)
        shareability = self._get_keyword_shareability_score(title, summary)
        
        scores_list = [relevance, visual, shareability]
        print(f"📋 Keyword fallback scores list: {scores_list}")
        self._batch_cache[cache_key] = scores_list
        return scores_list
    
    def _get_keyword_relevance_score(self, title: str, summary: str) -> float:
        """Keyword-based relevance scoring"""
        text = f"{title} {summary}".lower()
        for score, keywords in self.RELEVANCE_KEYWORDS.items():
            if any(keyword in text for keyword in keywords):
                return min(5.0, max(0.0, float(score)))
        return 1.0
    
    def _get_keyword_visual_score(self, title: str, summary: str) -> float:
        """Keyword-based visual potential scoring"""
        text = f"{title} {summary}".lower()
        max_score = 0
        for score, keywords in self.VISUAL_POTENTIAL_KEYWORDS.items():
            if any(keyword in text for keyword in keywords):
                max_score = max(max_score, score)
        
        if '?' in title or any(q in title.lower() for q in ['what', 'why', 'how', 'when', 'where']):
            max_score = min(5, max_score + 1)
        
        return min(5.0, max(0.0, float(max_score if max_score > 0 else 1.0)))
    
    def _get_keyword_shareability_score(self, title: str, summary: str) -> float:
        """Keyword-based shareability scoring"""
        text = f"{title} {summary}".lower()
        max_score = 0
        for score, keywords in self.SHAREABILITY_KEYWORDS.items():
            if any(keyword in text for keyword in keywords):
                max_score = max(max_score, score)
        
        if '?' in title:
            max_score = min(5, max_score + 1)
        
        if re.search(r'\d+\s+(ways?|things?|reasons?|tips?|steps?|ideas?)', text):
            max_score = min(5, max_score + 1)
        
        return min(5.0, max(0.0, float(max_score if max_score > 0 else 1.0)))
        
    def calculate_relevance_score(self, title: str, summary: str) -> float:
        """Calculate relevance score (0-5) using batch scoring"""
        if not title:
            return 1.0
        scores = self.get_all_scores(title, summary)
        return scores[0]
    
    def calculate_visual_potential_score(self, title: str, summary: str) -> float:
        """Calculate visual potential score (0-5) using batch scoring"""
        if not title:
            return 1.0
        scores = self.get_all_scores(title, summary)
        return scores[1]
    
    def calculate_trend_velocity_score(self, title: str, source_feed: str, all_items: List[Dict]) -> float:
        """Calculate trend velocity based on keyword frequency and multi-source repetition"""
        if not all_items or not title:
            return 1.0
            
        words = [w for w in re.findall(r'\b\w{4,}\b', title.lower()) 
                if w not in ['this', 'that', 'with', 'from', 'your', 'have', 'they', 'what', 'when', 'where', 'which']]
        
        if not words:
            return 1.0
            
        score = 0.0
        
        for word in words[:5]:
            self.keyword_frequency[word] += 1
            if self.keyword_frequency[word] >= 5:
                score += 0.4
            elif self.keyword_frequency[word] >= 3:
                score += 0.2
        
        similar_titles = sum(1 for item in all_items 
                           if item.get('title') and 
                           any(word in item['title'].lower() for word in words[:3]) and
                           item.get('source_feed') != source_feed)
        
        if similar_titles >= 3:
            score += 2.0
        elif similar_titles >= 2:
            score += 1.0
        
        base_score = 0.5
        
        return min(5.0, max(0.0, float(score + base_score)))
    
    def calculate_shareability_score(self, title: str, summary: str) -> float:
        """Calculate shareability score (0-5) using batch scoring"""
        if not title:
            return 1.0
        scores = self.get_all_scores(title, summary)
        return scores[2]
    
    def calculate_composite_score(self, relevance: float, visual: float, 
                                  trend: float, shareability: float) -> float:
        """Calculate final composite score with weighted formula"""
        relevance = max(0.0, min(5.0, float(relevance or 0)))
        visual = max(0.0, min(5.0, float(visual or 0)))
        trend = max(0.0, min(5.0, float(trend or 0)))
        shareability = max(0.0, min(5.0, float(shareability or 0)))
        
        score = (0.35 * relevance + 
                0.30 * visual + 
                0.20 * trend + 
                0.15 * shareability)
        
        return round(score, 2)
    
    def classify_priority(self, score: float) -> str:
        """Classify items by priority tier"""
        if score >= 4.0:
            return "🔥 HOT"
        elif score >= 3.0:
            return "🟡 MEDIUM"
        else:
            return "⚪ ARCHIVE"
    
    def extract_topic_category(self, title: str, summary: str) -> List[str]:
        """Extract topic categories for clustering"""
        text = f"{title} {summary}".lower()
        categories = []
        
        category_keywords = {
            "AI": ['ai', 'artificial intelligence', 'machine learning', 'chatgpt', 'llm'],
            "Creator Economy": ['creator', 'influencer', 'content creation', 'social media'],
            "Olympics": ['olympics', 'olympic', 'winter games', 'athlete'],
            "Tech Product": ['launch', 'startup', 'product', 'app', 'platform'],
            "Education": ['education', 'learning', 'teaching', 'school', 'university'],
            "Climate": ['climate', 'environment', 'sustainability', 'green', 'renewable'],
            "Politics": ['politics', 'political', 'government', 'policy'],
            "Science": ['science', 'research', 'study', 'discovery', 'experiment']
        }
        
        for category, keywords in category_keywords.items():
            if any(keyword in text for keyword in keywords):
                categories.append(category)
        
        return categories if categories else ["General"]
    
    def generate_visual_suggestions(self, title: str, summary: str, score: float) -> List[str]:
        """Generate visual creation suggestions based on content"""
        suggestions = []
        text = f"{title} {summary}".lower()
        
        if score >= 3.5:
            if 'ai' in text or 'technology' in text:
                suggestions.append("What If: " + title.split('?')[0] + " became universal?")
            if 'future' in text or 'predict' in text:
                suggestions.append("Future Scenario Visual: " + title[:50])
        
        if any(word in text for word in ['ceo', 'founder', 'leader', 'expert', 'creator']):
            suggestions.append("Character Dossier: Key figure profile")
        
        if any(word in text for word in ['vs', 'versus', 'compare', 'comparison']):
            suggestions.append("Comparison Card: Side-by-side visual")
        
        if any(word in text for word in ['history', 'evolution', 'timeline', 'development']):
            suggestions.append("Visual Timeline: Key events")
        
        if any(word in text for word in ['how', 'why', 'what', 'explained']):
            suggestions.append("Visual Explainer: Breaking down the concept")
        
        return suggestions if suggestions else ["Visual Card: Key insight summary"]


def process_rss_data(csv_file_path: str, output_json_path: str):
    """Main processing function"""
    scorer = RSSScorer()
    all_items = []
    
    csv.field_size_limit(10000000)
    
    print("Loading RSS data...")
    with open(csv_file_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            all_items.append(row)
    
    print(f"Loaded {len(all_items)} items")
    
    print("Scoring items...")
    scored_items = []
    
    for item in all_items:
        title = item['title']
        summary = item['summary']
        source = item['source_feed']
        
        relevance = scorer.calculate_relevance_score(title, summary)
        visual = scorer.calculate_visual_potential_score(title, summary)
        trend = scorer.calculate_trend_velocity_score(title, source, all_items)
        shareability = scorer.calculate_shareability_score(title, summary)
        
        composite = scorer.calculate_composite_score(relevance, visual, trend, shareability)
        priority = scorer.classify_priority(composite)
        categories = scorer.extract_topic_category(title, summary)
        visual_suggestions = scorer.generate_visual_suggestions(title, summary, composite)
        
        scored_item = {
            "title": title,
            "link": item['link'],
            "summary": summary[:300] + "..." if len(summary) > 300 else summary,
            "source_feed": source,
            "pub_date": item['pubDate'],
            "images": eval(item['images']) if item['images'] else [],
            
            "scores": {
                "relevance": round(relevance, 2),
                "visual_potential": round(visual, 2),
                "trend_velocity": round(trend, 2),
                "shareability": round(shareability, 2),
                "composite": round(composite, 2)
            },
            
            "priority": priority,
            "categories": categories,
            "visual_suggestions": visual_suggestions,
            "created_at": datetime.now().isoformat()
        }
        
        scored_items.append(scored_item)
    
    scored_items.sort(key=lambda x: x['scores']['composite'], reverse=True)
    
    output = {
        "metadata": {
            "total_items": len(scored_items),
            "hot_items": sum(1 for item in scored_items if item['priority'] == "🔥 HOT"),
            "medium_items": sum(1 for item in scored_items if item['priority'] == "🟡 MEDIUM"),
            "archive_items": sum(1 for item in scored_items if item['priority'] == "⚪ ARCHIVE"),
            "generated_at": datetime.now().isoformat(),
            "source_file": csv_file_path
        },
        "trending_topics": scored_items[:10],
        "hot_items": [item for item in scored_items if item['priority'] == "🔥 HOT"],
        "medium_items": [item for item in scored_items if item['priority'] == "🟡 MEDIUM"],
        "by_category": {},
        "all_items": scored_items
    }
    
    category_groups = defaultdict(list)
    for item in scored_items:
        for category in item['categories']:
            category_groups[category].append(item)
    
    output["by_category"] = {
        category: items[:20]
        for category, items in category_groups.items()
    }
    
    print(f"Writing to {output_json_path}...")
    with open(output_json_path, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print("\n" + "="*60)
    print("RSS SCORING SUMMARY")
    print("="*60)
    print(f"Total items processed: {output['metadata']['total_items']}")
    print(f"🔥 Hot items: {output['metadata']['hot_items']}")
    print(f"🟡 Medium items: {output['metadata']['medium_items']}")
    print(f"⚪ Archive items: {output['metadata']['archive_items']}")
    print("\nTop 5 Trending Topics:")
    for i, item in enumerate(output['trending_topics'][:5], 1):
        print(f"{i}. [{item['scores']['composite']:.2f}] {item['title'][:60]}...")
    print("\nCategory Distribution:")
    for category, items in output['by_category'].items():
        print(f"  {category}: {len(items)} items")
    print("="*60)
    
    return output


if __name__ == "__main__":
    import sys
    
    input_csv = "/mnt/user-data/uploads/rss_crawled_data_2026-02-11T17.csv"
    output_json = "/mnt/user-data/outputs/rss_scored_data.json"
    
    if len(sys.argv) > 1:
        input_csv = sys.argv[1]
    if len(sys.argv) > 2:
        output_json = sys.argv[2]
    
    result = process_rss_data(input_csv, output_json)
    
    print(f"\n✅ Successfully created: {output_json}")
    print(f"📊 Use this JSON to power your growth engine!")