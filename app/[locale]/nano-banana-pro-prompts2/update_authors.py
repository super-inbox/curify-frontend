import sqlite3
import re

def extract_twitter_handle(url):
    """Extract Twitter handle from URL"""
    if not url or 'twitter.com' not in url:
        return None, None
    
    # Try to extract handle from URL like https://twitter.com/username/status/12345
    match = re.search(r'twitter\.com/([^/]+)', url)
    if match:
        handle = match.group(1)
        if handle != 'i':  # Skip 'i' as it's part of the URL structure
            return f"@{handle}", handle
    return None, None

def update_authors(db_path='nano_banana.db'):
    """Update author information based on Twitter URLs"""
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Get all prompts with source_type 'promptgather' and source_url containing twitter.com
    cursor.execute('''
        SELECT id, source_url, author, author_handle 
        FROM prompts 
        WHERE source_type = 'promptgather' 
        AND source_url LIKE '%twitter.com%'
    ''')
    
    updates = []
    for row in cursor.fetchall():
        if row['author'] == 'PromptGather.io':
            author, handle = extract_twitter_handle(row['source_url'])
            if author:
                updates.append((author, handle, row['id']))
    
    # Update the database
    if updates:
        cursor.executemany('''
            UPDATE prompts 
            SET author = ?, author_handle = ?
            WHERE id = ?
        ''', updates)
        conn.commit()
        print(f"✅ Updated {len(updates)} author records")
    else:
        print("ℹ️ No records to update")
    
    conn.close()

if __name__ == "__main__":
    print("🔄 Updating author information...")
    update_authors()
    print("✅ Update complete")
