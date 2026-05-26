#!/usr/bin/env tsx

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface BlogPost {
  slug: string;
  title: string;
  date: string;
  readTime: string;
  tag: string;
  image: string;
  category: string;
  relatedLinks: string[];
}

interface GSCData {
  query: string;
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
}

interface BlogTopic {
  topic: string;
  keywords: string[];
  category: string;
  targetAudience: string;
  searchIntent: 'informational' | 'commercial' | 'navigational' | 'transactional';
}

interface BlogGenerationContext {
  gscData: GSCData[];
  existingBlogs: BlogPost[];
  categories: Record<string, { name: string; description: string }>;
  nanoTemplates: any[];
  selectedTopics: BlogTopic[];
}

class BlogWritingPipeline {
  private context: BlogGenerationContext;
  private promptTemplate: string;

  constructor() {
    this.context = {} as BlogGenerationContext;
    this.promptTemplate = '';
  }

  async initialize(): Promise<void> {
    console.log('🚀 Initializing Blog Writing Pipeline...');
    
    await this.loadContext();
    await this.loadPromptTemplate();
    
    console.log('✅ Pipeline initialized successfully');
  }

  private async loadContext(): Promise<void> {
    try {
      // Load existing blogs
      const blogsData = await fs.readFile(
        path.join(__dirname, '../public/data/blogs.json'),
        'utf-8'
      );
      this.context.existingBlogs = JSON.parse(blogsData);

      // Load categories
      const categoriesData = await fs.readFile(
        path.join(__dirname, '../public/data/blog-categories.json'),
        'utf-8'
      );
      this.context.categories = JSON.parse(categoriesData).categories;

      // Load nano templates for content ideas
      const nanoTemplatesData = await fs.readFile(
        path.join(__dirname, '../public/data/nano_templates.json'),
        'utf-8'
      );
      this.context.nanoTemplates = JSON.parse(nanoTemplatesData);

      // Load GSC data (assuming it exists in a specific format)
      try {
        const gscData = await fs.readFile(
          path.join(__dirname, '../public/data/gsc_data.json'),
          'utf-8'
        );
        this.context.gscData = JSON.parse(gscData);
      } catch (error) {
        console.warn('⚠️  GSC data not found, using mock data');
        this.context.gscData = this.generateMockGSCData();
      }

      console.log('📊 Context loaded successfully');
    } catch (error) {
      console.error('❌ Error loading context:', error);
      throw error;
    }
  }

  private async loadPromptTemplate(): Promise<void> {
    try {
      this.promptTemplate = await fs.readFile(
        path.join(__dirname, '../prompt.md'),
        'utf-8'
      );
      console.log('📝 Prompt template loaded successfully');
    } catch (error) {
      console.error('❌ Error loading prompt template:', error);
      throw error;
    }
  }

  private generateMockGSCData(): GSCData[] {
    return [
      { query: 'ai video generation tutorial', impressions: 1500, clicks: 120, ctr: 8.0, position: 12.5 },
      { query: 'how to dub videos with ai', impressions: 800, clicks: 95, ctr: 11.9, position: 8.2 },
      { query: 'nano banana prompts guide', impressions: 600, clicks: 85, ctr: 14.2, position: 6.8 },
      { query: 'faceless youtube automation', impressions: 1200, clicks: 110, ctr: 9.2, position: 10.1 },
      { query: 'ai content creation tools', impressions: 2000, clicks: 180, ctr: 9.0, position: 15.3 }
    ];
  }

  async selectTopics(topics: string[]): Promise<BlogTopic[]> {
    console.log('🎯 Selecting topics for blog generation...');
    
    const selectedTopics: BlogTopic[] = [];
    
    for (const topicInput of topics) {
      const topic = await this.analyzeTopic(topicInput);
      selectedTopics.push(topic);
    }

    this.context.selectedTopics = selectedTopics;
    console.log(`✅ Selected ${selectedTopics.length} topics for generation`);
    
    return selectedTopics;
  }

  private async analyzeTopic(topicInput: string): Promise<BlogTopic> {
    // Find relevant GSC data
    const relevantGSC = this.context.gscData.filter(
      data => data.query.toLowerCase().includes(topicInput.toLowerCase()) ||
              topicInput.toLowerCase().includes(data.query.toLowerCase())
    );

    // Determine search intent based on query patterns
    const searchIntent = this.determineSearchIntent(topicInput);

    // Find best matching category
    const category = this.findBestCategory(topicInput);

    return {
      topic: topicInput,
      keywords: this.extractKeywords(topicInput, relevantGSC),
      category,
      targetAudience: this.determineTargetAudience(topicInput, category),
      searchIntent
    };
  }

  private determineSearchIntent(query: string): BlogTopic['searchIntent'] {
    const informationalKeywords = ['how to', 'what is', 'guide', 'tutorial', 'best'];
    const commercialKeywords = ['vs', 'review', 'comparison', 'pricing', 'alternative'];
    const transactionalKeywords = ['buy', 'sign up', 'get started', 'download'];

    const lowerQuery = query.toLowerCase();
    
    if (informationalKeywords.some(keyword => lowerQuery.includes(keyword))) {
      return 'informational';
    }
    if (commercialKeywords.some(keyword => lowerQuery.includes(keyword))) {
      return 'commercial';
    }
    if (transactionalKeywords.some(keyword => lowerQuery.includes(keyword))) {
      return 'transactional';
    }
    
    return 'informational'; // Default
  }

  private findBestCategory(topic: string): string {
    const categoryKeywords: Record<string, string[]> = {
      'creator-tools': ['ai', 'generation', 'creation', 'tools', 'automation'],
      'video-translation': ['dubbing', 'translation', 'subtitle', 'voice'],
      'nano-banana-prompts': ['nano', 'banana', 'prompt', 'template'],
      'ds-ai-engineering': ['engineering', 'data science', 'machine learning', 'ai'],
      'culture': ['culture', 'heritage', 'language', 'translation']
    };

    const lowerTopic = topic.toLowerCase();
    let bestCategory = 'creator-tools'; // Default
    let maxMatches = 0;

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      const matches = keywords.filter(keyword => lowerTopic.includes(keyword)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        bestCategory = category;
      }
    }

    return bestCategory;
  }

  private extractKeywords(topic: string, gscData: GSCData[]): string[] {
    const keywords = new Set<string>();
    
    // Add topic words
    topic.split(' ').forEach(word => keywords.add(word.toLowerCase()));
    
    // Add keywords from GSC data
    gscData.forEach(data => {
      data.query.split(' ').forEach(word => keywords.add(word.toLowerCase()));
    });

    return Array.from(keywords).filter(keyword => keyword.length > 2);
  }

  private determineTargetAudience(topic: string, category: string): string {
    const audienceMap: Record<string, string> = {
      'creator-tools': 'Content creators, YouTubers, digital marketers',
      'video-translation': 'Video producers, language learners, global businesses',
      'nano-banana-prompts': 'AI enthusiasts, prompt engineers, creative professionals',
      'ds-ai-engineering': 'Data scientists, AI engineers, developers',
      'culture': 'Cultural enthusiasts, language learners, heritage organizations'
    };

    return audienceMap[category] || 'General audience interested in AI and content creation';
  }

  async generateBlogContent(topic: BlogTopic): Promise<any> {
    console.log(`📝 Generating blog content for: ${topic.topic}`);
    
    const contextPrompt = this.buildContextPrompt(topic);
    
    // This would typically call an AI API like GPT-4, Claude, etc.
    // For now, we'll create a structured template that can be used with any AI service
    const generatedContent = {
      slug: this.generateSlug(topic.topic),
      title: this.generateTitle(topic),
      date: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      readTime: `${Math.floor(Math.random() * 8) + 8} min read`,
      tag: this.context.categories[topic.category]?.name || 'AI Tools',
      image: `/images/${this.generateSlug(topic.topic)}.webp`,
      category: topic.category,
      relatedLinks: this.findRelatedLinks(topic),
      content: {
        intro: `Discover how ${topic.topic} is revolutionizing the way we approach ${this.context.categories[topic.category]?.name.toLowerCase() || 'content creation'}.`,
        whatIsTitle: `What is ${topic.topic}?`,
        whatIsContent: `${topic.topic} represents a breakthrough in ${this.context.categories[topic.category]?.name.toLowerCase() || 'AI technology'}...`,
        whyTitle: `Why ${topic.topic} Matters`,
        whyContent: `Understanding ${topic.topic} is crucial for ${topic.targetAudience} who want to stay ahead in the rapidly evolving landscape of AI-powered content creation.`,
        howTitle: `How ${topic.topic} Works`,
        step1Title: 'Getting Started',
        step1Content: 'Begin by understanding the fundamental concepts and requirements...',
        step2Title: 'Setting Up Your Environment',
        step2Content: 'Configure your tools and workspace for optimal performance...',
        step3Title: 'Implementation Process',
        step3Content: 'Follow these step-by-step instructions to implement the solution...',
        step4Title: 'Best Practices',
        step4Content: 'Apply these proven techniques to achieve the best results...',
        step5Title: 'Advanced Techniques',
        step5Content: 'Take your skills to the next level with these advanced methods...',
        featuresTitle: 'Key Features and Benefits',
        featuresContent: 'Explore the powerful features that make this solution stand out...',
        useCasesTitle: 'Practical Use Cases',
        useCasesContent: 'See how professionals are using this in real-world scenarios...',
        tipsTitle: 'Expert Tips and Best Practices',
        tipsContent: 'Learn from industry experts and avoid common pitfalls...',
        conclusionTitle: 'Conclusion',
        conclusionContent: `${topic.topic} offers tremendous potential for ${topic.targetAudience}. Start implementing these strategies today to transform your workflow.`
      }
    };

    console.log(`✅ Blog content generated for: ${topic.topic}`);
    return generatedContent;
  }

  private buildContextPrompt(topic: BlogTopic): string {
    return `
${this.promptTemplate}

## Specific Topic Analysis
Topic: ${topic.topic}
Category: ${topic.category}
Target Audience: ${topic.targetAudience}
Search Intent: ${topic.searchIntent}
Keywords: ${topic.keywords.join(', ')}

## Relevant GSC Data
${this.context.gscData
  .filter(data => topic.keywords.some(keyword => data.query.toLowerCase().includes(keyword)))
  .map(data => `- Query: "${data.query}" (Impressions: ${data.impressions}, CTR: ${data.ctr}%)`)
  .join('\n')}

## Related Existing Content
${this.context.existingBlogs
  .filter(blog => blog.category === topic.category)
  .slice(0, 3)
  .map(blog => `- ${blog.title} (${blog.slug})`)
  .join('\n')}

## Category Context
${this.context.categories[topic.category]?.name}: ${this.context.categories[topic.category]?.description}
`;
  }

  private generateSlug(topic: string): string {
    return topic
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private generateTitle(topic: BlogTopic): string {
    const titleTemplates = [
      `The Ultimate Guide to ${topic.topic}`,
      `How to Master ${topic.topic} in 2026`,
      `${topic.topic}: Complete Beginner's Guide`,
      `Everything You Need to Know About ${topic.topic}`,
      `${topic.topic} Explained: Tips and Best Practices`
    ];

    return titleTemplates[Math.floor(Math.random() * titleTemplates.length)];
  }

  private findRelatedLinks(topic: BlogTopic): string[] {
    return this.context.existingBlogs
      .filter(blog => blog.category === topic.category)
      .slice(0, 3)
      .map(blog => blog.slug);
  }

  async updateTranslations(generatedContent: any): Promise<void> {
    console.log('🌍 Updating translations...');

    try {
      const blogJsonPath = path.join(__dirname, '../messages/en/blog.json');
      const blogData = JSON.parse(await fs.readFile(blogJsonPath, 'utf-8'));

      // Add new blog post to the posts array
      blogData.blog.posts.push({
        slug: generatedContent.slug,
        title: generatedContent.title,
        date: generatedContent.date,
        readTime: generatedContent.readTime,
        tag: generatedContent.tag,
        image: generatedContent.image,
        category: generatedContent.category,
        relatedLinks: generatedContent.relatedLinks
      });

      // Add content translations
      blogData[generatedContent.slug] = generatedContent.content;

      // Write updated translations
      await fs.writeFile(blogJsonPath, JSON.stringify(blogData, null, 2));
      
      console.log(`✅ Translations updated for ${generatedContent.slug}`);
    } catch (error) {
      console.error('❌ Error updating translations:', error);
      throw error;
    }
  }

  async createBlogComponent(generatedContent: any): Promise<void> {
    console.log('⚛️  Creating blog component...');

    const componentTemplate = `import GenericBlogContent from '../GenericBlogContent';

export default function ${this.toPascalCase(generatedContent.slug)}Content(props: any) {
  return <GenericBlogContent {...props} />;
}`;

    const componentPath = path.join(
      __dirname,
      `../app/[locale]/(public)/blog/[slug]/components/${this.toPascalCase(generatedContent.slug)}Content.tsx`
    );

    await fs.writeFile(componentPath, componentTemplate);
    console.log(`✅ Component created: ${generatedContent.slug}Content.tsx`);
  }

  private toPascalCase(str: string): string {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }

  async run(selectedTopics: string[]): Promise<void> {
    try {
      await this.initialize();
      
      const topics = await this.selectTopics(selectedTopics);
      
      for (const topic of topics) {
        const content = await this.generateBlogContent(topic);
        await this.updateTranslations(content);
        await this.createBlogComponent(content);
      }

      console.log('🎉 Blog writing pipeline completed successfully!');
    } catch (error) {
      console.error('❌ Pipeline failed:', error);
      throw error;
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: tsx blog-writing-pipeline.ts <topic1> <topic2> ...');
    process.exit(1);
  }

  const pipeline = new BlogWritingPipeline();
  await pipeline.run(args);
}

// Export for programmatic use
export default BlogWritingPipeline;

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
