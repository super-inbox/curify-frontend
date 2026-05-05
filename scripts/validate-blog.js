#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const validateBlog = (slug) => {
  const errors = [];
  const warnings = [];

  // Check required files
  const blogDir = path.join(process.cwd(), 'app/[locale]/(public)/blog', slug);
  const requiredFiles = ['page.tsx', 'layout.tsx'];
  
  requiredFiles.forEach(file => {
    const filePath = path.join(blogDir, file);
    if (!fs.existsSync(filePath)) {
      errors.push(`Missing required file: ${file}`);
    }
  });

  // Check blog.json entries
  const blogJsonPath = path.join(process.cwd(), 'messages/en/blog.json');
  const blogJson = JSON.parse(fs.readFileSync(blogJsonPath, 'utf8'));

  // Check if slug is in posts array
  const postExists = blogJson.posts.some(post => post.slug === slug);
  if (!postExists) {
    errors.push(`Blog slug "${slug}" not found in posts array`);
  }

  // Check if translation keys exist
  if (!blogJson[slug]) {
    errors.push(`Translation keys for "${slug}" not found in blog.json`);
  } else {
    const requiredKeys = ['title', 'slug', 'metaDescription', 'date', 'readTime', 'intro', 'whatIsTitle', 'whatIsContent', 'whyTitle', 'whyContent', 'conclusionTitle', 'conclusionContent', 'ctaTitle', 'ctaDescription', 'ctaButton'];
    
    requiredKeys.forEach(key => {
      if (!blogJson[slug][key]) {
        errors.push(`Missing translation key: ${key}`);
      }
    });

    // Check HTML formatting
    const contentKeys = ['intro', 'whatIsContent', 'whyContent', 'conclusionContent'];
    contentKeys.forEach(key => {
      const content = blogJson[slug][key];
      if (content && typeof content === 'string') {
        // Check for unclosed strong tags
        const openTags = (content.match(/<strong>/g) || []).length;
        const closeTags = (content.match(/<\/strong>/g) || []).length;
        if (openTags !== closeTags) {
          errors.push(`Unclosed <strong> tags in ${key}`);
        }

        // Check for proper br tags
        if (content.includes('<br>') && !content.includes('<br/>')) {
          warnings.push(`Use <br/> instead of <br> in ${key}`);
        }
      }
    });
  }

  // Check blogs.json entry
  const blogsJsonPath = path.join(process.cwd(), 'public/data/blogs.json');
  const blogsJson = JSON.parse(fs.readFileSync(blogsJsonPath, 'utf8'));
  
  const blogEntry = blogsJson.find(entry => entry.slug === slug);
  if (!blogEntry) {
    errors.push(`Blog entry not found in blogs.json`);
  } else {
    const requiredBlogKeys = ['slug', 'title', 'date', 'readTime', 'tag', 'image', 'category'];
    requiredBlogKeys.forEach(key => {
      if (!blogEntry[key]) {
        errors.push(`Missing blog.json key: ${key}`);
      }
    });
  }

  // Check blog-config.ts
  const blogConfigPath = path.join(process.cwd(), 'app/[locale]/(public)/blog/[slug]/utils/blog-config.ts');
  const blogConfigContent = fs.readFileSync(blogConfigPath, 'utf8');
  
  if (!blogConfigContent.includes(`'${slug}':`)) {
    errors.push(`Namespace mapping not found in blog-config.ts`);
  }

  // Check image exists
  if (blogEntry && blogEntry.image) {
    const imagePath = path.join(process.cwd(), 'public', blogEntry.image);
    if (!fs.existsSync(imagePath)) {
      warnings.push(`Image file not found: ${blogEntry.image}`);
    }
  }

  // Report results
  console.log(`\n🔍 Blog Validation Results for: ${slug}`);
  console.log('='.repeat(50));
  
  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ Blog is properly configured!');
  } else {
    if (errors.length > 0) {
      console.log('\n❌ Errors:');
      errors.forEach(error => console.log(`  • ${error}`));
    }
    
    if (warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      warnings.forEach(warning => console.log(`  • ${warning}`));
    }
  }

  console.log(`\n📊 Summary: ${errors.length} errors, ${warnings.length} warnings`);
  
  return errors.length === 0;
};

// CLI interface
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: node validate-blog.js <slug>');
  console.log('Example: node validate-blog.js "ai-content-automation"');
  process.exit(1);
}

const [slug] = args;
const isValid = validateBlog(slug);
process.exit(isValid ? 0 : 1);
