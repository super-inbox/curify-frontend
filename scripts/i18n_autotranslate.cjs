/**
 * @file i18n_autotranslate.cjs
 * @description
 * This script automatically generates translations for all supported locales
 * based on English keys in the messages/ directory. It uses OpenAI's API to
 * translate content while preserving JSON structure and keys.
 *
 * Features:
 * - Translates from English to all supported locales
 * - Preserves JSON structure and nested keys
 * - Handles blog content specifically
 * - Skips already translated keys (optional)
 * - Provides progress logging
 *
 * Usage:
 * $ node scripts/i18n_autotranslate.cjs
 *
 * Requirements:
 * - OPENAI_API_KEY in .env.local
 * - messages/en.json as source of truth
 * - Target locale files in messages/ directory
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

// Configuration
const messagesDir = path.join(__dirname, '../messages');
const sourceLocale = 'en';
const targetLocales = ['de', 'es', 'fr', 'hi', 'ja', 'ko', 'ru', 'tr', 'zh'];
const maxRetries = 3;
const batchSize = 5; // Process keys in batches to avoid rate limits

// Check for OpenAI API key
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY not found in .env.local');
  console.error('Please add: OPENAI_API_KEY=your_api_key_here');
  process.exit(1);
}

// Load source content
const sourceFile = path.join(messagesDir, `${sourceLocale}.json`);
const sourceContent = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));

// Target locales
const targetFiles = targetLocales.reduce((acc, locale) => {
  const filePath = path.join(messagesDir, `${locale}.json`);
  if (fs.existsSync(filePath)) {
    acc[locale] = {
      path: filePath,
      content: JSON.parse(fs.readFileSync(filePath, 'utf8'))
    };
  } else {
    console.warn(`⚠️  Target file not found: ${filePath}`);
  }
  return acc;
}, {});

/**
 * Recursively get all translation keys from an object
 */
function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys = keys.concat(getAllKeys(obj[key], prefix + key + '.'));
    } else {
      keys.push(prefix + key);
    }
  }
  return keys;
}

/**
 * Get value from object by dot notation key
 */
function getValueByPath(obj, path) {
  return path.split('.').reduce((current, key) => current && current[key], obj);
}

/**
 * Set value in object by dot notation key
 */
function setValueByPath(obj, path, value) {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((current, key) => {
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    return current[key];
  }, obj);
  target[lastKey] = value;
}

/**
 * Translate text using OpenAI API
 */
async function translateText(text, targetLocale, context = '') {
  const languageMap = {
    'de': 'German',
    'es': 'Spanish',
    'fr': 'French',
    'hi': 'Hindi',
    'ja': 'Japanese',
    'ko': 'Korean',
    'ru': 'Russian',
    'tr': 'Turkish',
    'zh': 'Chinese (Simplified)'
  };

  const targetLanguage = languageMap[targetLocale];
  if (!targetLanguage) {
    throw new Error(`Unsupported target locale: ${targetLocale}`);
  }

  const prompt = `Translate the following text to ${targetLanguage}. 
${context ? `Context: ${context}\n\n` : ''}
Important guidelines:
- Maintain the same tone and style as the original
- Keep any HTML tags or formatting unchanged
- For technical terms, use the standard translation if available
- For brand names like "Curify", keep them as-is
- Preserve any markdown formatting
- Translate naturally, not literally

Text to translate:
"${text}"

Return only the translated text:`;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a professional translator specializing in tech and content creation. Provide accurate, natural-sounding translations.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const translatedText = data.choices[0].message.content.trim();
      
      if (!translatedText) {
        throw new Error('Empty translation received');
      }

      return translatedText;
    } catch (error) {
      console.warn(`⚠️  Translation attempt ${attempt} failed for ${targetLocale}: ${error.message}`);
      if (attempt === maxRetries) {
        throw error;
      }
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
    }
  }
}

/**
 * Process translation in batches
 */
async function processBatch(keys, targetLocale, targetContent) {
  const results = [];
  
  for (let i = 0; i < keys.length; i += batchSize) {
    const batch = keys.slice(i, i + batchSize);
    const batchPromises = batch.map(async (key) => {
      const sourceValue = getValueByPath(sourceContent, key);
      const existingValue = getValueByPath(targetContent, key);
      
      // Skip if already translated and not empty
      if (existingValue && existingValue.trim() !== '') {
        console.log(`✅ Skipping ${targetLocale}:${key} (already translated)`);
        return { key, translated: existingValue, skipped: true };
      }

      // Generate context for better translation
      const keyParts = key.split('.');
      const context = keyParts.includes('blog') 
        ? `Blog content about ${keyParts[keyParts.length - 1]}`
        : `UI content for ${keyParts.join(' > ')}`;

      try {
        const translated = await translateText(sourceValue, targetLocale, context);
        setValueByPath(targetContent, key, translated);
        console.log(`✅ Translated ${targetLocale}:${key}`);
        return { key, translated, skipped: false };
      } catch (error) {
        console.error(`❌ Failed to translate ${targetLocale}:${key} - ${error.message}`);
        return { key, translated: sourceValue, skipped: false, error: true };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Rate limiting delay between batches
    if (i + batchSize < keys.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}

/**
 * Main translation function
 */
async function generateTranslations() {
  console.log('🚀 Starting automatic translation generation...');
  console.log(`📂 Source: ${sourceLocale}.json`);
  console.log(`🌍 Target locales: ${targetLocales.join(', ')}`);
  
  // Get all keys from source
  const allKeys = getAllKeys(sourceContent);
  const blogKeys = allKeys.filter(key => key.startsWith('blog.'));
  const otherKeys = allKeys.filter(key => !key.startsWith('blog.'));
  
  console.log(`📊 Found ${allKeys.length} total keys (${blogKeys.length} blog, ${otherKeys.length} other)`);
  
  // Process each target locale
  for (const locale of targetLocales) {
    if (!targetFiles[locale]) {
      console.log(`⏭️  Skipping ${locale} (file not found)`);
      continue;
    }
    
    console.log(`\n🌐 Processing ${locale}...`);
    
    try {
      // Process blog keys first (higher priority)
      console.log(`📝 Processing ${blogKeys.length} blog keys...`);
      await processBatch(blogKeys, locale, targetFiles[locale].content);
      
      // Then process other keys
      console.log(`⚙️  Processing ${otherKeys.length} other keys...`);
      await processBatch(otherKeys, locale, targetFiles[locale].content);
      
      // Save the updated file
      const outputPath = targetFiles[locale].path;
      fs.writeFileSync(outputPath, JSON.stringify(targetFiles[locale].content, null, 2), 'utf8');
      console.log(`💾 Saved ${outputPath}`);
      
    } catch (error) {
      console.error(`❌ Failed to process ${locale}: ${error.message}`);
    }
  }
  
  console.log('\n✨ Translation generation completed!');
  console.log('📝 Note: Please review the generated translations for quality and accuracy');
  console.log('🔧 You can run "node scripts/check_i18n.cjs" to verify translation completeness');
}

// Run the translation
generateTranslations().catch(error => {
  console.error('💥 Translation failed:', error);
  process.exit(1);
});
