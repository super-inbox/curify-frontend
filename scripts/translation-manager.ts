#!/usr/bin/env tsx

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface TranslationEntry {
  [key: string]: string | TranslationEntry;
}

class TranslationManager {
  private locales: string[] = ['en', 'es', 'fr', 'de'];
  private baseTranslationsPath: string;

  constructor() {
    this.baseTranslationsPath = path.join(__dirname, '../messages');
  }

  async addBlogTranslations(slug: string, content: TranslationEntry): Promise<void> {
    console.log(`🌍 Adding translations for blog: ${slug}`);

    for (const locale of this.locales) {
      const translationPath = path.join(this.baseTranslationsPath, locale, 'blog.json');
      
      try {
        const translations = await this.loadTranslations(translationPath);
        translations[slug] = content;
        
        if (locale !== 'en') {
          // For non-English locales, you would typically translate the content
          // This is where you'd integrate with a translation API
          translations[slug] = await this.translateContent(content, locale);
        }

        await this.saveTranslations(translationPath, translations);
        console.log(`✅ Added translations for ${locale}/${slug}`);
      } catch (error) {
        console.error(`❌ Error adding translations for ${locale}/${slug}:`, error);
      }
    }
  }

  private async loadTranslations(filePath: string): Promise<any> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      // If file doesn't exist, return empty structure
      return { blog: { posts: [] } };
    }
  }

  private async saveTranslations(filePath: string, translations: any): Promise<void> {
    await fs.writeFile(filePath, JSON.stringify(translations, null, 2));
  }

  private async translateContent(content: TranslationEntry, targetLocale: string): Promise<TranslationEntry> {
    // This is a placeholder for actual translation logic
    // In a real implementation, you would use Google Translate API, DeepL, or similar service
    
    console.log(`🔄 Translating content to ${targetLocale} (placeholder implementation)`);
    
    // For now, return the original content
    // In production, you would implement actual translation here
    return content;
  }

  async updateBlogIndex(newBlogPost: any): Promise<void> {
    console.log('📝 Updating blog index...');

    for (const locale of this.locales) {
      const translationPath = path.join(this.baseTranslationsPath, locale, 'blog.json');
      
      try {
        const translations = await this.loadTranslations(translationPath);
        
        // Add to posts array if not already present
        const existingPost = translations.blog.posts.find((post: any) => post.slug === newBlogPost.slug);
        if (!existingPost) {
          translations.blog.posts.push(newBlogPost);
        }

        await this.saveTranslations(translationPath, translations);
        console.log(`✅ Updated blog index for ${locale}`);
      } catch (error) {
        console.error(`❌ Error updating blog index for ${locale}:`, error);
      }
    }
  }

  async validateTranslations(): Promise<void> {
    console.log('🔍 Validating translations...');

    const enTranslations = await this.loadTranslations(
      path.join(this.baseTranslationsPath, 'en', 'blog.json')
    );

    const enSlugs = new Set(Object.keys(enTranslations));
    enSlugs.delete('blog'); // Remove the metadata key

    for (const locale of this.locales) {
      if (locale === 'en') continue;

      const localeTranslations = await this.loadTranslations(
        path.join(this.baseTranslationsPath, locale, 'blog.json')
      );

      const localeSlugs = new Set(Object.keys(localeTranslations));
      localeSlugs.delete('blog');

      const missingKeys = [...enSlugs].filter(key => !localeSlugs.has(key));
      
      if (missingKeys.length > 0) {
        console.log(`⚠️  ${locale} is missing translations for: ${missingKeys.join(', ')}`);
      } else {
        console.log(`✅ ${locale} translations are complete`);
      }
    }
  }
}

export default TranslationManager;
