import path from 'path';
import Database, { Database as SQLiteDatabase } from 'better-sqlite3';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { NextResponse } from 'next/server';

// Get the current module's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Type definitions for our prompt data
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
}

// Initialize SQLite database
const dbDir = path.join(process.cwd(), 'nano-banana-pro-prompts');
const dbPath = path.join(
  process.cwd(),
  'app/[locale]/nano-banana-pro-prompts/nano_banana.db'
);

console.log('Database path:', dbPath);
console.log('Database directory exists:', fs.existsSync(dbDir));

// Ensure public directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Database connection handling
let db: SQLiteDatabase | null = null;

function getDatabaseConnection(): SQLiteDatabase {
  if (db) return db;

  try {
    // Create or open database with read-write access
    db = new Database(dbPath);
    
    // Enable WAL mode for better concurrency
    db.pragma('journal_mode = WAL');
    
    // Create tables if they don't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS prompts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        prompt_text TEXT NOT NULL,
        author TEXT,
        author_handle TEXT,
        date TEXT,
        category TEXT,
        image_url TEXT,
        source_url TEXT,
        source_type TEXT,
        likes INTEGER DEFAULT 0,
        retweets INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Check if we need to add sample data
    const row = db.prepare('SELECT COUNT(*) as count FROM prompts').get() as { count: number };
    if (row.count === 0) {
      // Add some sample prompts
      const insert = db.prepare(`
        INSERT INTO prompts (
          title, description, prompt_text, author, author_handle, 
          date, category, image_url, source_url, source_type, likes, retweets
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const samplePrompts = [
        {
          title: 'Creative Writing Prompt',
          description: 'A prompt for creative writing',
          prompt_text: 'Write a short story about a character who discovers a mysterious door in their home.',
          author: 'AI Assistant',
          author_handle: 'ai_assistant',
          date: '2023-01-01',
          category: 'Creative Writing',
          image_url: '/images/writing.jpg',
          source_url: 'https://example.com/prompts/1',
          source_type: 'website',
          likes: 42,
          retweets: 12
        },
        {
          title: 'Coding Challenge',
          description: 'A programming challenge',
          prompt_text: 'Implement a function that reverses a linked list in place.',
          author: 'Code Master',
          author_handle: 'codemaster',
          date: '2023-01-02',
          category: 'Programming',
          image_url: '/images/code.jpg',
          source_url: 'https://example.com/challenges/1',
          source_type: 'blog',
          likes: 87,
          retweets: 34
        }
      ];
      
      const insertMany = db.transaction((prompts: any[]) => {
        for (const prompt of prompts) {
          insert.run(
            prompt.title,
            prompt.description,
            prompt.prompt_text,
            prompt.author,
            prompt.author_handle,
            prompt.date,
            prompt.category,
            prompt.image_url,
            prompt.source_url,
            prompt.source_type,
            prompt.likes,
            prompt.retweets
          );
        }
      });
      
      insertMany(samplePrompts);
    }
    
    return db;
  } catch (error) {
    console.error('Database connection error:', error);
    throw new Error(`Failed to connect to database: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Close database connection when the server shuts down
process.on('SIGTERM', () => {
  if (db) {
    try {
      db.close();
      console.log('Database connection closed');
    } catch (error) {
      console.error('Error closing database:', error);
    }
  }
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category');
  const source = searchParams.get('source');
  const metadataOnly = searchParams.get('metadata') === 'true';
  
  // Validate pagination parameters
  if (isNaN(page) || page < 1) {
    return NextResponse.json(
      { error: 'Invalid page number' },
      { status: 400 }
    );
  }
  
  if (isNaN(limit) || limit < 1 || limit > 100) {
    return NextResponse.json(
      { error: 'Limit must be between 1 and 100' },
      { status: 400 }
    );
  }
  
  const offset = (page - 1) * limit;
  
  try {
    const db = getDatabaseConnection();
    
    // Validate database connection
    try {
      db.prepare('SELECT 1').get();
    } catch (error) {
      throw new Error('Database connection test failed');
    }

    // If requesting metadata only (categories and sources)
    if (metadataOnly) {
      const categoriesStmt = db.prepare('SELECT DISTINCT category FROM prompts WHERE category IS NOT NULL ORDER BY category');
      const sourcesStmt = db.prepare('SELECT DISTINCT source_type FROM prompts WHERE source_type IS NOT NULL ORDER BY source_type');
      
      // Get layout category distribution
      const layoutCategoriesStmt = db.prepare(`
        SELECT layout_category, COUNT(*) as count 
        FROM prompts 
        WHERE layout_category IS NOT NULL 
        GROUP BY layout_category 
        ORDER BY count DESC
      `);
      
      // Get domain category distribution
      const domainCategoriesStmt = db.prepare(`
        SELECT domain_category as layout_category, COUNT(*) as count 
        FROM prompts 
        WHERE domain_category IS NOT NULL 
        GROUP BY domain_category 
        ORDER BY count DESC
      `);
      
      // Add these type definitions at the top of the file
      type CategoryRow = { category: string };
      type SourceRow = { source_type: string };
      type LayoutCategory = {
  layout_category: string;
  count: number;
};

type MetadataResponse = {
  categories: string[];
  sources: string[];
  layoutCategories: LayoutCategory[];
  domainCategories: LayoutCategory[];
};
      // Update the mapping code
      const categories = (categoriesStmt.all() as CategoryRow[]).map(row => row.category);
      const sources = (sourcesStmt.all() as SourceRow[]).map(row => row.source_type);
      const layoutCategories = layoutCategoriesStmt.all();
      const domainCategories = domainCategoriesStmt.all();
      
      return NextResponse.json({ 
        categories, 
        sources, 
        layoutCategories,
        domainCategories
      } as MetadataResponse);
    }

    // Build WHERE conditions
    const conditions: string[] = [];
    const params: any[] = [];
    
    if (search) {
      conditions.push('(title LIKE ? OR description LIKE ?)');
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern);
    }
    
    if (category && category !== 'all') {
      conditions.push('category = ?');
      params.push(category);
    }
    
    if (source && source !== 'all') {
      conditions.push('source_type = ?');
      params.push(source);
    }
    
    const domainCategory = searchParams.get('domain_category');
    if (domainCategory && domainCategory !== 'all') {
      conditions.push('domain_category = ?');
      params.push(domainCategory);
    }
    
    const layoutCategory = searchParams.get('layout_category');
    if (layoutCategory && layoutCategory !== 'all') {
      conditions.push('layout_category = ?');
      params.push(layoutCategory);
    }
    
    const whereClause = conditions.length > 0 
      ? `WHERE ${conditions.join(' AND ')}` 
      : '';

    // Get total count with filters
    const countQuery = `SELECT COUNT(*) as total FROM prompts ${whereClause}`;
    const countStmt = db.prepare(countQuery);
    const { total } = countStmt.get(...params) as { total: number };
    
    // Get paginated results with filters
    const query = `
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
        retweets
      FROM prompts
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

    const stmt = db.prepare(query);
    const prompts = stmt.all(...params, limit, offset) as Prompt[];
    
    // Process prompts to update image URLs
    const processedPrompts = prompts.map(prompt => ({
      ...prompt,
      imageUrl: prompt.imageUrl 
        ? (prompt.imageUrl.startsWith('http') || prompt.imageUrl.startsWith('/')
            ? prompt.imageUrl 
            : `/images/${prompt.imageUrl}`)
        : null
    }));
    
    console.log(`Returning ${processedPrompts.length} prompts (page ${page}, limit ${limit}, search: "${search}", category: ${category}, source: ${source})`);
    
    return NextResponse.json({
      data: processedPrompts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: (page * limit) < total,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error in GET /api/prompts:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch prompts',
        details: error instanceof Error ? error.message : 'Unknown error',
        ...(process.env.NODE_ENV === 'development' && {
          stack: error instanceof Error ? error.stack : undefined
        })
      },
      { status: 500 }
    );
  }
}


