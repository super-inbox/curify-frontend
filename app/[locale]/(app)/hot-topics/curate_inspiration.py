#!/usr/bin/env python3
"""
Hot Topics Curation for Inspiration Cards
Selects diverse topics from RSS scores and formats for /inspiration/generate API
"""

import json
import random
import requests
from datetime import datetime
from typing import Dict, List, Any, Optional
from collections import defaultdict, Counter
import math

class HotTopicsCurator:
    """Curates diverse hot topics for inspiration card generation"""
    
    def __init__(self, scores_json_path: str):
        self.scores_json_path = scores_json_path
        self.data = self._load_scores_data()
        
    def _load_scores_data(self) -> Dict[str, Any]:
        """Load the RSS scores JSON data"""
        try:
            with open(self.scores_json_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"❌ Error loading scores data: {e}")
            return {}
    
    def _calculate_diversity_score(self, topics: List[Dict], candidate: Dict) -> float:
        """Calculate how diverse a candidate topic is from existing topics"""
        if not topics:
            return 1.0
            
        diversity_factors = {
            'categories': 0.4,
            'sources': 0.3,
            'score_ranges': 0.2,
            'content_similarity': 0.1
        }
        
        score = 0.0
        
        # Category diversity
        existing_categories = set()
        for topic in topics:
            existing_categories.update(topic.get('categories', []))
        
        candidate_categories = set(candidate.get('categories', []))
        category_overlap = len(existing_categories & candidate_categories)
        category_diversity = 1.0 - (category_overlap / max(len(existing_categories | candidate_categories), 1))
        score += diversity_factors['categories'] * category_diversity
        
        # Source diversity
        existing_sources = {topic.get('source_feed', '') for topic in topics}
        candidate_source = candidate.get('source_feed', '')
        source_diversity = 0.0 if candidate_source in existing_sources else 1.0
        score += diversity_factors['sources'] * source_diversity
        
        # Score range diversity
        existing_scores = [topic.get('scores', {}).get('composite', 0) for topic in topics]
        candidate_score = candidate.get('scores', {}).get('composite', 0)
        
        if existing_scores:
            avg_existing_score = sum(existing_scores) / len(existing_scores)
            score_diff = abs(candidate_score - avg_existing_score) / 5.0  # Normalize to 0-1
            score += diversity_factors['score_ranges'] * score_diff
        
        # Content similarity (simple word overlap)
        existing_titles = [topic.get('title', '').lower() for topic in topics]
        candidate_title = candidate.get('title', '').lower()
        candidate_words = set(candidate_title.split())
        
        if candidate_words:
            max_overlap = 0
            for existing_title in existing_titles:
                existing_words = set(existing_title.split())
                overlap = len(candidate_words & existing_words) / len(candidate_words | existing_words)
                max_overlap = max(max_overlap, overlap)
            
            content_diversity = 1.0 - max_overlap
            score += diversity_factors['content_similarity'] * content_diversity
        
        return score
    
    def _get_topic_quality_score(self, topic: Dict) -> float:
        """Calculate overall quality score for a topic"""
        scores = topic.get('scores', {})
        
        # Weight different dimensions
        weights = {
            'composite': 0.4,
            'relevance': 0.3,
            'visual_potential': 0.2,
            'shareability': 0.1
        }
        
        quality_score = 0.0
        for dimension, weight in weights.items():
            score = scores.get(dimension, 0) / 5.0  # Normalize to 0-1
            quality_score += weight * score
            
        return quality_score
    
    def select_diverse_topics(self, target_count: int = 12, min_composite_score: float = 3.5) -> List[Dict]:
        """Select diverse topics using a greedy algorithm"""
        all_items = self.data.get('all_items', [])
        
        # Filter by minimum score and priority
        eligible_items = [
            item for item in all_items 
            if item.get('scores', {}).get('composite', 0) >= min_composite_score
            and item.get('priority') in ['🔥 HOT', '🟡 MEDIUM']
        ]
        
        if not eligible_items:
            print("⚠️ No eligible items found")
            return []
        
        print(f"📊 Found {len(eligible_items)} eligible items from {len(all_items)} total")
        
        selected_topics = []
        remaining_items = eligible_items.copy()
        
        # Sort by initial quality score
        remaining_items.sort(key=lambda x: self._get_topic_quality_score(x), reverse=True)
        
        while len(selected_topics) < target_count and remaining_items:
            best_candidate = None
            best_combined_score = -1
            
            # Evaluate each remaining candidate
            for i, candidate in enumerate(remaining_items):
                quality_score = self._get_topic_quality_score(candidate)
                diversity_score = self._calculate_diversity_score(selected_topics, candidate)
                
                # Combine quality and diversity (70% quality, 30% diversity)
                combined_score = 0.7 * quality_score + 0.3 * diversity_score
                
                if combined_score > best_combined_score:
                    best_combined_score = combined_score
                    best_candidate = i
            
            if best_candidate is not None:
                selected = remaining_items.pop(best_candidate)
                selected_topics.append(selected)
                print(f"✅ Selected: {selected['title'][:50]}... (Score: {best_combined_score:.3f})")
            else:
                break
        
        print(f"🎯 Selected {len(selected_topics)} diverse topics")
        return selected_topics
    
    def format_for_inspiration_api(self, topics: List[Dict]) -> Dict[str, Any]:
        """Format selected topics for the /inspiration/generate API"""
        
        # Create the input data structure
        input_data = {
            "source_type": "URL",
            "items": [],
            "metadata": {
                "generated_at": datetime.now().isoformat(),
                "total_topics": len(topics),
                "source_file": self.scores_json_path,
                "selection_criteria": {
                    "min_composite_score": 3.5,
                    "diversity_weighted": True,
                    "categories": list(set(cat for topic in topics for cat in topic.get('categories', [])))
                }
            }
        }
        
        for i, topic in enumerate(topics):
            # Extract visual suggestions
            visual_suggestions = topic.get('visual_suggestions', [])
            
            # Create signal section
            signal_data = {
                "title": topic['title'],
                "summary": topic.get('summary', '')[:200] + "..." if len(topic.get('summary', '')) > 200 else topic.get('summary', ''),
                "sources": [
                    {
                        "label": self._extract_source_name(topic.get('source_feed', '')),
                        "url": topic.get('link', '')
                    }
                ],
                "scores": topic.get('scores', {}),
                "categories": topic.get('categories', []),
                "priority": topic.get('priority', '')
            }
            
            # Create visual section with prompts
            visual_prompts = []
            for suggestion in visual_suggestions[:3]:  # Limit to 3 suggestions
                if suggestion.startswith("What If:"):
                    visual_prompts.append({
                        "type": "what_if_scenario",
                        "text": suggestion.replace("What If: ", "") + " - Create a speculative visual exploring this concept."
                    })
                elif suggestion.startswith("Character Dossier:"):
                    visual_prompts.append({
                        "type": "character_profile",
                        "text": suggestion.replace("Character Dossier: ", "") + " - Design a detailed character profile with visual elements."
                    })
                elif suggestion.startswith("Comparison Card:"):
                    visual_prompts.append({
                        "type": "comparison_visual",
                        "text": suggestion.replace("Comparison Card: ", "") + " - Create a side-by-side comparison visual."
                    })
                elif suggestion.startswith("Visual Explainer:"):
                    visual_prompts.append({
                        "type": "explanation_visual",
                        "text": suggestion.replace("Visual Explainer: ", "") + " - Design an explanatory visual breakdown."
                    })
                elif suggestion.startswith("Visual Timeline:"):
                    visual_prompts.append({
                        "type": "timeline_visual",
                        "text": suggestion.replace("Visual Timeline: ", "") + " - Create a timeline-based visual narrative."
                    })
                else:
                    visual_prompts.append({
                        "type": "concept_visual",
                        "text": suggestion + " - Create a compelling visual representation."
                    })
            
            # If no visual suggestions, create generic ones
            if not visual_prompts:
                visual_prompts = [
                    {
                        "type": "concept_visual",
                        "text": f"Create a compelling visual for: {topic['title']}"
                    }
                ]
            
            visual_data = {
                "title": f"Visual Concepts for {topic['title'][:30]}...",
                "prompts": visual_prompts,
                "visual_potential_score": topic.get('scores', {}).get('visual_potential', 0),
                "suggested_styles": self._get_suggested_styles(topic)
            }
            
            # Create inspiration item
            inspiration_item = {
                "id": f"hot_topic_{i+1}_{datetime.now().strftime('%Y%m%d')}",
                "lang": "en",
                "status": "PUBLISHED",
                "featured": i < 3,  # Top 3 are featured
                "rank": i + 1,
                "createdAt": datetime.now().isoformat(),
                "signal": signal_data,
                "visual": visual_data,
                "metadata": {
                    "source_priority": topic.get('priority', ''),
                    "composite_score": topic.get('scores', {}).get('composite', 0),
                    "trend_velocity": topic.get('scores', {}).get('trend_velocity', 0),
                    "original_link": topic.get('link', ''),
                    "source_feed": topic.get('source_feed', '')
                }
            }
            
            input_data["items"].append(inspiration_item)
        
        # Wrap in the expected "input" field
        return {"input": input_data}
    
    def _extract_source_name(self, source_feed: str) -> str:
        """Extract clean source name from feed URL"""
        try:
            if '://' in source_feed:
                from urllib.parse import urlparse
                parsed = urlparse(source_feed)
                return parsed.netloc.replace('www.', '')
            return source_feed
        except:
            return source_feed
    
    def _get_suggested_styles(self, topic: Dict) -> List[str]:
        """Get suggested visual styles based on topic content"""
        categories = topic.get('categories', [])
        title = topic.get('title', '').lower()
        visual_score = topic.get('scores', {}).get('visual_potential', 0)
        
        styles = []
        
        # Category-based styles
        if 'AI' in categories or 'tech' in title:
            styles.extend(['Cyberpunk', 'Futuristic', 'Digital Art'])
        if 'Politics' in categories:
            styles.extend(['Editorial Illustration', 'Infographic', 'Political Cartoon'])
        if 'Science' in categories or 'research' in title:
            styles.extend(['Scientific Illustration', 'Data Visualization', 'Educational'])
        
        # Score-based styles
        if visual_score >= 4.5:
            styles.extend(['Hyperrealistic', 'Cinematic', 'High Concept'])
        elif visual_score >= 3.5:
            styles.extend(['Modern Illustration', 'Concept Art', 'Digital Painting'])
        
        # Content-based styles
        if any(word in title for word in ['future', 'tech', 'ai', 'robot']):
            styles.append('Sci-Fi')
        if any(word in title for word in ['social', 'people', 'community']):
            styles.append('Documentary Style')
        if any(word in title for word in ['environment', 'climate', 'nature']):
            styles.append('Nature Photography')
        
        # Remove duplicates and limit
        return list(set(styles))[:5] if styles else ['Modern Digital Art']
    
    def send_to_inspiration_api(self, inspiration_data: Dict, api_url: str = "https://curify-video-translate-fhhrczckd5hef8ft.westus2-01.azurewebsites.net/inspiration/generate") -> bool:
        """Send curated data to inspiration API"""
        try:
            print(f"📡 Sending {len(inspiration_data['items'])} items to inspiration API...")
            
            response = requests.post(
                api_url,
                json=inspiration_data,
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            if response.status_code == 200:
                print("✅ Successfully sent data to inspiration API")
                print(f"Response: {response.text}")
                return True
            else:
                print(f"❌ API request failed: {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Error sending to API: {e}")
            return False
    
    def save_inspiration_data(self, inspiration_data: Dict, output_path: str) -> bool:
        """Save inspiration data to file"""
        try:
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(inspiration_data, f, indent=2, ensure_ascii=False)
            print(f"💾 Saved inspiration data to {output_path}")
            return True
        except Exception as e:
            print(f"❌ Error saving data: {e}")
            return False
    
    def run_curation_pipeline(self, target_count: int = 12, output_file: str = None, send_to_api: bool = False) -> Dict[str, Any]:
        """Run the complete curation pipeline"""
        print("🚀 Starting hot topics curation pipeline...")
        
        # Step 1: Select diverse topics
        print("\n📋 Step 1: Selecting diverse topics...")
        selected_topics = self.select_diverse_topics(target_count)
        
        if not selected_topics:
            print("❌ No topics selected. Pipeline failed.")
            return {}
        
        # Step 2: Format for inspiration API
        print("\n🎨 Step 2: Formatting for inspiration API...")
        inspiration_data = self.format_for_inspiration_api(selected_topics)
        
        # Step 3: Save to file
        if output_file:
            print(f"\n💾 Step 3: Saving to {output_file}...")
            self.save_inspiration_data(inspiration_data, output_file)
        
        # Step 4: Send to API (optional)
        if send_to_api:
            print("\n📡 Step 4: Sending to inspiration API...")
            self.send_to_inspiration_api(inspiration_data)
        
        # Summary
        print("\n📊 Curation Summary:")
        print(f"  - Topics selected: {len(selected_topics)}")
        print(f"  - Categories covered: {len(set(cat for topic in selected_topics for cat in topic.get('categories', [])))}")
        print(f"  - Sources represented: {len(set(topic.get('source_feed', '') for topic in selected_topics))}")
        print(f"  - Avg composite score: {sum(topic.get('scores', {}).get('composite', 0) for topic in selected_topics) / len(selected_topics):.2f}")
        
        return inspiration_data


def main():
    """Main execution function"""
    # Configuration
    scores_json_path = "/Users/ronel/Downloads/dev/templates/curify/curify-frontend/app/[locale]/(app)/hot-topics/output_scores.json"
    output_file = "/Users/ronel/Downloads/dev/templates/curify/curify-frontend/app/[locale]/(app)/hot-topics/curated_inspiration.json"
    
    # Create curator and run pipeline
    curator = HotTopicsCurator(scores_json_path)
    
    # Run curation (12 topics, save to file, don't send to API by default)
    result = curator.run_curation_pipeline(
        target_count=12,
        output_file=output_file,
        send_to_api=False  # Set to True when ready to send to API
    )
    
    if result:
        print("\n🎉 Curation completed successfully!")
        print(f"📁 Output saved to: {output_file}")
        print("\nTo send to API, run with send_to_api=True or use the send_to_inspiration_api method directly.")
    else:
        print("\n❌ Curation failed.")


if __name__ == "__main__":
    main()
