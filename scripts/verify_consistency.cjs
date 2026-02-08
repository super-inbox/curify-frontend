/**
 * @file verify_consistency.cjs
 * @description
 * This script performs a comprehensive consistency verification of i18n JSON files.
 * It goes beyond basic key checking to ensure structural integrity, type consistency,
 * and semantic validity across all supported languages.
 *
 * Key Operations:
 * 1. Loads 'messages/en.json' as the reference source of truth.
 * 2. Flattens JSON structures to analyze keys, data types, and array lengths.
 * 3. Performs deep comparison to identify:
 *    - Missing Keys: Keys defined in EN but missing in target locales.
 *    - Extra Keys: Keys defined in target locales but absent in EN.
 *    - Type Mismatches: Value type differences (e.g., Array vs Object, String vs Number).
 * 4. Performs Heuristic Content Checks:
 *    - Potential Untranslated: Warns if values are identical to the English source (length > 5).
 *    - Suspicious Content: Specific checks for known copy-paste errors (e.g., German text in Spanish files).
 *
 * Usage:
 * Run via Node.js:
 * $ node verify_consistency.cjs
 *
 * Requirements:
 * - Node.js environment
 * - 'messages' directory structure.
 *
 * Output:
 * Detailed console report classifying issues as Structure Mismatches, Potential Untranslated content,
 * or Suspicious Content, with specific examples.
 */

const fs = require('fs');
const path = require('path');

const messagesDir = path.join(__dirname, '../messages');
const files = fs.readdirSync(messagesDir).filter(f => f.endsWith('.json'));

// Load English as reference
const enPath = path.join(messagesDir, 'en.json');
const enContent = JSON.parse(fs.readFileSync(enPath, 'utf8'));

// Helper to flatten object keys with order
function flattenKeys(obj, prefix = '') {
  let keys = [];
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys.push({ key: fullKey, type: 'object' });
      keys = keys.concat(flattenKeys(obj[key], fullKey));
    } else if (Array.isArray(obj[key])) {
      keys.push({ key: fullKey, type: 'array', length: obj[key].length });
    } else {
      keys.push({ key: fullKey, type: typeof obj[key] });
    }
  }
  return keys;
}

const enKeys = flattenKeys(enContent);
const enKeyMap = new Map(enKeys.map(k => [k.key, k]));

console.log(`Reference (en.json): ${enKeys.length} keys`);

files.forEach(file => {
  if (file === 'en.json') return;

  console.log(`\n--------------------------------------------------`);
  console.log(`Analyzing ${file}...`);
  
  const filePath = path.join(messagesDir, file);
  let content;
  try {
    content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.error(`❌ JSON Parse Error: ${e.message}`);
    return;
  }

  const fileKeys = flattenKeys(content);
  const fileKeyMap = new Map(fileKeys.map(k => [k.key, k]));
  
  // 1. Check for Missing Keys
  const missingKeys = enKeys.filter(k => !fileKeyMap.has(k.key));
  
  // 2. Check for Extra Keys
  const extraKeys = fileKeys.filter(k => !enKeyMap.has(k.key));
  
  // 3. Check for Type Mismatches
  const typeMismatches = enKeys.filter(k => {
    const fileKey = fileKeyMap.get(k.key);
    return fileKey && fileKey.type !== k.type;
  });

  // 4. Check for Order Mismatches (simplified: check if relative order of common keys is preserved)
  // This is tricky because missing/extra keys shift indices. 
  // We'll just report if the structure looks vastly different.
  
  // 5. Semantic/Content Checks
  const potentialUntranslated = [];
  const potentialCopyPaste = [];
  
  function checkValues(enObj, targetObj, prefix = '') {
    for (const key in enObj) {
      if (targetObj && targetObj[key]) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof enObj[key] === 'string') {
          // Check if value is identical to English (warning)
          if (enObj[key] === targetObj[key] && enObj[key].length > 5) { // ignore short words like "OK"
             potentialUntranslated.push(fullKey);
          }
          // Special check for German in Spanish file (known issue)
          if (file === 'es.json') {
             if (targetObj[key].includes('Wird') || targetObj[key].includes('Bestätigung')) {
               potentialCopyPaste.push({ key: fullKey, text: targetObj[key] });
             }
          }
        } else if (typeof enObj[key] === 'object' && enObj[key] !== null) {
           checkValues(enObj[key], targetObj[key], fullKey);
        }
      }
    }
  }
  checkValues(enContent, content);

  // Reporting
  if (missingKeys.length === 0 && extraKeys.length === 0 && typeMismatches.length === 0) {
    console.log(`✅ Structure matches en.json`);
  } else {
    console.log(`❌ Structure Mismatch:`);
    if (missingKeys.length > 0) console.log(`   - Missing Keys: ${missingKeys.length} (e.g., ${missingKeys.slice(0, 3).map(k => k.key).join(', ')})`);
    if (extraKeys.length > 0) console.log(`   - Extra Keys: ${extraKeys.length} (e.g., ${extraKeys.slice(0, 3).map(k => k.key).join(', ')})`);
    if (typeMismatches.length > 0) console.log(`   - Type Mismatches: ${typeMismatches.length} (e.g., ${typeMismatches.slice(0, 3).map(k => k.key).join(', ')})`);
  }

  if (potentialUntranslated.length > 0) {
    console.log(`⚠️  Potential Untranslated (Identical to EN): ${potentialUntranslated.length} items`);
    if (potentialUntranslated.length < 10) {
       console.log(`    Keys: ${potentialUntranslated.join(', ')}`);
    } else {
       console.log(`    Examples: ${potentialUntranslated.slice(0,5).join(', ')} ...`);
    }
  }

  if (potentialCopyPaste.length > 0) {
     console.log(`🚨 Suspicious Content (e.g. German in ES):`);
     potentialCopyPaste.forEach(item => console.log(`    ${item.key}: "${item.text}"`));
  }
});
