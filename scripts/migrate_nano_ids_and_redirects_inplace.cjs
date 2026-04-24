#!/usr/bin/env node
/**
 * In-place migration for nano template/example ids plus 301 redirect generation.
 *
 * What it does
 * 1) public/data/nano_templates.json
 *    - template-herbal-zh -> template-herbal
 *    - adds legacy_id for redirect lookup
 * 2) public/data/nano_inspiration.json
 *    - updates template_id based on template migration map
 *    - updates example id prefix when it starts with the old template_id
 *    - adds legacy_id + legacy_template_id
 * 3) messages/[locale]/nano.json
 *    - recursively rewrites object keys and exact string values that match migrated ids
 * 4) public/data/curify_Page_Performance.tsv
 *    - parses URLs in GSC export
 *    - generates template redirects for all changed templates across discovered locales
 *    - generates example redirects only for example URLs that appear in the TSV
 *
 * IMPORTANT
 * - This script modifies your JSON files in place by default.
 * - It also creates .bak backup files by default.
 * - Image asset paths are intentionally left unchanged.
 *
 * Usage:
 *   node scripts/migrate_nano_ids_and_redirects_inplace.cjs \
 *     --templates public/data/nano_templates.json \
 *     --inspiration public/data/nano_inspiration.json \
 *     --messages messages \
 *     --tsv public/data/curify_Page_Performance.tsv \
 *     --redirects-json redirects.generated.json \
 *     --redirects-cjs redirects.generated.cjs
 *
 * Optional flags:
 *   --no-backup           Do not create .bak files before overwriting.
 *   --dry-run             Do not write any files; print summary only.
 */

const fs = require('fs');
const path = require('path');

const REMOVE_LOCALE_SUFFIXES = ['zh'];
const DEFAULT_LOCALES = ['', 'en', 'zh', 'es', 'de', 'fr', 'ja', 'ko', 'ru', 'tr', 'hi', 'pt', 'it'];

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      args[key] = true;
    } else {
      args[key] = next;
      i += 1;
    }
  }
  return args;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n', 'utf8');
}

function writeText(file, value) {
  fs.writeFileSync(file, value, 'utf8');
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function backupFile(file) {
  const bak = `${file}.bak`;
  if (!fs.existsSync(bak)) {
    fs.copyFileSync(file, bak);
  }
  return bak;
}

function maybeBackup(file, useBackup, dryRun) {
  if (!useBackup || dryRun || !fs.existsSync(file)) return null;
  return backupFile(file);
}

function listMessageNanoFiles(messagesDir) {
  if (!fs.existsSync(messagesDir)) return [];
  const entries = fs.readdirSync(messagesDir, { withFileTypes: true });
  return entries
    .filter((e) => e.isDirectory())
    .map((e) => path.join(messagesDir, e.name, 'nano.json'))
    .filter((p) => fs.existsSync(p));
}

function discoverLocales(messagesDir) {
  if (!fs.existsSync(messagesDir)) return DEFAULT_LOCALES;
  const locales = fs.readdirSync(messagesDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
  return Array.from(new Set(['', ...locales]));
}

function normalizeTemplateId(templateId) {
  if (typeof templateId !== 'string') return templateId;
  for (const suffix of REMOVE_LOCALE_SUFFIXES) {
    const ending = `-${suffix}`;
    if (templateId.startsWith('template-') && templateId.endsWith(ending)) {
      return templateId.slice(0, -ending.length);
    }
  }
  return templateId;
}

function toSlugFromTemplateId(templateId) {
  return templateId.replace(/^template-/, '');
}

function replaceExactString(value, mapping) {
  if (typeof value !== 'string') return value;
  return Object.prototype.hasOwnProperty.call(mapping, value) ? mapping[value] : value;
}

function deepRewrite(node, exactStringMapping, keyMapping) {
  if (Array.isArray(node)) {
    return node.map((item) => deepRewrite(item, exactStringMapping, keyMapping));
  }
  if (!node || typeof node !== 'object') {
    return replaceExactString(node, exactStringMapping);
  }

  const out = {};
  for (const [rawKey, rawValue] of Object.entries(node)) {
    const nextKey = Object.prototype.hasOwnProperty.call(keyMapping, rawKey) ? keyMapping[rawKey] : rawKey;
    out[nextKey] = deepRewrite(rawValue, exactStringMapping, keyMapping);
  }
  return out;
}

function migrateTemplates(templates) {
  const templateIdMap = {};
  let changedCount = 0;

  const migrated = templates.map((tpl) => {
    const oldId = tpl.id;
    const newId = normalizeTemplateId(oldId);
    const changed = oldId !== newId;
    if (changed) {
      changedCount += 1;
      templateIdMap[oldId] = newId;
    }

    const next = { ...tpl, id: newId };
    if (changed && !next.legacy_id) {
      next.legacy_id = oldId;
    }
    return next;
  });

  return { migrated, templateIdMap, changedCount };
}

function migrateInspiration(items, templateIdMap) {
  const exampleIdMap = {};
  let changedExamples = 0;
  let changedTemplateRefs = 0;

  const migrated = items.map((item) => {
    const oldTemplateId = item.template_id;
    const newTemplateId = templateIdMap[oldTemplateId] || oldTemplateId;
    const oldId = item.id;
    let newId = oldId;

    if (oldTemplateId && oldId && oldId.startsWith(`${oldTemplateId}-`)) {
      newId = `${newTemplateId}${oldId.slice(oldTemplateId.length)}`;
    }

    const changedId = oldId !== newId;
    const changedTemplateId = oldTemplateId !== newTemplateId;
    if (changedId) {
      exampleIdMap[oldId] = newId;
      changedExamples += 1;
    }
    if (changedTemplateId) {
      changedTemplateRefs += 1;
    }

    const next = {
      ...item,
      id: newId,
      template_id: newTemplateId,
    };

    if (changedId && !next.legacy_id) next.legacy_id = oldId;
    if (changedTemplateId && !next.legacy_template_id) next.legacy_template_id = oldTemplateId;

    return next;
  });

  return { migrated, exampleIdMap, changedExamples, changedTemplateRefs };
}

function parseTsvRows(tsvText) {
  const lines = tsvText.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return [];
  const header = lines[0].split('\t');
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split('\t');
    const row = {};
    header.forEach((h, idx) => {
      row[h] = cols[idx] ?? '';
    });
    rows.push(row);
  }
  return rows;
}

function normalizePathname(rawUrl) {
  try {
    return new URL(rawUrl).pathname.replace(/\/$/, '') || '/';
  } catch {
    return null;
  }
}

function parseTemplateOrExamplePath(pathname) {
  const m = pathname.match(/^\/(?:(?<locale>[a-z]{2}(?:-[A-Z]{2})?)\/)?nano-template\/(?<slug>[^/]+)(?:\/example\/(?<exampleId>[^/]+))?$/);
  if (!m || !m.groups) return null;
  return {
    locale: m.groups.locale || '',
    slug: m.groups.slug,
    exampleId: m.groups.exampleId || null,
  };
}

function addRedirect(map, from, to) {
  if (!from || !to || from === to) return;
  map.set(from, to);
}

function buildTemplateRedirects(templateIdMap, locales) {
  const redirects = new Map();
  for (const [oldTemplateId, newTemplateId] of Object.entries(templateIdMap)) {
    const oldSlug = toSlugFromTemplateId(oldTemplateId);
    const newSlug = toSlugFromTemplateId(newTemplateId);
    for (const locale of locales) {
      const prefix = locale ? `/${locale}` : '';
      addRedirect(redirects, `${prefix}/nano-template/${oldSlug}`, `${prefix}/nano-template/${newSlug}`);
    }
  }
  return redirects;
}

function buildExampleRedirectsFromTsv(tsvRows, templateIdMap, exampleIdMap) {
  const redirects = new Map();
  const matchedExampleUrls = [];

  for (const row of tsvRows) {
    const rawUrl = row['Top pages'] || row['Pages'] || row['Page'] || '';
    const pathname = normalizePathname(rawUrl);
    if (!pathname) continue;
    const parsed = parseTemplateOrExamplePath(pathname);
    if (!parsed || !parsed.exampleId) continue;

    const oldTemplateSlug = parsed.slug;
    const oldExampleId = parsed.exampleId;

    const oldTemplateId = `template-${oldTemplateSlug}`;
    const newTemplateId = templateIdMap[oldTemplateId] || oldTemplateId;
    const newTemplateSlug = toSlugFromTemplateId(newTemplateId);
    const newExampleId = exampleIdMap[oldExampleId] || oldExampleId;

    const prefix = parsed.locale ? `/${parsed.locale}` : '';
    const from = `${prefix}/nano-template/${oldTemplateSlug}/example/${oldExampleId}`;
    const to = `${prefix}/nano-template/${newTemplateSlug}/example/${newExampleId}`;

    if (from !== to) {
      addRedirect(redirects, from, to);
      matchedExampleUrls.push({ from, to, sourceUrl: rawUrl });
    }
  }

  return { redirects, matchedExampleUrls };
}

function redirectsMapToArray(redirectMap) {
  return Array.from(redirectMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([source, destination]) => ({ source, destination, permanent: true }));
}

function renderNextRedirectsModule(redirectsArray) {
  return `// Generated by migrate_nano_ids_and_redirects_inplace.cjs\nmodule.exports = ${JSON.stringify(redirectsArray, null, 2)};\n`;
}

function main() {
  const args = parseArgs(process.argv);
  const templatesPath = args.templates || 'public/data/nano_templates.json';
  const inspirationPath = args.inspiration || 'public/data/nano_inspiration.json';
  const messagesDir = args.messages || 'messages';
  const tsvPath = args.tsv || 'public/data/curify_Page_Performance.tsv';
  const redirectsJsonPath = args['redirects-json'] || 'redirects.generated.json';
  const redirectsCjsPath = args['redirects-cjs'] || 'redirects.generated.cjs';
  const auditJsonPath = args['example-redirect-audit'] || 'example_redirects_from_tsv.json';
  const summaryPath = args.summary || 'migration_summary.json';
  const useBackup = !args['no-backup'];
  const dryRun = !!args['dry-run'];

  const templates = readJson(templatesPath);
  const inspiration = readJson(inspirationPath);
  const messageNanoFiles = listMessageNanoFiles(messagesDir);
  const locales = discoverLocales(messagesDir);

  const { migrated: migratedTemplates, templateIdMap, changedCount: changedTemplates } = migrateTemplates(templates);
  const { migrated: migratedInspiration, exampleIdMap, changedExamples, changedTemplateRefs } = migrateInspiration(inspiration, templateIdMap);

  const backups = [];

  if (!dryRun) {
    maybeBackup(templatesPath, useBackup, dryRun) && backups.push(`${templatesPath}.bak`);
    writeJson(templatesPath, migratedTemplates);

    maybeBackup(inspirationPath, useBackup, dryRun) && backups.push(`${inspirationPath}.bak`);
    writeJson(inspirationPath, migratedInspiration);
  }

  const migratedMessages = [];
  for (const file of messageNanoFiles) {
    const original = readJson(file);
    const migrated = deepRewrite(original, templateIdMap, templateIdMap);
    migratedMessages.push({ file, changed: JSON.stringify(original) !== JSON.stringify(migrated) });
    if (!dryRun) {
      maybeBackup(file, useBackup, dryRun) && backups.push(`${file}.bak`);
      writeJson(file, migrated);
    }
  }

  const templateRedirects = buildTemplateRedirects(templateIdMap, locales);

  let tsvRows = [];
  if (fs.existsSync(tsvPath)) {
    tsvRows = parseTsvRows(fs.readFileSync(tsvPath, 'utf8'));
  }
  const { redirects: exampleRedirects, matchedExampleUrls } = buildExampleRedirectsFromTsv(tsvRows, templateIdMap, exampleIdMap);

  const allRedirectsMap = new Map([...templateRedirects, ...exampleRedirects]);
  const redirectsArray = redirectsMapToArray(allRedirectsMap);

  if (!dryRun) {
    ensureDir(path.dirname(redirectsJsonPath));
    ensureDir(path.dirname(redirectsCjsPath));
    ensureDir(path.dirname(auditJsonPath));
    ensureDir(path.dirname(summaryPath));
    writeJson(redirectsJsonPath, redirectsArray);
    writeText(redirectsCjsPath, renderNextRedirectsModule(redirectsArray));
    writeJson(auditJsonPath, matchedExampleUrls);
  }

  const summary = {
    mode: dryRun ? 'dry-run' : 'in-place',
    backups_enabled: useBackup,
    input: {
      templatesPath,
      inspirationPath,
      messagesDir,
      tsvPath: fs.existsSync(tsvPath) ? tsvPath : null,
    },
    output: {
      redirectsJsonPath,
      redirectsCjsPath,
      auditJsonPath,
      summaryPath,
      backups,
    },
    stats: {
      changedTemplates,
      changedExampleIds: changedExamples,
      changedExampleTemplateRefs: changedTemplateRefs,
      messageFilesProcessed: migratedMessages.length,
      messageFilesChanged: migratedMessages.filter((x) => x.changed).length,
      templateRedirects: templateRedirects.size,
      exampleRedirectsFromTsv: exampleRedirects.size,
      totalRedirects: redirectsArray.length,
      locales,
    },
    notes: [
      'JSON files are overwritten in place by default.',
      'Backups are created once as .bak files unless --no-backup is passed.',
      'Template redirects are generated for all discovered locales plus root.',
      'Example redirects are generated only for example URLs found in the TSV.',
      'Image asset paths are intentionally unchanged.',
    ],
  };

  if (!dryRun) {
    writeJson(summaryPath, summary);
  }

  console.log(JSON.stringify(summary, null, 2));
}

main();
