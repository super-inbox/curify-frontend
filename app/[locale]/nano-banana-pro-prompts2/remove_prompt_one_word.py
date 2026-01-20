#!/usr/bin/env python3
"""
Script to clean up the database by removing one-word prompts.
"""
import sqlite3
import argparse
from pathlib import Path

def count_one_word_prompts(db_path):
    """Count the number of one-word prompts in the database."""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Count prompts with exactly one word (no spaces)
    cursor.execute('''
        SELECT COUNT(*) 
        FROM prompts 
        WHERE LENGTH(TRIM(prompt_text)) - LENGTH(REPLACE(TRIM(prompt_text), ' ', '')) = 0
          AND TRIM(prompt_text) != ''
    ''')
    
    count = cursor.fetchone()[0]
    conn.close()
    return count

def get_one_word_prompts(db_path, limit=10):
    """Get sample one-word prompts (for preview)."""
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, prompt_text 
        FROM prompts 
        WHERE LENGTH(TRIM(prompt_text)) - LENGTH(REPLACE(TRIM(prompt_text), ' ', '')) = 0
          AND TRIM(prompt_text) != ''
        LIMIT ?
    ''', (limit,))
    
    prompts = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return prompts

def remove_one_word_prompts(db_path, dry_run=False):
    """Remove one-word prompts from the database."""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # First, get the count of what would be deleted
    cursor.execute('''
        SELECT COUNT(*) 
        FROM prompts 
        WHERE LENGTH(TRIM(prompt_text)) - LENGTH(REPLACE(TRIM(prompt_text), ' ', '')) = 0
          AND TRIM(prompt_text) != ''
    ''')
    
    count = cursor.fetchone()[0]
    
    if count == 0:
        print("✅ No one-word prompts found in the database.")
        return 0
        
    if dry_run:
        print(f"ℹ️  Would remove {count} one-word prompts (dry run)")
        return count
    
    # Actually delete the prompts
    cursor.execute('''
        DELETE FROM prompts 
        WHERE LENGTH(TRIM(prompt_text)) - LENGTH(REPLACE(TRIM(prompt_text), ' ', '')) = 0
          AND TRIM(prompt_text) != ''
    ''')
    
    conn.commit()
    deleted = cursor.rowcount
    conn.close()
    
    print(f"✅ Removed {deleted} one-word prompts from the database.")
    return deleted

def main():
    parser = argparse.ArgumentParser(description='Clean up one-word prompts from the database.')
    parser.add_argument('--db', default='nano_banana.db', 
                       help='Path to the SQLite database file (default: nano_banana.db)')
    parser.add_argument('--dry-run', action='store_true',
                       help='Show what would be deleted without making changes')
    parser.add_argument('--preview', action='store_true',
                       help='Show a preview of one-word prompts that would be removed')
    
    args = parser.parse_args()
    
    # Resolve the database path
    db_path = Path(args.db).resolve()
    
    if not db_path.exists():
        print(f"❌ Database file not found: {db_path}")
        return 1
    
    print(f"🔍 Database: {db_path}")
    
    if args.preview:
        print("\n🔎 Preview of one-word prompts that would be removed:")
        prompts = get_one_word_prompts(db_path, limit=10)
        if prompts:
            for i, prompt in enumerate(prompts, 1):
                print(f"  {i}. ID: {prompt['id']} | Prompt: {prompt['prompt_text']}")
            print(f"\n(Showing first {len(prompts)} of {count_one_word_prompts(db_path)} one-word prompts)")
        else:
            print("  No one-word prompts found.")
    
    if not args.preview or not args.dry_run:
        remove_one_word_prompts(db_path, dry_run=args.dry_run)
    
    return 0

if __name__ == "__main__":
    exit(main())
