#!/usr/bin/env tsx

import BlogWritingPipeline from './blog-writing-pipeline.js';
import TranslationManager from './translation-manager.js';

interface PipelineOptions {
  topics: string[];
  dryRun?: boolean;
  skipTranslation?: boolean;
  validateOnly?: boolean;
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🚀 Blog Writing Pipeline

Usage: tsx run-blog-pipeline.ts [options] <topic1> <topic2> ...

Options:
  --dry-run              Generate content without saving files
  --skip-translation     Skip translation step
  --validate-only        Only validate existing translations
  --help                 Show this help message

Examples:
  tsx run-blog-pipeline.ts "ai video generation" "voice cloning tutorial"
  tsx run-blog-pipeline.ts --dry-run "nano banana prompts"
  tsx run-blog-pipeline.ts --validate-only
`);
    process.exit(0);
  }

  if (args.includes('--help')) {
    process.exit(0);
  }

  const options: PipelineOptions = {
    topics: [],
    dryRun: args.includes('--dry-run'),
    skipTranslation: args.includes('--skip-translation'),
    validateOnly: args.includes('--validate-only')
  };

  // Extract topics (non-option arguments)
  options.topics = args.filter(arg => !arg.startsWith('--'));

  try {
    if (options.validateOnly) {
      console.log('🔍 Validating translations only...');
      const translationManager = new TranslationManager();
      await translationManager.validateTranslations();
      console.log('✅ Validation complete');
      return;
    }

    console.log('🚀 Starting Blog Writing Pipeline...');
    console.log(`📝 Topics: ${options.topics.join(', ')}`);
    console.log(`🔧 Dry run: ${options.dryRun ? 'Yes' : 'No'}`);
    console.log(`🌍 Skip translation: ${options.skipTranslation ? 'Yes' : 'No'}`);

    const pipeline = new BlogWritingPipeline();
    await pipeline.initialize();

    const topics = await pipeline.selectTopics(options.topics);
    
    for (const topic of topics) {
      console.log(`\n📝 Processing topic: ${topic.topic}`);
      
      const content = await pipeline.generateBlogContent(topic);
      
      if (!options.dryRun) {
        await pipeline.updateTranslations(content);
        await pipeline.createBlogComponent(content);
        
        if (!options.skipTranslation) {
          const translationManager = new TranslationManager();
          await translationManager.addBlogTranslations(content.slug, content.content);
          await translationManager.updateBlogIndex({
            slug: content.slug,
            title: content.title,
            date: content.date,
            readTime: content.readTime,
            tag: content.tag,
            image: content.image,
            category: content.category,
            relatedLinks: content.relatedLinks
          });
        }
        
        console.log(`✅ Completed: ${content.slug}`);
      } else {
        console.log(`🔍 Dry run - would create: ${content.slug}`);
        console.log(`   Title: ${content.title}`);
        console.log(`   Category: ${content.category}`);
      }
    }

    console.log('\n🎉 Pipeline completed successfully!');
    
    if (!options.dryRun) {
      console.log('\n📋 Next steps:');
      console.log('1. Review generated content');
      console.log('2. Create appropriate images for the blog posts');
      console.log('3. Test the blog components');
      console.log('4. Update any internal links if needed');
    }

  } catch (error) {
    console.error('❌ Pipeline failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);
