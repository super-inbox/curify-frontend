import os
import pandas as pd
import json
from database.models import NanoBananaDatabase
from datetime import datetime

def clean_text(text):
    """Clean and format text data"""
    if pd.isna(text):
        return ""
    return str(text).strip()

def import_excel_to_db(excel_path, db_path='nano_banana.db'):
    """
    Import prompts from Excel file to the database.
    
    Args:
        excel_path (str): Path to the Excel file
        db_path (str): Path to the SQLite database file
    """
    print(f"📂 Reading Excel file: {excel_path}")
    
    try:
        # Read the Excel file
        df = pd.read_excel(excel_path)
        
        # Print the first few rows to understand the structure
        print("\n📋 First few rows of the Excel file:")
        print(df.head(3).to_string())
        
        # Get the actual data (skip the first row which contains the header)
        df = df.iloc[1:].copy()
        
        # Reset index after dropping the first row
        df = df.reset_index(drop=True)
        
        # Rename columns based on the first row
        if len(df) > 0:
            # The first row contains the actual column names
            new_columns = {}
            for i, col in enumerate(df.columns):
                if i == 0:
                    new_columns[col] = 'tweet_id'
                elif i == 1:
                    new_columns[col] = 'tweet_url'
                elif i == 2:
                    new_columns[col] = 'prompt'
                elif i == 3:
                    new_columns[col] = 'prompt_type'
                elif i == 4:
                    new_columns[col] = 'model'
                elif i == 5:
                    new_columns[col] = 'image_url'
                else:
                    new_columns[col] = f'unnamed_{i}'
            
            df = df.rename(columns=new_columns)
            
            # Clean up the data
            for col in ['tweet_id', 'tweet_url', 'prompt', 'prompt_type', 'model', 'image_url']:
                if col in df.columns:
                    df[col] = df[col].apply(clean_text)
        else:
            print("❌ No data found in the Excel file")
            return
        
    except Exception as e:
        print(f"❌ Error reading Excel file: {str(e)}")
        import traceback
        traceback.print_exc()
        return
    
    # Initialize database
    db = NanoBananaDatabase(db_path)
    
    # Counter for imported prompts
    imported_count = 0
    skipped_count = 0
    
    # Process each row in the Excel file
    for idx, row in df.iterrows():
        try:
            # Skip rows with missing required data
            if pd.isna(row.get('prompt')) or not str(row.get('prompt', '')).strip():
                skipped_count += 1
                continue
            
            # Extract prompt text
            prompt_text = str(row.get('prompt', '')).strip()
            
            # Prepare prompt data
            prompt_data = {
                'source_type': 'promptgather',
                'source_id': f"pg_{row.get('tweet_id', str(hash(prompt_text)))}",
                'title': prompt_text[:150] + '...' if len(prompt_text) > 150 else prompt_text,
                'description': prompt_text,
                'prompt_text': prompt_text,
                'author': 'PromptGather.io',
                'author_handle': '@promptgather',
                'date': datetime.now().strftime('%Y-%m-%dT%H:%M:%S'),
                'category': row.get('prompt_type', 'NANO BANANA PRO'),
                'source_url': row.get('tweet_url', ''),
                'image_url': row.get('image_url', ''),
                'likes': 0,
                'retweets': 0,
                'source_hash': f"pg_{row.get('tweet_id', str(hash(prompt_text)))}"
            }
            
            # Save to database
            prompt_id = db.save_prompt(prompt_data)
            if prompt_id:
                imported_count += 1
                if imported_count % 10 == 0:
                    print(f"✅ Imported {imported_count} prompts...")
            else:
                skipped_count += 1
                
        except Exception as e:
            print(f"⚠️  Error processing row {idx}: {str(e)}")
            skipped_count += 1
    
    print(f"\n✨ Import complete!")
    print(f"📊 Total imported: {imported_count}")
    print(f"⏭️  Skipped: {skipped_count}")
    print(f"💾 Database: {os.path.abspath(db_path)}")

if __name__ == "__main__":
    excel_path = 'Nano Banana Pro Prompts - www.promptgather.io.xlsx'
    db_path = 'nano_banana.db'
    
    print("🚀 Starting Excel to Database Import")
    print("=" * 40)
    
    # Get absolute paths
    excel_path = os.path.abspath(excel_path)
    db_path = os.path.abspath(db_path)
    
    print(f"📂 Excel file: {excel_path}")
    print(f"💾 Database: {db_path}")
    print("-" * 40)
    
    # Run the import
    import_excel_to_db(excel_path, db_path)
