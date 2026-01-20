import re
import hashlib
from database.models import NanoBananaDatabase
from datetime import datetime

def extract_prompts_from_md(file_path):
    """Extract prompts from the GitHub markdown file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Split content into sections
    sections = re.split(r'### \d+\.\d+\.\s+', content)[1:]  # Skip first empty section
    
    prompts = []
    
    for section in sections:
        # Extract section title (first line)
        lines = section.strip().split('\n')
        if not lines:
            continue
            
        section_title = lines[0].strip('*').strip()
        
        # Find all prompt blocks (```text or ```json)
        prompt_blocks = re.findall(r'```(?:json|text)?\n(.*?)```', section, re.DOTALL)
        
        # Find image URLs
        image_matches = re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', section)
        image_url = image_matches[0] if image_matches else ''
        
        # Find source information
        source_match = re.search(r'\*Source:\s*\[([^\]]+)\]\(([^)]+)\)', section, re.IGNORECASE)
        author = source_match.group(1) if source_match else 'Awesome Nano Banana Pro'
        source_url = source_match.group(2) if source_match else 'https://github.com/ZeroLu/awesome-nanobanana-pro'
        
        # Process each prompt in the section
        for i, prompt_text in enumerate(prompt_blocks):
            prompt_text = prompt_text.strip()
            if not prompt_text:
                continue
                
            # Generate a unique ID for the prompt
            prompt_hash = hashlib.md5((section_title + prompt_text).encode()).hexdigest()
            
            prompt_data = {
                'source_type': 'github',
                'source_id': f'github_{prompt_hash}',
                'title': f"{section_title} - Example {i+1}",
                'description': f"Prompt from {section_title} section of Awesome Nano Banana Pro",
                'prompt_text': prompt_text,
                'author': author,
                'author_handle': author.split('@')[-1] if '@' in author else '',
                'date': datetime.now().strftime('%Y-%m-%dT%H:%M:%S'),
                'category': 'NANO BANANA PRO',
                'source_url': source_url,
                'image_url': image_url,
                'likes': 0,
                'retweets': 0,
                'source_hash': f'github_{prompt_hash}'
            }
            prompts.append(prompt_data)
    
    return prompts

def main():
    # Initialize database
    db = NanoBananaDatabase()
    
    # Path to the GitHub markdown file
    md_file = '/Users/ronel/Downloads/dev/templates/curify-studio/twiiternanobannana/github.md'
    
    print(f"Extracting prompts from {md_file}...")
    prompts = extract_prompts_from_md(md_file)
    
    print(f"Found {len(prompts)} prompts. Saving to database...")
    
    imported = 0
    skipped = 0
    
    for prompt in prompts:
        prompt_id = db.save_prompt(prompt)
        if prompt_id:
            imported += 1
            if imported % 5 == 0:
                print(f"Imported {imported} prompts...")
        else:
            skipped += 1
    
    print(f"\nImport complete!")
    print(f"- Successfully imported: {imported}")
    print(f"- Skipped (duplicates): {skipped}")

if __name__ == "__main__":
    main()
