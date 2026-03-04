#!/usr/bin/env python3
"""
Test script for inspiration API integration
"""

import json
import requests
from curate_inspiration import HotTopicsCurator

def test_api_integration():
    """Test sending curated data to the inspiration API"""
    
    # Configuration
    scores_json_path = "/Users/ronel/Downloads/dev/templates/curify/curify-frontend/app/[locale]/(app)/hot-topics/output_scores.json"
    api_url = "https://curify-video-translate-fhhrczckd5hef8ft.westus2-01.azurewebsites.net/inspiration/generate"
    
    # Create curator
    curator = HotTopicsCurator(scores_json_path)
    
    # Select a smaller set for testing (3 topics)
    print("🧪 Testing API integration with 3 topics...")
    selected_topics = curator.select_diverse_topics(target_count=3)
    
    if not selected_topics:
        print("❌ No topics selected for testing")
        return
    
    # Format for API
    inspiration_data = curator.format_for_inspiration_api(selected_topics)
    
    # Display what will be sent
    print("\n📦 Data to be sent:")
    print(f"  - Items: {len(inspiration_data['input']['items'])}")
    print(f"  - API URL: {api_url}")
    
    for i, item in enumerate(inspiration_data['input']['items']):
        print(f"  - Item {i+1}: {item['signal']['title'][:50]}...")
    
    # Test API call
    print("\n📡 Testing API call...")
    try:
        response = requests.post(
            api_url,
            json=inspiration_data,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            print("✅ API call successful!")
            print(f"Response: {response.text}")
        else:
            print(f"❌ API call failed: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.Timeout:
        print("❌ Request timed out")
    except requests.exceptions.ConnectionError:
        print("❌ Connection error - check if API is accessible")
    except Exception as e:
        print(f"❌ Error: {e}")

def test_cors_setup():
    """Test CORS setup by making a preflight request"""
    api_url = "https://curify-video-translate-fhhrczckd5hef8ft.westus2-01.azurewebsites.net/inspiration/generate"
    
    print("\n🌐 Testing CORS setup...")
    
    try:
        # Make an OPTIONS request (preflight)
        response = requests.options(
            api_url,
            headers={
                'Origin': 'http://localhost:3000',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type'
            },
            timeout=10
        )
        
        print(f"OPTIONS Status: {response.status_code}")
        print(f"CORS Headers:")
        for header, value in response.headers.items():
            if 'access-control' in header.lower() or 'cors' in header.lower():
                print(f"  {header}: {value}")
                
    except Exception as e:
        print(f"❌ CORS test failed: {e}")

if __name__ == "__main__":
    print("🧪 Starting API integration tests...")
    
    # Test CORS first
    test_cors_setup()
    
    # Test actual API call
    test_api_integration()
    
    print("\n🏁 Testing completed!")
