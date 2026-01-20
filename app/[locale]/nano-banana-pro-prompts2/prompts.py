import os
import re
import sqlite3
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import time
from database.models import NanoBananaDatabase

class PromptGatherScraper:
    def __init__(self):
        self.base_url = "https://promptgather.io/images/explore"
        self.db = NanoBananaDatabase()
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })

    def get_page_content(self, page=1):
        """Fetch the content of a specific page"""
        url = f"{self.base_url}/{page}" if page > 1 else self.base_url
        try:
            response = self.session.get(url)
            response.raise_for_status()
            return response.text
        except Exception as e:
            print(f"Error fetching page {page}: {e}")
            return None

    def extract_prompts(self, html_content):
        """Extract prompts and their details from the HTML content"""
        soup = BeautifulSoup(html_content, 'html.parser')
        prompt_cards = soup.select('.break-inside-avoid.mb-8')
        
        prompts = []
        for card in prompt_cards:
            try:
                # Extract title
                title_elem = card.select_one('.card-title a')
                title = title_elem.get_text(strip=True) if title_elem else "Untitled"
                
                # Extract description
                desc_elem = card.select_one('p.text-gray-600')
                description = desc_elem.get_text(strip=True) if desc_elem else ""
                
                # Extract prompt text (from the image alt text)
                img_elem = card.select_one('img[alt]')
                prompt_text = img_elem['alt'] if img_elem and 'alt' in img_elem.attrs else ""
                
                # Get image URL
                img_src = img_elem['src'] if img_elem and 'src' in img_elem.attrs else ""
                
                # Get full image URL
                full_img_url = urljoin(self.base_url, img_src) if img_src else ""
                
                # Extract tags
                tags = []
                tag_elems = card.select('a[href^="/images/tags/"]')
                for tag in tag_elems:
                    tag_text = tag.get_text(strip=True)
                    if tag_text and tag_text not in tags:
                        tags.append(tag_text)
                
                # Get view URL
                view_elem = card.select_one('a[href^="/image/"]')
                view_url = urljoin(self.base_url, view_elem['href']) if view_elem else ""
                
                prompts.append({
                    'title': title,
                    'description': description,
                    'prompt_text': prompt_text,
                    'image_url': full_img_url,
                    'source_url': view_url,
                    'tags': tags,
                    'author': 'PromptGather',
                    'category': 'AI Art',
                    'source_type': 'promptgather'
                })
                
            except Exception as e:
                print(f"Error processing a prompt card: {e}")
                continue
                
        return prompts

    def download_image(self, url, save_dir='static/images'):
        """Download an image and return the local path"""
        if not url:
            return None
            
        try:
            # Create directory if it doesn't exist
            os.makedirs(save_dir, exist_ok=True)
            
            # Get the image filename from the URL
            filename = os.path.basename(url.split('?')[0])  # Remove query params
            if not filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
                filename += '.jpg'
                
            filepath = os.path.join(save_dir, filename)
            
            # Skip if file already exists
            if os.path.exists(filepath):
                return f"/{save_dir}/{filename}"
            
            # Download the image
            response = self.session.get(url, stream=True)
            response.raise_for_status()
            
            with open(filepath, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
                    
            return f"/{save_dir}/{filename}"
            
        except Exception as e:
            print(f"Error downloading image {url}: {e}")
            return None

    def save_to_database(self, prompts):
        """Save prompts to the database"""
        conn = sqlite3.connect(self.db.db_path)
        cursor = conn.cursor()
        
        count = 0
        for prompt in prompts:
            try:
                # Check if prompt already exists
                cursor.execute(
                    'SELECT id FROM prompts WHERE title = ? AND source_type = ?',
                    (prompt['title'], 'promptgather')
                )
                if cursor.fetchone():
                    print(f"Skipping existing prompt: {prompt['title']}")
                    continue
                
                # Download image if it doesn't exist
                local_image_path = None
                if prompt.get('image_url'):
                    local_image_path = self.download_image(prompt['image_url'])
                
                # Insert the prompt
                cursor.execute('''
                    INSERT INTO prompts (
                        source_type, source_id, title, description, prompt_text,
                        author, category, featured, image_url, source_url
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    'promptgather',
                    f"pg-{prompt['title'].lower().replace(' ', '-')[:50]}",
                    prompt['title'],
                    prompt.get('description', ''),
                    prompt['prompt_text'],
                    prompt['author'],
                    prompt['category'],
                    1 if prompt.get('featured', False) else 0,
                    local_image_path or prompt.get('image_url', ''),
                    prompt['source_url']
                ))
                
                # Get the inserted prompt ID
                prompt_id = cursor.lastrowid
                
                # Save tags (you'll need a tags table and a prompt_tags junction table)
                # This is a simplified version - you'll need to implement the tags logic
                if prompt.get('tags'):
                    print(f"Tags for {prompt['title']}: {', '.join(prompt['tags'])}")
                    # Implement tag saving logic here
                
                count += 1
                print(f"Added prompt: {prompt['title']}")
                
            except sqlite3.IntegrityError as e:
                print(f"Error saving prompt {prompt['title']}: {e}")
            except Exception as e:
                print(f"Unexpected error: {e}")
        
        conn.commit()
        conn.close()
        return count

    def scrape(self, max_pages=5):
        """Scrape multiple pages of prompts"""
        total_added = 0
        page = 1
        
        while page <= max_pages:
            print(f"\nScraping page {page}...")
            html_content = self.get_page_content(page)
            
            if not html_content:
                print(f"Failed to get content for page {page}")
                break
                
            prompts = self.extract_prompts(html_content)
            
            if not prompts:
                print(f"No more prompts found on page {page}")
                break
                
            added = self.save_to_database(prompts)
            total_added += added
            print(f"Added {added} prompts from page {page}")
            
            # Check if there's a next page
            if f'href="/images/explore/{page + 1}"' not in html_content:
                print("No more pages to scrape")
                break
                
            page += 1
            time.sleep(2)  # Be nice to the server
            
        print(f"\n✅ Done! Added {total_added} new prompts in total.")

if __name__ == "__main__":
    scraper = PromptGatherScraper()
    scraper.scrape(max_pages=308)  # Scrape first 5 pages