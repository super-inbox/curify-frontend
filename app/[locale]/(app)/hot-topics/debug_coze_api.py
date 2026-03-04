#!/usr/bin/env python3
"""
Debug Coze API issues by testing different URLs and configurations
"""

import json
import requests
from datetime import datetime

def test_coze_with_different_urls():
    """Test Coze API with different types of URLs"""
    
    api_url = "https://curify-video-translate-fhhrczckd5hef8ft.westus2-01.azurewebsites.net/inspiration/generate"
    
    # Test URLs of different types
    test_cases = [
        {
            "name": "Simple News Article",
            "url": "https://www.bbc.com/news",
            "title": "BBC News Homepage"
        },
        {
            "name": "Tech Blog Article", 
            "url": "https://techcrunch.com/2024/01/15/openai-sam-altman-return",
            "title": "OpenAI Sam Altman Return"
        },
        {
            "name": "Writing Prompts (Original)",
            "url": "https://writingprompts.com/memory-black-market/",
            "title": "Memory Black Market"
        },
        {
            "name": "Simple Text Content",
            "url": None,
            "text": "Artificial intelligence is transforming how we work and create. New AI tools are helping content creators be more productive and creative.",
            "title": "AI Transformation"
        },
        {
            "name": "Very Simple Text",
            "url": None,
            "text": "The sun rises in the east and sets in the west. This is a simple fact about our world.",
            "title": "Simple Facts"
        }
    ]
    
    print("🔍 Testing Coze API with different content types...")
    print(f"🌐 API URL: {api_url}")
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n🧪 Test {i}: {test_case['name']}")
        print(f"📝 Title: {test_case['title']}")
        
        # Prepare API request
        if test_case['url']:
            # Test with URL
            api_request = {
                "input": {
                    "source_type": "URL",
                    "source_url": test_case['url'],
                    "source_title": test_case['title'],
                    "lang": "en",
                    "coze_region": "CN"
                }
            }
        else:
            # Test with TEXT
            api_request = {
                "input": {
                    "source_type": "TEXT",
                    "source_text": test_case['text'],
                    "source_title": test_case['title'],
                    "lang": "en", 
                    "coze_region": "CN"
                }
            }
        
        # Try both regions
        for region in ["CN", "US"]:
            print(f"  🌍 Testing {region} region...")
            api_request["input"]["coze_region"] = region
            
            try:
                response = requests.post(
                    api_url,
                    json=api_request,
                    params={"use_mock": False},
                    headers={'Content-Type': 'application/json'},
                    timeout=30
                )
                
                if response.status_code == 200:
                    result = response.json()
                    print(f"    ✅ {region} SUCCESS! Generated {result.get('total_generated', 0)} cards")
                    if result.get('cards'):
                        card = result['cards'][0]
                        print(f"    📄 Card Title: {card.get('output_title', 'N/A')}")
                        print(f"    🎯 Content Type: {card.get('content_type', 'N/A')}")
                    break  # Success, no need to try other region
                else:
                    print(f"    ❌ {region} FAILED: {response.status_code}")
                    error_detail = response.json().get('detail', 'Unknown error')
                    print(f"    📄 Error: {error_detail}")
                    
            except Exception as e:
                print(f"    💥 {region} EXCEPTION: {str(e)}")
        
        # Add delay between tests
        if i < len(test_cases):
            import time
            time.sleep(2)

def test_content_extraction():
    """Test if the issue is with content extraction from URLs"""
    
    print("\n🔍 Testing content extraction...")
    
    # Test URLs that might have extraction issues
    problematic_urls = [
        "https://writingprompts.com/memory-black-market/",
        "https://www.theguardian.com/lifeandstyle/2026/feb/10/my-helicopter-went-into-freefall-inside-an-active-volcano",
        "https://www.popularmechanics.com/science/a70269027/quantum-multiverse-has-another-you/"
    ]
    
    for url in problematic_urls:
        print(f"\n📄 Testing URL: {url}")
        
        try:
            # Simple HEAD request to check if URL is accessible
            response = requests.head(url, timeout=10, allow_redirects=True)
            print(f"  🌐 URL Status: {response.status_code}")
            print(f"  📄 Content-Type: {response.headers.get('content-type', 'Unknown')}")
            print(f"  📏 Content-Length: {response.headers.get('content-length', 'Unknown')}")
            
            # Try GET request to see if content is accessible
            response = requests.get(url, timeout=10, allow_redirects=True)
            print(f"  📄 GET Status: {response.status_code}")
            print(f"  📝 Content Preview: {response.text[:200]}...")
            
        except Exception as e:
            print(f"  ❌ URL Error: {e}")

def main():
    """Main execution"""
    print("🚀 Starting Coze API Debugging...")
    
    # Test content extraction first
    test_content_extraction()
    
    # Test different URL types with Coze
    test_coze_with_different_urls()
    
    print("\n🏁 Debugging completed!")

if __name__ == "__main__":
    main()
