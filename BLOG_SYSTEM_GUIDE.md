# Blog System Guide

## Overview
This guide explains the improved blog system for creating and managing blog posts in the Next.js application.

## Quick Start

### Create a New Blog Post
```bash
# Generate files and content templates
npm run blog:new "your-blog-slug" "Your Blog Title" "category"

# Or step by step:
npm run blog:create "your-blog-slug" "Your Blog Title" "category"
npm run blog:content "your-blog-slug" "Your Blog Title" "category"
```

### Validate a Blog Post
```bash
npm run blog:validate "your-blog-slug"
```

## File Structure

```
app/[locale]/(public)/blog/[slug]/
├── page.tsx              # Main blog page component
├── layout.tsx            # Layout wrapper
└── components/
    ├── StandardBlogPost.tsx  # Reusable blog component
    ├── BreadcrumbNavigation.tsx
    ├── StructuredData.tsx
    ├── TableOfContents.tsx
    ├── PromptBox.tsx
    └── RelatedBlogs.tsx
```

## Scripts

### `blog:create`
Generates the React component files (page.tsx and layout.tsx) for a new blog post.

**Usage:**
```bash
npm run blog:create <slug> <title> <category>
```

**Example:**
```bash
npm run blog:create "ai-content-automation" "AI Content Automation Guide" "ai-tools"
```

### `blog:content`
Updates the JSON configuration files with translation keys and metadata.

**Usage:**
```bash
npm run blog:content <slug> <title> <category> [readTime]
```

**Example:**
```bash
npm run blog:content "ai-content-automation" "AI Content Automation Guide" "ai-tools" "12 min read"
```

### `blog:new`
Combines both create and content generation in one command.

### `blog:validate`
Validates that all required files and configurations are properly set up.

**Usage:**
```bash
npm run blog:validate <slug>
```

## Manual Updates Required

After running the generation scripts, you need to manually update:

### 1. blog-config.ts
Add the namespace mapping and available keys:

```typescript
// In namespaceMap:
'your-blog-slug': 'your-blog-slug',

// In availableKeys:
'your-blog-slug': ['title', 'slug', 'metaDescription', 'date', 'readTime', 'intro', 'whatIsTitle', 'whatIsContent', 'whyTitle', 'whyContent', 'conclusionTitle', 'conclusionContent', 'ctaTitle', 'ctaDescription', 'ctaButton']
```

### 2. Content Creation
Fill in the actual content for all translation keys in `messages/en/blog.json`.

### 3. Image Creation
Create and add the featured image to `/public/images/your-blog-slug.webp`.

### 4. Related Links
Add related blog slugs to the `relatedLinks` array in both JSON files.

## Content Guidelines

### HTML Formatting
- Use `<br/>` for line breaks (self-closing)
- Use `<strong>text</strong>` for bold text
- Ensure all HTML tags are properly opened and closed
- No Unicode escapes needed - use actual HTML tags

### Content Structure
Each blog post should include:
- **Intro**: Hook with search data and main value proposition
- **What Is**: Clear explanation of the concept
- **Why It Matters**: Benefits and importance
- **Additional Sections**: Based on topic complexity
- **Conclusion**: Summary and key takeaways
- **CTA**: Call to action for next steps

### SEO Best Practices
- Include search volume and keyword difficulty data in intro
- Use descriptive titles and meta descriptions
- Add proper alt text for images
- Include internal links to related content

## Using StandardBlogPost Component

For simple blog posts, you can use the `StandardBlogPost` component instead of writing custom page logic:

```tsx
import StandardBlogPost from "../components/StandardBlogPost";

export default function BlogPostPage() {
  return (
    <StandardBlogPost 
      additionalSections={[
        { id: "advanced", titleKey: "advancedTitle", contentKey: "advancedContent" },
        { id: "tools", titleKey: "toolsTitle", contentKey: "toolsContent" }
      ]}
    />
  );
}
```

## Troubleshooting

### Common Issues

1. **INVALID_MESSAGE: UNCLOSED_TAG error**
   - Check that all `<strong>` tags have matching `</strong>` closing tags
   - Use `<br/>` instead of `<br>` for line breaks

2. **Blog not appearing on listing page**
   - Ensure slug is added to `posts` array in `messages/en/blog.json`
   - Check that namespace mapping exists in `blog-config.ts`

3. **Translation keys not found**
   - Verify all required keys exist in the blog's translation object
   - Check `availableKeys` array in `blog-config.ts`

### Validation Script
Run the validation script to check for common issues:
```bash
npm run blog:validate "your-blog-slug"
```

This will check:
- Required file existence
- Translation key completeness
- HTML formatting issues
- Configuration consistency
- Image file presence

## Migration from Old System

If you have existing blog posts, they should continue to work. The new system is backward compatible but provides better tooling for new posts.

To migrate an existing post to use the new tools:
1. Run `npm run blog:validate "existing-slug"` to check current state
2. Add any missing configuration as suggested by validation
3. Consider refactoring to use `StandardBlogPost` component if appropriate
