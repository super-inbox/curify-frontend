#!/usr/bin/env node

const fs = require("fs");

const inputFile = process.argv[2] || "redirects.generated.json";
const outputFile = process.argv[3] || "redirects.cleaned.json";

const redirects = JSON.parse(fs.readFileSync(inputFile, "utf8"));

function normalizePath(path) {
  if (!path) return path;

  let p = path;

  // 1. remove /en prefix (canonical)
  p = p.replace(/^\/en(\/|$)/, "/");

  // 2. remove duplicate slashes
  p = p.replace(/\/+/g, "/");

  // 3. remove template- prefix in nano-template path
  p = p.replace(
    /\/nano-template\/template-/g,
    "/nano-template/"
  );

  return p;
}

const cleaned = redirects.map((r) => {
  return {
    ...r,
    source: normalizePath(r.source),
    destination: normalizePath(r.destination),
  };
});

// dedupe
const seen = new Set();
const deduped = [];

for (const r of cleaned) {
  const key = `${r.source}→${r.destination}`;
  if (!seen.has(key)) {
    seen.add(key);
    deduped.push(r);
  }
}

fs.writeFileSync(outputFile, JSON.stringify(deduped, null, 2));

console.log("Done.");
console.log("Original:", redirects.length);
console.log("Cleaned:", deduped.length);
console.log("Output:", outputFile);