import os
from services.collector import HybridPromptCollector
from config import TWITTER_BEARER_TOKEN, NEWS_API_KEY
def main():
    print("🚀 Starting the application...")
    print("🔑 Loading configuration...")
    
    # Initialize the collector
    collector = HybridPromptCollector(
        twitter_token=TWITTER_BEARER_TOKEN,
        news_api_key=NEWS_API_KEY,
        youtube_api_key=os.getenv('YOUTUBE_API_KEY')  # Get YouTube API key from environment
    )
    
    print("🔍 Running collection with query: 'Nano Banana Pro images'")
    try:
        # Run collection with a search query, skipping YouTube
        results = collector.run(query="Nano Banana Pro images", max_results=5)
        print("\n✅ Collection complete!")
        print(f"📊 Collected {results['total_collected']} prompts")
        print(f"🐦 Twitter results: {len(results['twitter'])}")
        print(f"📰 News results: {len(results['news'])}")
        print(f"💻 Hacker News results: {len(results['hackernews'])}")
        
        # Show some sample titles from Hacker News
        if results['hackernews']:
            print("\nTop Hacker News Stories:")
            for i, story in enumerate(results['hackernews'][:3], 1):
                print(f"{i}. {story['title']}")
                if story.get('source_url'):
                    print(f"   🔗 {story['source_url']}")
    except Exception as e:
        print(f"❌ Error during collection: {str(e)}")

if __name__ == "__main__":
    main()
