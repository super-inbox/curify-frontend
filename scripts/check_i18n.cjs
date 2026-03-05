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
const enDir = path.join(messagesDir, 'en');

if (!fs.existsSync(enDir)) {
  console.error('Error: en directory not found.');
  process.exit(1);
}

const namespaces = fs.readdirSync(enDir).filter(f => f.endsWith('.json'));
const locales = fs.readdirSync(messagesDir).filter(f => fs.statSync(path.join(messagesDir, f)).isDirectory() && f !== 'en');

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

namespaces.forEach(ns => {
  console.log(`\n================================`);
  console.log(`Checking namespace: ${ns}`);
  console.log(`================================`);

  const enPath = path.join(enDir, ns);
  const enContent = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  const enKeysArr = getKeys(enContent);
  const enKeys = new Set(enKeysArr);
  console.log(`Total keys in en/${ns}: ${enKeys.size}`);

  locales.forEach(locale => {
    const localePath = path.join(messagesDir, locale, ns);
    if (!fs.existsSync(localePath)) {
      console.log(`\n--- ${locale}/${ns} ---`);
      console.log(`Missing entire namespace file.`);
      return;
    }

    try {
      const content = JSON.parse(fs.readFileSync(localePath, 'utf8'));
      const keys = new Set(getKeys(content));

      const missing = [...enKeys].filter(k => !keys.has(k));
      const extra = [...keys].filter(k => !enKeys.has(k));

      console.log(`\n--- ${locale}/${ns} ---`);
      console.log(`Missing keys: ${missing.length}`);
      if (missing.length > 0) console.log(`Example missing: ${missing.slice(0, 3).join(', ')}`);
      console.log(`Extra keys: ${extra.length}`);
      if (extra.length > 0) console.log(`Example extra: ${extra.slice(0, 3).join(', ')}`);

    } catch (e) {
      console.error(`Error parsing ${locale}/${ns}: ${e.message}`);
    }
  });
});
