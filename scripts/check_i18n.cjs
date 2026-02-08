/**
 * @file check_i18n.cjs
 * @description
 * This script performs a basic structural check of internationalization (i18n) JSON files
 * against the English source of truth (en.json). It identifies missing keys and extra keys
 * to ensure that all language files share the same key structure as the reference file.
 *
 * Key Operations:
 * 1. Loads 'messages/en.json' as the reference.
 * 2. Iterates through all other .json files in the 'messages' directory.
 * 3. Recursively extracts all keys (dot-notation) from the JSON objects.
 * 4. Compares keys to find:
 *    - Missing keys: Keys present in EN but missing in the target language.
 *    - Extra keys: Keys present in the target language but not in EN.
 *
 * Usage:
 * Run via Node.js:
 * $ node check_i18n.cjs
 *
 * Requirements:
 * - Node.js environment
 * - 'messages' directory containing 'en.json' and other locale files.
 *
 * Output:
 * Console logs detailing the count and examples of missing or extra keys for each file.
 */

const fs = require('fs');
const path = require('path');

const messagesDir = path.join(__dirname, '../messages');
const files = fs.readdirSync(messagesDir).filter(f => f.endsWith('.json'));

const enContent = JSON.parse(fs.readFileSync(path.join(messagesDir, 'en.json'), 'utf8'));

function getKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys = keys.concat(getKeys(obj[key], prefix + key + '.'));
    } else {
      keys.push(prefix + key);
    }
  }
  return keys;
}

const enKeys = new Set(getKeys(enContent));
console.log(`Total keys in en.json: ${enKeys.size}`);

files.forEach(file => {
  if (file === 'en.json') return;
  
  try {
    const content = JSON.parse(fs.readFileSync(path.join(messagesDir, file), 'utf8'));
    const keys = new Set(getKeys(content));
    
    const missing = [...enKeys].filter(k => !keys.has(k));
    const extra = [...keys].filter(k => !enKeys.has(k));
    
    console.log(`\n--- ${file} ---`);
    console.log(`Missing keys: ${missing.length}`);
    if (missing.length > 0) console.log(`Example missing: ${missing.slice(0, 3).join(', ')}`);
    console.log(`Extra keys: ${extra.length}`);
    if (extra.length > 0) console.log(`Example extra: ${extra.slice(0, 3).join(', ')}`);
    
  } catch (e) {
    console.error(`Error parsing ${file}: ${e.message}`);
  }
});
