# Blog Writing Pipeline

Automated blog content generation pipeline that uses GSC data, existing blog content, and AI to generate SEO-optimized blog posts with full translation support.

## 🚀 Features

- **Context-Aware Generation**: Uses Google Search Console data and existing blog content for relevance
- **SEO Optimization**: Generates content with proper keyword density and structure
- **Multi-Language Support**: Automatic translation to English, Spanish, French, and German
- **Component Generation**: Creates React components for each blog post
- **Translation Management**: Updates translation files automatically
- **Topic Analysis**: Analyzes search intent and target audience

## 📁 File Structure

```
├── prompt.md                           # AI prompt template
├── scripts/
│   ├── blog-writing-pipeline.ts        # Main pipeline logic
│   ├── translation-manager.ts          # Translation handling
│   ├── run-blog-pipeline.ts            # CLI interface
│   └── blog-pipeline-config.json       # Configuration file
└── BLOG_PIPELINE_README.md             # This documentation
```

## 🛠️ Installation

1. Ensure you have Node.js and TypeScript installed
2. Install dependencies:
   ```bash
   npm install
   ```

3. Make scripts executable:
   ```bash
   chmod +x scripts/*.ts
   ```

## 📖 Usage

### Basic Usage

Generate blog posts for specific topics:

```bash
tsx scripts/run-blog-pipeline.ts "ai video generation" "voice cloning tutorial"
```

### Options

- `--dry-run`: Generate content without saving files
- `--skip-translation`: Skip the translation step
- `--validate-only`: Only validate existing translations
- `--help`: Show help message

### Examples

```bash
# Generate blog posts with full pipeline
tsx scripts/run-blog-pipeline.ts "nano banana prompts guide" "faceless youtube automation"

# Dry run to preview content
tsx scripts/run-blog-pipeline.ts --dry-run "ai content creation tools"

# Validate existing translations
tsx scripts/run-blog-pipeline.ts --validate-only

# Generate without translations
tsx scripts/run-blog-pipeline.ts --skip-translation "video dubbing techniques"
```

## 📊 Data Sources

The pipeline uses the following data sources:

1. **GSC Data** (`public/data/gsc_data.json`): Search performance data
2. **Existing Blogs** (`public/data/blogs.json`): Current blog posts
3. **Categories** (`public/data/blog-categories.json`): Blog categories
4. **Nano Templates** (`public/data/nano_templates.json`): Content ideas

## 🎯 Topic Analysis

The pipeline automatically analyzes each topic to determine:

- **Search Intent**: Informational, commercial, navigational, or transactional
- **Target Audience**: Based on category and keywords
- **Best Category**: Matches topic to existing blog categories
- **Keywords**: Extracted from GSC data and topic analysis

## 🌍 Translation Support

The pipeline supports automatic translation to:

- English (en) - Primary language
- Spanish (es)
- French (fr)
- German (de)

Translation keys are automatically added to:
- `messages/{locale}/blog.json`

## ⚛️ Component Generation

For each blog post, the pipeline creates:

1. **React Component**: `app/[locale]/(public)/blog/[slug]/components/{Slug}Content.tsx`
2. **Translation Entries**: Content translations for all supported locales
3. **Blog Metadata**: Updated blog index with new post information

## 📝 Content Structure

Generated blog posts include:

- Introduction with hook
- "What is [Topic]" section
- "Why [Topic] Matters" section
- Step-by-step "How it Works" guide
- Key features and benefits
- Practical use cases
- Expert tips and best practices
- Conclusion with call-to-action

## ⚙️ Configuration

Edit `scripts/blog-pipeline-config.json` to customize:

- Content generation parameters
- SEO settings
- Translation options
- Output paths
- AI integration settings

## 🔧 AI Integration

The pipeline is designed to work with AI services like:

- OpenAI GPT-4
- Claude
- Other LLM providers

To enable AI generation, update the `aiIntegration` section in the config file with your API credentials.

## 📋 Generated Output

For each topic, the pipeline generates:

1. **Blog Post Content**: Structured content with all required sections
2. **React Component**: Ready-to-use component that uses `GenericBlogContent`
3. **Translations**: Content for all supported locales
4. **Metadata**: Blog post information for the blog index

## 🚨 Important Notes

- The pipeline creates placeholder content by default
- Enable AI integration for actual content generation
- Review generated content before publishing
- Create appropriate images for blog posts
- Test generated components in your application

## 🔄 Workflow

1. **Initialization**: Load context data and configurations
2. **Topic Selection**: Analyze and categorize selected topics
3. **Content Generation**: Generate blog content using AI or templates
4. **Component Creation**: Create React components for each blog post
5. **Translation**: Add translations for all supported locales
6. **Validation**: Ensure all translations are complete

## 🐛 Troubleshooting

### Common Issues

1. **Missing GSC Data**: Pipeline uses mock data if GSC data is not found
2. **Translation Errors**: Check that translation files exist and are properly formatted
3. **Component Generation**: Ensure the components directory exists and is writable

### Debug Mode

Run with environment variable for debug output:

```bash
DEBUG=true tsx scripts/run-blog-pipeline.ts "your topic"
```

## 📈 Performance

The pipeline is optimized for:

- **Speed**: Parallel processing of multiple topics
- **Memory**: Efficient data loading and caching
- **Scalability**: Can handle large numbers of topics

## 🤝 Contributing

To extend the pipeline:

1. Add new data sources to the context loading
2. Modify the prompt template for different content styles
3. Add new translation locales
4. Customize component templates

## 📞 Support

For issues and questions:

1. Check the troubleshooting section
2. Review the generated logs
3. Validate your data sources
4. Test with dry-run mode first
