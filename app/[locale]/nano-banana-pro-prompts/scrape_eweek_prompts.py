import os
import re
import sqlite3
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from database.models import NanoBananaDatabase

class EWeekScraper:
    def __init__(self):
        self.base_url = "https://www.eweek.com/news/best-nano-banana-prompts-to-try/"
        self.db = NanoBananaDatabase()
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        })
    
    def download_image(self, url, save_dir='static/images'):
        """Download an image and return the local path"""
        try:
            # Create directory if it doesn't exist
            os.makedirs(save_dir, exist_ok=True)
            
            # Get the image filename from the URL
            parsed_url = urlparse(url)
            filename = os.path.basename(parsed_url.path)
            
            # Clean the filename
            filename = re.sub(r'[^\w\-\.]', '_', filename)
            
            # Full path to save the image
            filepath = os.path.join(save_dir, filename)
            
            # Skip if file already exists
            if os.path.exists(filepath):
                return f"/{save_dir}/{filename}"
            
            # Download the image
            response = self.session.get(url, stream=True)
            response.raise_for_status()
            
            # Save the image
            with open(filepath, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            return f"/{save_dir}/{filename}"
            
        except Exception as e:
            print(f"Error downloading image {url}: {e}")
            return None
    
    def extract_prompts(self, html_content):
        """Extract prompts and images from the article"""
        soup = BeautifulSoup(html_content, 'html.parser')
        prompts = []
        
        # Find all h2 elements that contain prompt numbers
        headers = soup.find_all(['h2', 'h3'])
        
        for i in range(len(headers)):
            header = headers[i]
            
            # Skip if header doesn't contain a number (like "Final takeaway")
            if not re.search(r'\d+', header.get_text()):
                continue
                
            # Get the prompt title (remove the number)
            title = re.sub(r'^\d+[\.\s]+', '', header.get_text().strip())
            
            # Find the next figure (image) after the header
            figure = header.find_next('figure')
            
            # Find the paragraph containing the prompt text (look for strong/em with "Prompt:")
            prompt_text = ""
            next_elem = header.next_sibling
            
            # Look for the prompt text in the next elements
            while next_elem and not prompt_text:
                if hasattr(next_elem, 'find_all'):
                    # Check for <p><strong>Prompt:</strong> ...</p> or similar
                    strong = next_elem.find(['strong', 'em', 'b'])
                    if strong and 'prompt' in strong.get_text().lower():
                        # Get the entire paragraph text
                        prompt_text = next_elem.get_text().strip()
                        # Remove the "Prompt:" part
                        prompt_text = re.sub(r'^[^:]+:', '', prompt_text).strip()
                        break
                next_elem = next_elem.next_sibling
            
            # If we found a figure with an image
            image_url = None
            if figure:
                img = figure.find('img')
                if img and 'src' in img.attrs:
                    image_url = img['src']
                    # Make sure the URL is absolute
                    if not image_url.startswith(('http://', 'https://')):
                        image_url = urljoin(self.base_url, image_url)
            
            if prompt_text and title:
                prompts.append({
                    'title': title,
                    'prompt_text': prompt_text,
                    'image_url': image_url,
                    'source_url': self.base_url,
                    'author': 'eWeek',
                    'category': 'Nano Banana',
                    'source_type': 'eweek',
                    'featured': True
                })
        
        return prompts
    
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
                    (prompt['title'], 'eweek')
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
                    prompt['source_type'],
                    f"eweek-{prompt['title'].lower().replace(' ', '-')[:50]}",
                    prompt['title'],
                    prompt.get('description', ''),
                    prompt['prompt_text'],
                    prompt['author'],
                    prompt['category'],
                    1 if prompt.get('featured', False) else 0,
                    local_image_path or prompt.get('image_url', ''),
                    prompt['source_url']
                ))
                
                count += 1
                print(f"Added prompt: {prompt['title']}")
                
            except sqlite3.IntegrityError as e:
                print(f"Error saving prompt {prompt['title']}: {e}")
            except Exception as e:
                print(f"Unexpected error: {e}")
        
        conn.commit()
        conn.close()
        return count
    
    def run(self):
        """Run the scraper"""
        print(f"Scraping prompts from: {self.base_url}")
        
        try:
            # Fetch the page
            response = self.session.get(self.base_url)
            response.raise_for_status()
            
            # Extract prompts
            prompts = self.extract_prompts(response.text)
            
            # Save to database
            count = self.save_to_database(prompts)
            
            print(f"\n✅ Successfully added {count} new prompts to the database!")
            
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    scraper = EWeekScraper()
    scraper.run()
