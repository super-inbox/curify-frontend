#!/usr/bin/env python3
"""
Complete Hot Topics to Inspiration Cards Pipeline
1. Curate diverse topics from RSS scores
2. Send to inspiration API for card generation
3. Generate summary report
"""

import json
import requests
from datetime import datetime
from curate_inspiration import HotTopicsCurator
import time
import os

class HotTopicsPipeline:
    """Complete pipeline from RSS scores to inspiration cards"""
    
    def __init__(self, scores_json_path: str, api_url: str = "https://curify-video-translate-fhhrczckd5hef8ft.westus2-01.azurewebsites.net/inspiration/generate"):
        self.scores_json_path = scores_json_path
        self.api_url = api_url
        self.curator = HotTopicsCurator(scores_json_path)
        
    def run_complete_pipeline(self, target_count: int = 12, use_mock: bool = False, output_dir: str = None):
        """Run the complete pipeline"""
        
        if output_dir is None:
            output_dir = os.path.dirname(self.scores_json_path)
        
        print("🚀 Starting Complete Hot Topics Pipeline...")
        print(f"📊 Target: {target_count} diverse topics")
        print(f"🌐 API: {self.api_url}")
        print(f"🎭 Mock Mode: {use_mock}")
        
        # Step 1: Curate diverse topics
        print("\n" + "="*60)
        print("📋 STEP 1: CURATING DIVERSE TOPICS")
        print("="*60)
        
        selected_topics = self.curator.select_diverse_topics(target_count)
        
        if not selected_topics:
            print("❌ No topics selected. Pipeline failed.")
            return None
        
        # Step 2: Format and save curated data
        print("\n📝 STEP 2: FORMATTING & SAVING CURATED DATA")
        curated_data = self.curator.format_for_inspiration_api(selected_topics)
        
        curated_output_path = os.path.join(output_dir, "curated_inspiration.json")
        self.curator.save_inspiration_data(curated_data, curated_output_path)
        
        # Step 3: Send to inspiration API
        print("\n📡 STEP 3: SENDING TO INSPIRATION API")
        api_results = self.send_topics_to_api(curated_data, use_mock)
        
        # Step 4: Generate summary report
        print("\n📊 STEP 4: GENERATING SUMMARY REPORT")
        report = self.generate_summary_report(selected_topics, api_results, curated_output_path)
        
        report_path = os.path.join(output_dir, f"pipeline_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json")
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        print(f"\n🎉 PIPELINE COMPLETED SUCCESSFULLY!")
        print(f"📁 Curated Data: {curated_output_path}")
        print(f"📊 API Results: {os.path.join(output_dir, 'curated_inspiration_api_results.json')}")
        print(f"📋 Summary Report: {report_path}")
        
        return report
    
    def send_topics_to_api(self, curated_data, use_mock: bool = False):
        """Send each curated topic to the inspiration API individually"""
        
        items = curated_data.get('input', {}).get('items', [])
        if not items:
            print("❌ No items found in curated data")
            return None
        
        print(f"📡 Sending {len(items)} topics to inspiration API...")
        
        successful_sends = []
        failed_sends = []
        generated_cards = []
        
        for i, item in enumerate(items, 1):
            print(f"\n🔄 [{i}/{len(items)}] Processing: {item['signal']['title'][:50]}...")
            
            # Extract the URL from the sources
            source_url = None
            if item.get('signal', {}).get('sources'):
                source_url = item['signal']['sources'][0].get('url')
            
            if not source_url:
                print(f"⚠️ No URL found, skipping...")
                failed_sends.append({
                    'item': i,
                    'title': item['signal']['title'],
                    'error': 'No URL found'
                })
                continue
            
            # Prepare API request
            api_request = {
                "input": {
                    "source_type": "URL",
                    "source_url": source_url,
                    "source_title": item['signal']['title'],
                    "lang": "en",
                    "coze_region": "CN"
                }
            }
            
            params = {"use_mock": use_mock}
            
            try:
                response = requests.post(
                    self.api_url,
                    json=api_request,
                    params=params,
                    headers={'Content-Type': 'application/json'},
                    timeout=60
                )
                
                if response.status_code == 200:
                    response_data = response.json()
                    print(f"✅ Success! Generated {response_data.get('total_generated', 0)} cards")
                    
                    successful_sends.append({
                        'item': i,
                        'title': item['signal']['title'],
                        'url': source_url,
                        'group_id': response_data.get('group_id'),
                        'total_generated': response_data.get('total_generated', 0)
                    })
                    
                    # Collect generated cards
                    if 'cards' in response_data:
                        for card in response_data['cards']:
                            generated_cards.append({
                                'source_topic': item['signal']['title'],
                                'source_url': source_url,
                                'card_id': card.get('id'),
                                'card_title': card.get('output_title'),
                                'prompt': card.get('prompt'),
                                'output': card.get('output'),
                                'preview_image': card.get('preview_image_url')
                            })
                else:
                    print(f"❌ Failed! Status: {response.status_code}")
                    failed_sends.append({
                        'item': i,
                        'title': item['signal']['title'],
                        'url': source_url,
                        'error': f"HTTP {response.status_code}: {response.text[:200]}"
                    })
                    
            except Exception as e:
                print(f"❌ Error: {e}")
                failed_sends.append({
                    'item': i,
                    'title': item['signal']['title'],
                    'url': source_url,
                    'error': str(e)
                })
            
            # Rate limiting
            if i < len(items):
                time.sleep(1)
        
        # Save API results
        api_results = {
            "timestamp": datetime.now().isoformat(),
            "total_items": len(items),
            "successful_sends": successful_sends,
            "failed_sends": failed_sends,
            "generated_cards": generated_cards,
            "success_rate": len(successful_sends) / len(items) if items else 0,
            "total_cards_generated": len(generated_cards)
        }
        
        results_path = os.path.join(os.path.dirname(self.scores_json_path), "curated_inspiration_api_results.json")
        with open(results_path, 'w', encoding='utf-8') as f:
            json.dump(api_results, f, indent=2, ensure_ascii=False)
        
        print(f"\n📊 API Results Summary:")
        print(f"  ✅ Successful: {len(successful_sends)}")
        print(f"  ❌ Failed: {len(failed_sends)}")
        print(f"  🎴 Cards Generated: {len(generated_cards)}")
        print(f"  📈 Success Rate: {len(successful_sends) / len(items) * 100:.1f}%")
        
        return api_results
    
    def generate_summary_report(self, selected_topics, api_results, curated_output_path):
        """Generate comprehensive summary report"""
        
        # Topic diversity analysis
        categories = []
        sources = []
        scores = []
        
        for topic in selected_topics:
            categories.extend(topic.get('categories', []))
            sources.append(topic.get('source_feed', ''))
            scores.append(topic.get('scores', {}).get('composite', 0))
        
        category_distribution = {}
        for cat in categories:
            category_distribution[cat] = category_distribution.get(cat, 0) + 1
        
        # API performance analysis
        successful_count = len(api_results.get('successful_sends', [])) if api_results else 0
        total_cards = len(api_results.get('generated_cards', [])) if api_results else 0
        
        report = {
            "pipeline_metadata": {
                "timestamp": datetime.now().isoformat(),
                "scores_file": self.scores_json_path,
                "curated_output": curated_output_path,
                "api_url": self.api_url
            },
            "topic_selection": {
                "total_selected": len(selected_topics),
                "categories_covered": len(set(categories)),
                "sources_represented": len(set(sources)),
                "category_distribution": category_distribution,
                "average_composite_score": sum(scores) / len(scores) if scores else 0,
                "score_range": {
                    "min": min(scores) if scores else 0,
                    "max": max(scores) if scores else 0
                }
            },
            "api_performance": {
                "topics_sent": len(selected_topics),
                "successful_sends": successful_count,
                "failed_sends": len(selected_topics) - successful_count,
                "success_rate": successful_count / len(selected_topics) if selected_topics else 0,
                "total_cards_generated": total_cards,
                "avg_cards_per_topic": total_cards / successful_count if successful_count > 0 else 0
            },
            "generated_content": {
                "cards": api_results.get('generated_cards', []) if api_results else [],
                "content_types": list(set(card.get('content_type', 'Unknown') for card in (api_results.get('generated_cards', []) if api_results else []))),
                "languages": list(set(card.get('lang', 'Unknown') for card in (api_results.get('generated_cards', []) if api_results else [])))
            },
            "recommendations": self._generate_recommendations(selected_topics, api_results)
        }
        
        return report
    
    def _generate_recommendations(self, selected_topics, api_results):
        """Generate recommendations based on pipeline results"""
        recommendations = []
        
        # Success rate recommendations
        success_rate = api_results.get('success_rate', 0) if api_results else 0
        if success_rate < 0.8:
            recommendations.append("Consider investigating API failures - success rate below 80%")
        elif success_rate == 1.0:
            recommendations.append("Excellent API performance - all topics processed successfully")
        
        # Content diversity recommendations
        categories = set()
        for topic in selected_topics:
            categories.update(topic.get('categories', []))
        
        if len(categories) < 5:
            recommendations.append("Consider increasing category diversity for broader content coverage")
        
        # Score distribution recommendations
        scores = [topic.get('scores', {}).get('composite', 0) for topic in selected_topics]
        if scores:
            avg_score = sum(scores) / len(scores)
            if avg_score < 4.0:
                recommendations.append("Consider raising the minimum composite score threshold for higher quality content")
            elif avg_score > 4.7:
                recommendations.append("Excellent quality selection - consider lowering score threshold to increase volume")
        
        # Card generation recommendations
        total_cards = api_results.get('total_cards_generated', 0) if api_results else 0
        if total_cards == 0:
            recommendations.append("No cards generated - check API configuration and content sources")
        elif total_cards < len(selected_topics):
            recommendations.append("Some topics didn't generate cards - review source content quality")
        
        return recommendations

def main():
    """Main execution function"""
    scores_json_path = "/Users/ronel/Downloads/dev/templates/curify/curify-frontend/app/[locale]/(app)/hot-topics/output_scores.json"
    
    pipeline = HotTopicsPipeline(scores_json_path)
    
    # Run pipeline with mock data for testing
    # Set use_mock=False for production
    report = pipeline.run_complete_pipeline(
        target_count=12,
        use_mock=True,  # Change to False for production
        output_dir=os.path.dirname(scores_json_path)
    )
    
    if report:
        print("\n🎊 Pipeline completed successfully!")
        print("📋 Key Metrics:")
        print(f"  - Topics Selected: {report['topic_selection']['total_selected']}")
        print(f"  - Categories Covered: {report['topic_selection']['categories_covered']}")
        print(f"  - API Success Rate: {report['api_performance']['success_rate']*100:.1f}%")
        print(f"  - Cards Generated: {report['api_performance']['total_cards_generated']}")
        
        if report['recommendations']:
            print("\n💡 Recommendations:")
            for rec in report['recommendations']:
                print(f"  - {rec}")
    else:
        print("❌ Pipeline failed!")

if __name__ == "__main__":
    main()
