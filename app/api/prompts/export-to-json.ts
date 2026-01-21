import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

// Type definitions
interface SourceRow {
  sourceType: string;
}

interface CategoryCount {
  category: string;
  count: number;
}

interface Prompt {
  id: number;
  title: string;
  description: string | null;
  promptText: string;
  author: string | null;
  authorHandle: string | null;
  date: string | null;
  category: string | null;
  imageUrl: string | null;
  sourceUrl: string | null;
  sourceType: string | null;
  likes: number;
  retweets: number;
  createdAt: string;
  layoutCategory: string | null;
  domainCategory: string | null;
}

// Path to the SQLite database
const dbPath = path.join(
  process.cwd(),
  'app/[locale]/nano-banana-pro-prompts/nano_banana.db'
);

// Path to the output JSON file
const outputPath = path.join(process.cwd(), 'public/data/nanobanana.json');

// Ensure the output directory exists
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Connect to the database
const db = new Database(dbPath, { readonly: true });

try {
  // Query all prompts
  const prompts = db.prepare<Prompt[]>(`
    SELECT 
      id,
      title,
      description,
      prompt_text as promptText,
      author,
      author_handle as authorHandle,
      date,
      category,
      image_url as imageUrl,
      source_url as sourceUrl,
      source_type as sourceType,
      likes,
      retweets,
      created_at as createdAt,
      layout_category as layoutCategory,
      domain_category as domainCategory
    FROM prompts
    ORDER BY created_at DESC
  `).all();

  // Get metadata
  type SourceRowResult = { sourceType: string };
  const sources = (db.prepare(`
    SELECT DISTINCT source_type as sourceType 
    FROM prompts 
    WHERE source_type IS NOT NULL
  `).all() as SourceRowResult[]).map((s: SourceRowResult) => s.sourceType).filter(Boolean).sort();

  const layoutCategories = db.prepare<CategoryCount[]>(`
    SELECT layout_category as category, COUNT(*) as count 
    FROM prompts 
    WHERE layout_category IS NOT NULL 
    GROUP BY layout_category 
    ORDER BY count DESC
  `).all();

  const domainCategories = db.prepare<CategoryCount[]>(`
    SELECT domain_category as category, COUNT(*) as count 
    FROM prompts 
    WHERE domain_category IS NOT NULL 
    GROUP BY domain_category 
    ORDER BY count DESC
  `).all();

  // Prepare the data structure
  const data = {
    prompts,
    metadata: {
      sources,
      layoutCategories,
      domainCategories,
      total: prompts.length,
      lastUpdated: new Date().toISOString()
    }
  };

  // Write to JSON file
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log(`✅ Successfully exported ${prompts.length} prompts to ${outputPath}`);

} catch (error) {
  console.error('Error exporting prompts:', error);
  process.exit(1);
} finally {
  db.close();
}
