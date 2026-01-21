import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

// Path to the JSON file
const jsonPath = path.join(process.cwd(), 'public/data/nanobanana.json');

// Read and parse the JSON file
const readJsonFile = () => {
  try {
    const fileContents = fs.readFileSync(jsonPath, 'utf-8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Error reading JSON file:', error);
    return { prompts: [], metadata: { sources: [], layoutCategories: [], domainCategories: [] } };
  }
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const search = (searchParams.get('search') || '').toLowerCase();
  const category = searchParams.get('category');
  const source = searchParams.get('source');
  const domainCategory = searchParams.get('domain_category');
  const layoutCategory = searchParams.get('layout_category');
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
  
  try {
    const { prompts: allPrompts, metadata } = readJsonFile();
    
    // If requesting metadata only
    if (metadataOnly) {
      return NextResponse.json({
        categories: [...new Set(allPrompts.map((p: any) => p.category).filter(Boolean))].sort(),
        sources: metadata.sources,
        layoutCategories: metadata.layoutCategories,
        domainCategories: metadata.domainCategories
      });
    }
    
    // Apply filters
    let filteredPrompts = [...allPrompts];
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredPrompts = filteredPrompts.filter(prompt => 
        prompt.title?.toLowerCase().includes(searchLower) || 
        prompt.description?.toLowerCase().includes(searchLower) ||
        prompt.promptText?.toLowerCase().includes(searchLower)
      );
    }
    
    if (category && category !== 'all') {
      filteredPrompts = filteredPrompts.filter(prompt => 
        prompt.category === category
      );
    }
    
    if (source && source !== 'all') {
      filteredPrompts = filteredPrompts.filter(prompt => 
        prompt.sourceType === source
      );
    }
    
    if (domainCategory && domainCategory !== 'all') {
      filteredPrompts = filteredPrompts.filter(prompt => 
        prompt.domain_category === domainCategory
      );
    }
    
    if (layoutCategory && layoutCategory !== 'all') {
      filteredPrompts = filteredPrompts.filter(prompt => 
        prompt.layout_category === layoutCategory
      );
    }
    
    // Apply pagination
    const total = filteredPrompts.length;
    const offset = (page - 1) * limit;
    const paginatedPrompts = filteredPrompts.slice(offset, offset + limit);
    
    // Process image URLs
    const processedPrompts = paginatedPrompts.map(prompt => ({
      ...prompt,
      imageUrl: prompt.imageUrl 
        ? (prompt.imageUrl.startsWith('http') || prompt.imageUrl.startsWith('/')
            ? prompt.imageUrl 
            : `/images/${prompt.imageUrl}`)
        : null
    }));
    
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
