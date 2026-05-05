#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const generateBlogContent = (slug, title, category, readTime = "10 min read") => {
  const blogJsonPath = path.join(process.cwd(), 'messages/en/blog.json');
  const blogsJsonPath = path.join(process.cwd(), 'public/data/blogs.json');
  const blogConfigPath = path.join(process.cwd(), 'app/[locale]/(public)/blog/[slug]/utils/blog-config.ts');

  // Read existing files
  const blogJson = JSON.parse(fs.readFileSync(blogJsonPath, 'utf8'));
  const blogsJson = JSON.parse(fs.readFileSync(blogsJsonPath, 'utf8'));

  // Generate translation keys template
  const translationKeys = {
    title: title,
    slug: slug,
    metaDescription: `[SEO-friendly description for ${title}]`,
    date: "May 4, 2026",
    readTime: readTime,
    intro: `[Introduction with search data and hook - include search volume and KD if available]`,
    whatIsTitle: `What is [Topic]?`,
    whatIsContent: `[Content explaining the concept with <br/> for breaks and <strong>text</strong> for bold]`,
    whyTitle: `Why [Topic] Matters`,
    whyContent: `[Content explaining importance with proper HTML formatting]`,
    conclusionTitle: `Conclusion Title`,
    conclusionContent: `[Final thoughts and summary]`,
    ctaTitle: `Ready to [Action]?`,
    ctaDescription: `[CTA description]`,
    ctaButton: `[Button Text]`
  };

  // Add to posts array
  const postEntry = {
    slug: slug,
    title: title,
    date: "May 4, 2026",
    readTime: readTime,
    tag: category.charAt(0).toUpperCase() + category.slice(1),
    image: `/images/${slug}.webp`,
    category: category,
    relatedLinks: []
  };

  blogJson.posts.push(postEntry);
  blogJson[slug] = translationKeys;

  // Add to blogs.json
  blogsJson.push({
    slug: slug,
    title: title,
    date: "May 4, 2026",
    readTime: readTime,
    tag: category.charAt(0).toUpperCase() + category.slice(1),
    image: `/images/${slug}.webp`,
    category: category,
    relatedLinks: []
  });

  // Generate blog-config updates
  const namespaceMapping = `  '${slug}': '${slug}',`;
  const availableKeys = `  '${slug}': [${Object.keys(translationKeys).map(key => `'${key}'`).join(', ')}],`;

  // Write updated files
  fs.writeFileSync(blogJsonPath, JSON.stringify(blogJson, null, 2));
  fs.writeFileSync(blogsJsonPath, JSON.stringify(blogsJson, null, 2));

  console.log(`✅ Generated content templates for: ${slug}`);
  console.log(`📝 Updated: messages/en/blog.json`);
  console.log(`📝 Updated: public/data/blogs.json`);
  console.log(`\n🔧 Add these to blog-config.ts:`);
  console.log(`\n// namespaceMap:`);
  console.log(namespaceMapping);
  console.log(`\n// availableKeys:`);
  console.log(availableKeys);
  console.log(`\n📝 Don't forget to:`);
  console.log(`1. Add related blog links`);
  console.log(`2. Fill in actual content for all translation keys`);
  console.log(`3. Create/update the featured image`);
};

// CLI interface
const args = process.argv.slice(2);
if (args.length < 3) {
  console.log('Usage: node generate-blog-content.js <slug> <title> <category> [readTime]');
  console.log('Example: node generate-blog-content.js "ai-content-automation" "AI Content Automation Guide" "ai-tools" "12 min read"');
  process.exit(1);
}

const [slug, title, category, readTime] = args;
generateBlogContent(slug, title, category, readTime || "10 min read");
