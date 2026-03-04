#!/usr/bin/env python3
"""
Comprehensive Coze API diagnostic tool
"""

import json
import requests
from datetime import datetime
import time

def diagnose_coze_issue():
    """Diagnose the specific Coze API issue"""
    
    api_url = "https://curify-video-translate-fhhrczckd5hef8ft.westus2-01.azurewebsites.net/inspiration/generate"
    
    print("🔍 COMPREHENSIVE COZE API DIAGNOSTIC")
    print("="*60)
    
    # 1. Check service health
    print("\n1️⃣ SERVICE HEALTH CHECK")
    health_response = requests.get("https://curify-video-translate-fhhrczckd5hef8ft.westus2-01.azurewebsites.net/inspiration/health")
    health_data = health_response.json()
    print(f"   Coze CN Configured: {health_data.get('coze_cn_configured')}")
    print(f"   Coze US Configured: {health_data.get('coze_us_configured')}")
    print(f"   CN API Key Set: {health_data.get('cn_api_key_set')}")
    print(f"   US API Key Set: {health_data.get('us_api_key_set')}")
    print(f"   CN Bot ID Set: {health_data.get('cn_bot_id_set')}")
    print(f"   US Bot ID Set: {health_data.get('us_bot_id_set')}")
    
    # 2. Test with minimal payload
    print("\n2️⃣ MINIMAL PAYLOAD TEST")
    minimal_request = {
        "input": {
            "source_type": "TEXT",
            "source_text": "Test",
            "source_title": "Test",
            "lang": "en",
            "coze_region": "CN"
        }
    }
    
    try:
        response = requests.post(
            api_url,
            json=minimal_request,
            params={"use_mock": False},
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text[:200]}...")
    except Exception as e:
        print(f"   Exception: {e}")
    
    # 3. Test with different coze_region values
    print("\n3️⃣ COZE REGION TEST")
    regions = ["CN", "US", "EU", "AP"]
    
    for region in regions:
        test_request = {
            "input": {
                "source_type": "TEXT",
                "source_text": "Simple test content",
                "source_title": f"Test {region}",
                "lang": "en",
                "coze_region": region
            }
        }
        
        try:
            response = requests.post(
                api_url,
                json=test_request,
                params={"use_mock": False},
                headers={'Content-Type': 'application/json'},
                timeout=15
            )
            print(f"   {region}: {response.status_code}")
            if response.status_code != 200:
                error = response.json().get('detail', 'Unknown')
                print(f"        Error: {error}")
        except Exception as e:
            print(f"   {region}: Exception - {e}")
    
    # 4. Test without coze_region
    print("\n4️⃣ NO COZE REGION TEST")
    no_region_request = {
        "input": {
            "source_type": "TEXT",
            "source_text": "Test without region",
            "source_title": "No Region Test",
            "lang": "en"
        }
    }
    
    try:
        response = requests.post(
            api_url,
            json=no_region_request,
            params={"use_mock": False},
            headers={'Content-Type': 'application/json'},
            timeout=15
        )
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text[:200]}...")
    except Exception as e:
        print(f"   Exception: {e}")
    
    # 5. Test with different languages
    print("\n5️⃣ LANGUAGE TEST")
    languages = ["en", "zh", "es", "fr"]
    
    for lang in languages:
        lang_request = {
            "input": {
                "source_type": "TEXT",
                "source_text": f"Test in {lang}",
                "source_title": f"Test {lang}",
                "lang": lang,
                "coze_region": "CN"
            }
        }
        
        try:
            response = requests.post(
                api_url,
                json=lang_request,
                params={"use_mock": False},
                headers={'Content-Type': 'application/json'},
                timeout=15
            )
            print(f"   {lang}: {response.status_code}")
        except Exception as e:
            print(f"   {lang}: Exception - {e}")
    
    # 6. Check if there are any working examples
    print("\n6️⃣ CHECK EXISTING CARDS")
    try:
        cards_response = requests.get("https://curify-video-translate-fhhrczckd5hef8ft.westus2-01.azurewebsites.net/inspiration/cards?limit=5")
        if cards_response.status_code == 200:
            cards = cards_response.json()
            print(f"   Found {len(cards)} existing cards")
            if cards:
                print("   Recent card examples:")
                for card in cards[:3]:
                    print(f"     - {card.get('output_title', 'N/A')} ({card.get('lang', 'N/A')})")
                    print(f"       Source: {card.get('source_type', 'N/A')}")
        else:
            print(f"   Failed to fetch cards: {cards_response.status_code}")
    except Exception as e:
        print(f"   Exception fetching cards: {e}")
    
    # 7. Recommendations
    print("\n7️⃣ RECOMMENDATIONS")
    print("   Based on the diagnostic results:")
    print("   📋 If ALL Coze calls fail with 500 errors:")
    print("      - Coze service is down or misconfigured")
    print("      - Check Coze API keys and bot IDs")
    print("      - Verify Coze service status")
    print("   📋 If only some regions work:")
    print("      - Use working regions only")
    print("      - Update region configuration")
    print("   📋 If mock works but Coze doesn't:")
    print("      - Issue is with Coze backend, not your integration")
    print("      - Use mock for development until Coze is fixed")
    
    print("\n🔧 IMMEDIATE SOLUTIONS:")
    print("   1. Use mock=True for development/testing")
    print("   2. Contact backend team about Coze service issues")
    print("   3. Monitor Coze service status")
    print("   4. Implement fallback to mock when Coze fails")

def create_fallback_script():
    """Create a script with automatic fallback to mock"""
    
    fallback_script = '''#!/usr/bin/env python3
"""
Hot Topics Pipeline with Automatic Coze Fallback
"""

import json
import requests
from complete_hot_topics_pipeline import HotTopicsPipeline

class RobustHotTopicsPipeline(HotTopicsPipeline):
    """Pipeline with automatic fallback to mock when Coze fails"""
    
    def send_topics_to_api(self, curated_data, use_mock=False, auto_fallback=True):
        """Send topics with automatic fallback to mock if Coze fails"""
        
        items = curated_data.get('input', {}).get('items', [])
        if not items:
            return None
        
        print(f"📡 Sending {len(items)} topics to inspiration API...")
        
        # First, try with requested mode
        print(f"🎭 Testing with use_mock={use_mock}...")
        
        # Test with first item to check if service is working
        test_result = self._test_single_item(items[0], use_mock)
        
        if not test_result['success'] and auto_fallback and not use_mock:
            print("⚠️ Coze service failing, automatically falling back to mock mode...")
            use_mock = True
            print("🎭 Retrying with mock mode...")
        
        # Continue with all items
        return super().send_topics_to_api(curated_data, use_mock)
    
    def _test_single_item(self, item, use_mock):
        """Test API with single item"""
        source_url = item.get('signal', {}).get('sources', [{}])[0].get('url')
        
        if not source_url:
            return {'success': False, 'error': 'No URL'}
        
        api_request = {
            "input": {
                "source_type": "URL",
                "source_url": source_url,
                "source_title": item['signal']['title'],
                "lang": "en",
                "coze_region": "CN"
            }
        }
        
        try:
            response = requests.post(
                self.api_url,
                json=api_request,
                params={"use_mock": use_mock},
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            return {
                'success': response.status_code == 200,
                'status': response.status_code,
                'error': response.json().get('detail') if response.status_code != 200 else None
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}

def main():
    """Run pipeline with automatic fallback"""
    scores_json_path = "/Users/ronel/Downloads/dev/templates/curify/curify-frontend/app/[locale]/(app)/hot-topics/output_scores.json"
    
    pipeline = RobustHotTopicsPipeline(scores_json_path)
    
    # Run with automatic fallback (starts with real Coze, falls back to mock if needed)
    report = pipeline.run_complete_pipeline(
        target_count=3,  # Test with fewer items first
        use_mock=False,  # Start with real Coze
        auto_fallback=True  # Enable automatic fallback
    )
    
    if report:
        print("🎉 Pipeline completed with fallback support!")
    else:
        print("❌ Pipeline failed!")

if __name__ == "__main__":
    main()
'''
    
    with open("/Users/ronel/Downloads/dev/templates/curify/curify-frontend/app/[locale]/(app)/hot-topics/robust_hot_topics_pipeline.py", "w") as f:
        f.write(fallback_script)
    
    print("   📁 Created robust_hot_topics_pipeline.py with automatic fallback")

def main():
    """Main execution"""
    diagnose_coze_issue()
    create_fallback_script()

if __name__ == "__main__":
    main()
