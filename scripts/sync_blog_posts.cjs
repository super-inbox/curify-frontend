/**
 * @file sync_blog_posts.cjs
 * @description
 * Sync blog posts across all language files by adding missing blog posts to the posts array.
 * 
 * This script:
 * 1. Reads the English blog posts array as the source of truth
 * 2. For each target language, checks if blog posts exist in their posts array
 * 3. Adds missing blog posts with translated titles (if available) or English titles (if not)
 * 
 * Usage:
 *   node scripts/sync_blog_posts.cjs
 */

const fs = require("fs");
const path = require("path");

const messagesDir = path.join(process.cwd(), "messages");

// Get all locale directories
function getLocales() {
  return fs.readdirSync(messagesDir)
    .filter(name => {
      const fullPath = path.join(messagesDir, name);
      return fs.statSync(fullPath).isDirectory();
    })
    .sort();
}

// Read blog posts from English file
function getEnglishBlogPosts() {
  const enBlogPath = path.join(messagesDir, "en", "blog.json");
  const enBlog = JSON.parse(fs.readFileSync(enBlogPath, "utf8"));
  return enBlog.blog.posts;
}

// Read blog posts from a specific language file
function getLanguageBlogPosts(locale) {
  const blogPath = path.join(messagesDir, locale, "blog.json");
  if (!fs.existsSync(blogPath)) {
    return [];
  }
  
  try {
    const blog = JSON.parse(fs.readFileSync(blogPath, "utf8"));
    return blog.blog.posts || [];
  } catch (error) {
    console.error(`Error reading ${locale}/blog.json:`, error.message);
    return [];
  }
}

// Write updated blog posts back to language file
function writeLanguageBlogPosts(locale, posts) {
  const blogPath = path.join(messagesDir, locale, "blog.json");
  const blog = JSON.parse(fs.readFileSync(blogPath, "utf8"));
  
  blog.blog.posts = posts;
  
  fs.writeFileSync(blogPath, JSON.stringify(blog, null, 2) + "\n", "utf8");
  console.log(`✅ Updated ${locale}/blog.json with ${posts.length} posts`);
}

// Find missing blog posts
function findMissingPosts(englishPosts, languagePosts) {
  const existingSlugs = new Set(languagePosts.map(post => post.slug));
  return englishPosts.filter(post => !existingSlugs.has(post.slug));
}

// Get translated title for a blog post if available
function getTranslatedTitle(locale, slug, namespace) {
  try {
    const blogPath = path.join(messagesDir, locale, "blog.json");
    const blog = JSON.parse(fs.readFileSync(blogPath, "utf8"));
    
    // Try to get the translated title from the namespace
    if (blog.blog[namespace] && blog.blog[namespace].title) {
      return blog.blog[namespace].title;
    }
  } catch (error) {
    // If there's an error, fall back to English
  }
  return null;
}

// Main function
function main() {
  console.log("🔄 Syncing blog posts across all languages...\n");
  
  const locales = getLocales();
  const englishPosts = getEnglishBlogPosts();
  
  console.log(`Found ${englishPosts.length} blog posts in English`);
  console.log(`Languages to sync: ${locales.filter(l => l !== 'en').join(', ')}\n`);
  
  for (const locale of locales) {
    if (locale === 'en') {
      console.log("⏭️  Skipping English (source of truth)");
      continue;
    }
    
    const languagePosts = getLanguageBlogPosts(locale);
    const missingPosts = findMissingPosts(englishPosts, languagePosts);
    
    if (missingPosts.length === 0) {
      console.log(`✅ ${locale}: All blog posts already present`);
      continue;
    }
    
    console.log(`📝 ${locale}: Adding ${missingPosts.length} missing blog posts`);
    
    // Create the updated posts array
    const updatedPosts = [...languagePosts];
    
    // Add missing posts with translated titles when possible
    for (const missingPost of missingPosts) {
      // Map slug to namespace (remove hyphens and convert to camelCase)
      const namespace = missingPost.slug.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
      
      const translatedTitle = getTranslatedTitle(locale, missingPost.slug, namespace);
      
      const postToAdd = {
        slug: missingPost.slug,
        title: translatedTitle || missingPost.title,
        date: missingPost.date,
        readTime: missingPost.readTime,
        tag: missingPost.tag,
        image: missingPost.image
      };
      
      updatedPosts.push(postToAdd);
      
      if (translatedTitle) {
        console.log(`   + ${missingPost.slug} (translated title)`);
      } else {
        console.log(`   + ${missingPost.slug} (English title - no translation found)`);
      }
    }
    
    // Sort posts by date (newest first) then by slug
    updatedPosts.sort((a, b) => {
      const dateCompare = new Date(b.date) - new Date(a.date);
      if (dateCompare !== 0) return dateCompare;
      return a.slug.localeCompare(b.slug);
    });
    
    writeLanguageBlogPosts(locale, updatedPosts);
  }
  
  console.log("\n🎉 Blog post sync completed!");
  console.log("\n💡 Tip: Run 'node scripts/i18n_autotranslate.cjs --base en --write' to translate any missing content.");
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { main };
