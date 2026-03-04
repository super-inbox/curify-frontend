#!/usr/bin/env python3
"""
Send curated topics to inspiration API individually
"""

import json
import requests
from datetime import datetime
from curate_inspiration import HotTopicsCurator
import time

def detect_language_and_region(text, title):
    """Detect language and region like inspiration.js does"""
    import re
    
    if not text or len(text.strip()) == 0:
        text = title or ""
    
    cleaned_text = text.strip()
    
    # Count Chinese characters
    chinese_char_regex = r'[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]'
    chinese_matches = re.findall(chinese_char_regex, cleaned_text)
    chinese_count = len(chinese_matches) if chinese_matches else 0
    
    # Count English letters
    english_char_regex = r'[a-zA-Z]'
    english_matches = re.findall(english_char_regex, cleaned_text)
    english_count = len(english_matches) if english_matches else 0
    
    total_count = chinese_count + english_count
    
    if total_count < 5:
        return { 'lang': 'zh', 'region': 'CN' }
    
    chinese_percentage = (chinese_count / total_count) * 100
    
    if chinese_percentage > 30:
        return { 'lang': 'zh', 'region': 'CN' }
    else:
        return { 'lang': 'en', 'region': 'US' }

def send_topics_to_api(scores_json_path: str, curated_output_path: str, api_url: str = "https://curify-video-translate-fhhrczckd5hef8ft.westus2-01.azurewebsites.net/inspiration/generate"):
    
    # Load curated data
    try:
        with open(curated_output_path, 'r', encoding='utf-8') as f:
            curated_data = json.load(f)
    except Exception as e:
        print(f"❌ Error loading curated data: {e}")
        return
    
    items = curated_data.get('input', {}).get('items', [])
    if not items:
        print("❌ No items found in curated data")
        return
    
    print(f"📡 Sending {len(items)} topics to inspiration API...")
    print(f"🌐 API URL: {api_url}")
    
    successful_sends = []
    failed_sends = []
    
    for i, item in enumerate(items, 1):
        print(f"\n🔄 Processing item {i}/{len(items)}: {item['signal']['title'][:50]}...")
        
        # Extract the URL from the sources
        source_url = None
        if item.get('signal', {}).get('sources'):
            source_url = item['signal']['sources'][0].get('url')
        
        if not source_url:
            print(f"⚠️ No URL found for item {i}, skipping...")
            failed_sends.append({
                'item': i,
                'title': item['signal']['title'],
                'error': 'No URL found'
            })
            continue
        
        # Extract content for language detection
        content_for_detection = item.get('signal', {}).get('summary', '') + ' ' + item['signal']['title']
        detection = detect_language_and_region(content_for_detection, item['signal']['title'])
        
        print(f"   🌍 Detected: {detection['lang']} ({detection['region']})")
        
        # Prepare API request with dynamic language/region
        api_request = {
            "input": {
                "source_type": "URL",
                "source_url": source_url,
                "source_title": item['signal']['title'],
                "lang": detection['lang'],
                "coze_region": detection['region']
            }
        }
        
        # Add query parameter for mock if needed
        params = {"use_mock": True}  # Use mock for testing
        
        try:
            print(f"📤 Sending request...")
            response = requests.post(
                api_url,
                json=api_request,
                params=params,
                headers={'Content-Type': 'application/json'},
                timeout=60
            )
            
            if response.status_code == 200:
                print(f"✅ Success! Item {i} sent successfully")
                successful_sends.append({
                    'item': i,
                    'title': item['signal']['title'],
                    'url': source_url,
                    'response': response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text[:200]
                })
            else:
                print(f"❌ Failed! Status: {response.status_code}")
                print(f"Response: {response.text[:200]}...")
                failed_sends.append({
                    'item': i,
                    'title': item['signal']['title'],
                    'url': source_url,
                    'error': f"HTTP {response.status_code}: {response.text[:200]}"
                })
                
        except requests.exceptions.Timeout:
            print(f"⏰ Timeout for item {i}")
            failed_sends.append({
                'item': i,
                'title': item['signal']['title'],
                'url': source_url,
                'error': 'Timeout'
            })
        except Exception as e:
            print(f"❌ Error for item {i}: {e}")
            failed_sends.append({
                'item': i,
                'title': item['signal']['title'],
                'url': source_url,
                'error': str(e)
            })
        
        # Rate limiting - wait between requests
        if i < len(items):
            time.sleep(2)  # 2 second delay between requests
    
    # Summary
    print(f"\n📊 Summary:")
    print(f"  ✅ Successful: {len(successful_sends)}")
    print(f"  ❌ Failed: {len(failed_sends)}")
    print(f"  📈 Success Rate: {len(successful_sends) / len(items) * 100:.1f}%")
    
    # Save results
    results = {
        "timestamp": datetime.now().isoformat(),
        "total_items": len(items),
        "successful_sends": successful_sends,
        "failed_sends": failed_sends,
        "success_rate": len(successful_sends) / len(items) if items else 0
    }
    
    results_path = curated_output_path.replace('.json', '_api_results.json')
    with open(results_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"📁 Results saved to: {results_path}")
    
    return results

def main():
    """Main execution"""
    scores_json_path = "/Users/ronel/Downloads/dev/templates/curify/curify-frontend/app/[locale]/(app)/hot-topics/output_scores.json"
    curated_output_path = "/Users/ronel/Downloads/dev/templates/curify/curify-frontend/app/[locale]/(app)/hot-topics/curated_inspiration.json"
    
    print("🚀 Starting to send curated topics to inspiration API...")
    
    results = send_topics_to_api(scores_json_path, curated_output_path)
    
    if results:
        print(f"\n🎉 Process completed!")
        print(f"📊 Success rate: {results['success_rate'] * 100:.1f}%")
    else:
        print(f"\n❌ Process failed!")

if __name__ == "__main__":
    main()
