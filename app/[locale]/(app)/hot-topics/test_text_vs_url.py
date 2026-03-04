#!/usr/bin/env python3
"""
Test URL vs TEXT source type with Coze API
"""

import json
import requests
import re

def detect_language_and_region(text, title):
    """Detect language and region like inspiration.js does"""
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

def test_url_vs_text():
    """Test URL vs TEXT source type"""
    
    api_url = "https://curify-video-translate-fhhrczckd5hef8ft.westus2-01.azurewebsites.net/inspiration/generate"
    
    # Test data from our curated topics
    test_cases = [
        {
            "title": "Memory Black Market",
            "url": "https://writingprompts.com/memory-black-market/",
            "summary": "Write a story about a street-level memory dealer who stumbles upon a cache of forbidden government secrets hidden inside a stranger's memories, sparking a deadly chase."
        },
        {
            "title": "AI Transformation", 
            "url": None,
            "summary": "Artificial intelligence is transforming how we work and create. New AI tools are helping content creators be more productive and creative."
        }
    ]
    
    print("🔍 Testing URL vs TEXT source type with Coze API...")
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n🧪 Test Case {i}: {test_case['title']}")
        
        # Test 1: URL source type
        if test_case['url']:
            print("  📄 Testing URL source type...")
            
            content_for_detection = test_case['summary'] + ' ' + test_case['title']
            detection = detect_language_and_region(content_for_detection, test_case['title'])
            
            url_request = {
                "input": {
                    "source_type": "URL",
                    "source_url": test_case['url'],
                    "source_title": test_case['title'],
                    "lang": detection['lang'],
                    "coze_region": detection['region']
                }
            }
            
            try:
                response = requests.post(
                    api_url,
                    json=url_request,
                    params={"use_mock": False},
                    headers={'Content-Type': 'application/json'},
                    timeout=30
                )
                
                print(f"    URL Result: {response.status_code}")
                if response.status_code != 200:
                    error = response.json().get('detail', 'Unknown')
                    print(f"    URL Error: {error}")
                else:
                    result = response.json()
                    print(f"    URL Success: Generated {result.get('total_generated', 0)} cards")
                    
            except Exception as e:
                print(f"    URL Exception: {e}")
        
        # Test 2: TEXT source type
        print("  📝 Testing TEXT source type...")
        
        content_for_detection = test_case['summary'] + ' ' + test_case['title']
        detection = detect_language_and_region(content_for_detection, test_case['title'])
        
        text_request = {
            "input": {
                "source_type": "TEXT",
                "source_url": None,
                "source_text": test_case['summary'],
                "source_title": test_case['title'],
                "lang": detection['lang'],
                "coze_region": detection['region']
            }
        }
        
        try:
            response = requests.post(
                api_url,
                json=text_request,
                params={"use_mock": False},
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            print(f"    TEXT Result: {response.status_code}")
            if response.status_code != 200:
                error = response.json().get('detail', 'Unknown')
                print(f"    TEXT Error: {error}")
            else:
                result = response.json()
                print(f"    TEXT Success: Generated {result.get('total_generated', 0)} cards")
                
        except Exception as e:
            print(f"    TEXT Exception: {e}")
        
        # Test 3: TEXT source type with mock (control test)
        print("  🎭 Testing TEXT source type with MOCK...")
        
        try:
            response = requests.post(
                api_url,
                json=text_request,
                params={"use_mock": True},
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            print(f"    MOCK Result: {response.status_code}")
            if response.status_code == 200:
                result = response.json()
                print(f"    MOCK Success: Generated {result.get('total_generated', 0)} cards")
            else:
                error = response.json().get('detail', 'Unknown')
                print(f"    MOCK Error: {error}")
                
        except Exception as e:
            print(f"    MOCK Exception: {e}")

if __name__ == "__main__":
    test_url_vs_text()
