import requests
from bs4 import BeautifulSoup
import re
from datetime import datetime
from database.models import NanoBananaDatabase

def clean_text(text):
    """Clean and normalize text content"""
    if not text:
        return ""
    # Remove extra whitespace and newlines
    text = ' '.join(text.split())
    # Remove leading numbers and dots (e.g., "1. ")
    text = re.sub(r'^\d+\.?\s*', '', text)
    # Remove any remaining HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    return text.strip()

def extract_prompts_from_imagine_art(url):
    """Extract prompts from Imagine.art blog post's '75+ Nano Banana Pro Prompts' section"""
    try:
        # Send GET request to the URL with browser-like headers
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://www.imagine.art/'
        }
        
        print("🌐 Fetching the webpage...")
        session = requests.Session()
        response = session.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        print("🔍 Parsing content...")
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find the main content area
        main_content = soup.find('main')
        if not main_content:
            print("❌ Could not find the main content area")
            return []
        
        # Initialize variables
        prompts = []
        current_category = None
        seen_prompts = set()
        
        # Find all section headers (h2 elements with ids starting with a letter and a period)
        sections = main_content.find_all(['h2'], id=re.compile(r'^[a-z]\..*'))
        
        for section in sections:
            # Get the section title (A., B., C., etc.)
            section_title = section.get_text(strip=True)
            if not section_title or len(section_title) < 3:  # Skip empty or too short titles
                continue
                
            current_category = section_title
            print(f"📌 Found section: {current_category}")
            
            # Find the next section to know where to stop
            next_section = section.find_next_sibling(['h2'])
            section_content = []
            
            # Get all elements between current section and next section
            if next_section:
                elem = section.next_sibling
                while elem and elem != next_section:
                    if hasattr(elem, 'name'):
                        section_content.append(elem)
                    elem = elem.next_sibling
            else:
                # If no next section, take all elements until the end
                elem = section.next_sibling
                while elem:
                    if hasattr(elem, 'name'):
                        section_content.append(elem)
                    elem = elem.next_sibling
            
            # Process the section content to find prompts
            for elem in section_content:
                # Skip if not a tag element
                if not hasattr(elem, 'name'):
                    continue
                    
                # Stop if we hit the next major section
                if elem.name in ['h2', 'h1'] and 'Ready to create and remix' in elem.get_text('', strip=True):
                    break
                
                # Look for ordered lists (ol) or list items (li)
                if elem.name == 'ol' or (elem.name == 'div' and 'list-decimal' in elem.get('class', [])):
                    # Find all list items
                    list_items = elem.find_all('li', recursive=False)
                    
                    for li in list_items:
                        # Get the text content of the list item
                        text = clean_text(li.get_text())
                        
                        # Skip if text is too short or just whitespace
                        if len(text) < 10 or not text.strip():
                            continue
                            
                        # Create a unique ID for the prompt
                        prompt_id = f"{current_category}_{hash(text.lower())}"
                        
                        if prompt_id not in seen_prompts:
                            seen_prompts.add(prompt_id)
                            
                            # Create a title (first 10 words or first 80 chars)
                            words = text.split()[:10]
                            title = f"{current_category}: {' '.join(words)}"
                            if len(title) > 80:
                                title = title[:77] + '...'
                            
                            # Try to extract product name from [brackets] if present
                            product_match = re.search(r'\[(.*?)\]', text)
                            product_name = product_match.group(1) if product_match else ''
                            
                            prompt = {
                                'title': title,
                                'content': text,
                                'image_url': None,
                                'category': current_category,
                                'prompt_id': prompt_id,
                                'product': product_name
                            }
                            prompts.append(prompt)
                            print(f"✅ Added prompt: {title}")
                
                # Also check for paragraphs that might contain prompts
                elif elem.name == 'p':
                    text = clean_text(elem.get_text())
                    
                    # Skip if text is too short, contains common navigation text, or is just whitespace
                    if (len(text) < 15 or 
                        any(phrase in text.lower() for phrase in ['read more', 'click here', 'share this']) or 
                        not text.strip()):
                        continue
                    
                    # Check if this paragraph looks like a prompt (starts with a number or has product brackets)
                    if re.match(r'^\d+\.', text) or '[' in text:
                        # Clean up the text
                        text = re.sub(r'^\d+\.?\s*', '', text)  # Remove leading numbers
                        
                        # Create a unique ID for the prompt
                        prompt_id = f"{current_category}_{hash(text.lower())}"
                        
                        if prompt_id not in seen_prompts:
                            seen_prompts.add(prompt_id)
                            
                            # Create a title (first 10 words or first 80 chars)
                            words = text.split()[:10]
                            title = f"{current_category}: {' '.join(words)}"
                            if len(title) > 80:
                                title = title[:77] + '...'
                            
                            # Try to extract product name from [brackets] if present
                            product_match = re.search(r'\[(.*?)\]', text)
                            product_name = product_match.group(1) if product_match else ''
                            
                            prompt = {
                                'title': title,
                                'content': text,
                                'image_url': None,
                                'category': current_category,
                                'prompt_id': prompt_id,
                                'product': product_name
                            }
                            prompts.append(prompt)
                            print(f"✅ Added prompt: {title}")
        
        print(f"📋 Successfully extracted {len(prompts)} unique prompts")
        return prompts
        
    except requests.RequestException as e:
        print(f"❌ Network error while fetching {url}: {str(e)}")
        return []
    except Exception as e:
        print(f"❌ Error processing {url}: {str(e)}")
        return []

def save_to_database(prompts, db_path='nano_banana.db'):
    """Save extracted prompts to the database"""
    if not prompts:
        print("⚠️ No prompts to save")
        return 0
    
    db = NanoBananaDatabase(db_path)
    saved_count = 0
    skipped_count = 0
    
    for prompt in prompts:
        if not prompt.get('title') or not prompt.get('content'):
            skipped_count += 1
            continue
            
        # Create a more reliable source_id using the prompt_id if available
        prompt_id = prompt.get('prompt_id', f"imagine_art_{hash(prompt['title'] + prompt['content'][:100])}")
        
        prompt_data = {
            'source_type': 'imagine_art',
            'source_id': prompt_id,
            'title': prompt['title'],
            'description': prompt['content'][:500] + ('...' if len(prompt['content']) > 500 else ''),
            'prompt_text': prompt['content'],
            'author': 'Imagine.art',
            'author_handle': '@imagine_art',
            'date': datetime.now().strftime('%Y-%m-%dT%H:%M:%S'),
            'category': prompt.get('category', 'NANO BANANA PRO'),
            'source_url': 'https://www.imagine.art/blogs/nano-banana-pro-prompt-guide',
            'image_url': prompt.get('image_url', ''),
            'likes': 0,
            'retweets': 0,
            'source_hash': prompt_id  # Using the same ID for deduplication
        }
        
        # Save to database
        if db.save_prompt(prompt_data):
            saved_count += 1
            print(f"✅ Saved: {prompt['title'][:50]}...")
    
    total_attempted = len(prompts)
    if skipped_count > 0:
        print(f"⚠️  Skipped {skipped_count} prompts due to missing data")
    print(f"\n✨ Successfully saved {saved_count} out of {total_attempted} prompts to database")
    return saved_count

def main():
    url = "https://www.imagine.art/blogs/nano-banana-pro-prompt-guide"
    print(f"🌐 Scraping prompts from: {url}")
    prompts = extract_prompts_from_imagine_art(url)
    
    if not prompts:
        print("❌ No prompts found on the page")
        return
    
    # Show summary of what we found
    print(f"\n📊 Found {len(prompts)} unique prompts:")
    
    # Group prompts by category for better display
    categories = {}
    for prompt in prompts:
        cat = prompt.get('category', 'Uncategorized')
        if cat not in categories:
            categories[cat] = 0
        categories[cat] += 1
    
    print("\n📂 Categories found:")
    for cat, count in categories.items():
        print(f"  • {cat}: {count} prompts")
    
    # Show a few samples
    print("\n🔍 Sample prompts:")
    for i, prompt in enumerate(prompts[:3], 1):
        print(f"\n--- Prompt {i} ---")
        print(f"Category: {prompt.get('category', 'N/A')}")
        print(f"Title: {prompt.get('title', 'No title')}")
        print(f"Content: {prompt.get('content', 'No content')[:120]}...")
    
    # Ask for confirmation before saving
    print("\n" + "="*60)
    save = input("\nDo you want to save these prompts to the database? (y/n): ").strip().lower()
    
    if save == 'y':
        saved_count = save_to_database(prompts)
        if saved_count > 0:
            print(f"\n✅ Successfully saved {saved_count} prompts to the database!")
        else:
            print("\n⚠️  No prompts were saved to the database.")

if __name__ == "__main__":
    main()
