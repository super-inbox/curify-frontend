import { CDN_BASE } from "@/lib/constants";

// Server-safe pure CDN URL rewriter. Mirrors the toCdnUrl in
// CdnImage.tsx but lives here so the markdown→HTML formatter can use it
// from server components (CdnImage.tsx is "use client").
//
// public/images/ is gitignored — the deployed bundle doesn't carry the
// nano_insp jpgs. Inline <img src="/images/..."> emitted by the markdown
// regex below would 404 against the page origin unless rewritten to the
// CDN. Applied to formatContent + formatNanoBananaContent image rules.
function toCdnUrl(src: string): string {
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  const clean = src.startsWith("/") ? src : `/${src}`;
  if (!CDN_BASE) return clean;
  if (clean.startsWith("/images/") || clean.startsWith("/video/") || clean.startsWith("/audio/")) {
    return `${CDN_BASE}${clean}`;
  }
  return clean;
}

// Unified markdown table parser
export function parseMarkdownTable(content: string): string {
  const lines = content.split('\n');
  let result = '';
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i].trim();
    
    // Check if this is a table header
    if (line.startsWith('|') && line.includes('|')) {
      // Check if separator is on the same line (after a \n)
      if (line.includes('\\n|') && line.includes('-')) {
        // Split the line to separate header and separator
        const parts = line.split('\\n');
        if (parts.length >= 2) {
          const headerLine = parts[0].trim();
          const separatorLine = parts[1].trim();
          
          // Parse header
          const headerCells = headerLine.split('|').map(cell => cell.trim()).filter(cell => cell);
          const columnCount = headerCells.length;
          
          // Start table
          result += '<table class="min-w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden mb-6"><thead class="bg-gray-50"><tr>';
          
          headerCells.forEach(header => {
            result += `<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">${header}</th>`;
          });
          
          result += '</tr></thead><tbody>';
          
          // Process remaining parts as table rows
          let remainingContent = parts.slice(2).join('\\n');
          const remainingLines = remainingContent.split('\\n');
          
          // Parse table rows
          for (const rowLine of remainingLines) {
            const trimmedRow = rowLine.trim();
            
            // Stop if we hit an empty line or non-table line
            if (!trimmedRow || !trimmedRow.startsWith('|')) {
              break;
            }
            
            const rowCells = trimmedRow.split('|').map(cell => cell.trim()).filter(cell => cell);
            
            // Skip if row doesn't match column count
            if (rowCells.length === columnCount) {
              result += '<tr class="hover:bg-gray-50">';
              rowCells.forEach((cell, index) => {
                const isHeader = index === 0; // First column is often a header
                const cellClass = isHeader 
                  ? 'px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b'
                  : 'px-6 py-4 text-sm text-gray-500 border-b';
                result += `<td class="${cellClass}">${cell}</td>`;
              });
              result += '</tr>';
            }
          }
          
          // Close table
          result += '</tbody></table>';
          i++;
          continue;
        }
      }
      
      // Check if next line is a separator (original logic)
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        
        if (nextLine.startsWith('|') && (nextLine.includes('-') || nextLine.includes('---'))) {
          // Parse header
          const headerCells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
          const columnCount = headerCells.length;
          
          // Start table
          result += '<table class="min-w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden mb-6"><thead class="bg-gray-50"><tr>';
          
          headerCells.forEach(header => {
            result += `<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">${header}</th>`;
          });
          
          result += '</tr></thead><tbody>';
          
          // Skip header and separator lines
          i += 2;
          
          // Parse table rows
          while (i < lines.length) {
            const rowLine = lines[i].trim();
            
            // Stop if we hit an empty line or non-table line
            if (!rowLine || !rowLine.startsWith('|')) {
              break;
            }
            
            const rowCells = rowLine.split('|').map(cell => cell.trim()).filter(cell => cell);
            
            // Skip if row doesn't match column count
            if (rowCells.length === columnCount) {
              result += '<tr class="hover:bg-gray-50">';
              rowCells.forEach((cell, index) => {
                const isHeader = index === 0; // First column is often a header
                const cellClass = isHeader 
                  ? 'px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b'
                  : 'px-6 py-4 text-sm text-gray-500 border-b';
                result += `<td class="${cellClass}">${cell}</td>`;
              });
              result += '</tr>';
            }
            
            i++;
          }
          
          // Close table
          result += '</tbody></table>';
          continue;
        }
      }
    }
    
    // Add non-table lines as-is
    result += lines[i] + '\n';
    i++;
  }
  
  return result;
}

// Enhanced content formatter for voice cloning content
export function formatVoiceCloningContent(content: string): string {
  // Ensure content is a string, fallback to empty string if not
  const safeContent = typeof content === 'string' ? content : '';
  
  return `<p>${safeContent
    // Handle image references [Image: url - alt text]
    .replace(/\[Image:\s*([^\]]+)\s*-\s*([^\]]+)\]/g, '<img src="$1" alt="$2" style="width: 100%; max-width: 600px; height: auto; margin: 20px 0; border-radius: 8px;" />')
    // Handle code blocks first (before other markdown processing)
    .replace(/```(\w+)?\n([\s\S]*?)```/g, (match, language, code) => {
      const lang = language || 'text';
      return `</p><pre class="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto text-sm font-mono leading-relaxed my-6 border border-gray-700"><code class="language-${lang}">${code.trim()}</code></pre><p>`;
    })
    // Handle inline code
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono border border-gray-300">$1</code>')
    // Handle markdown tables first - support both with and without spaces
    // 4-column table header
    .replace(/^\| (.+?) \| (.+?) \| (.+?) \| (.+?) \|\n\|---?\|---?\|---?\|---?\|\n/gm, '<table class="min-w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden mb-6"><thead class="bg-gray-50"><tr><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">$1</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">$2</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">$3</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">$4</th></tr></thead><tbody>')
    // 3-column table header
    .replace(/^\| (.+?) \| (.+?) \| (.+?) \|\n\|---?\|---?\|---?\|\n/gm, '<table class="min-w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden mb-6"><thead class="bg-gray-50"><tr><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">$1</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">$2</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">$3</th></tr></thead><tbody>')
    // Handle table rows - support both with and without spaces
    // 4-column table rows
    .replace(/^\| (.+?) \| (.+?) \| (.+?) \| (.+?) \|\s*$/gm, '<tr class="hover:bg-gray-50"><td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b">$1</td><td class="px-6 py-4 text-sm text-gray-500 border-b">$2</td><td class="px-6 py-4 text-sm text-gray-500 border-b">$3</td><td class="px-6 py-4 text-sm text-gray-500 border-b">$4</td></tr>')
    // 3-column table rows
    .replace(/^\| (.+?) \| (.+?) \| (.+?) \|\n/gm, '<tr class="hover:bg-gray-50"><td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b">$1</td><td class="px-6 py-4 text-sm text-gray-500 border-b">$2</td><td class="px-6 py-4 text-sm text-gray-500 border-b">$3</td></tr>')
    // Close table tags
    .replace(/(<tr class="hover:bg-gray-50">[\s\S]*?<\/tr>)(\s*(?!<tr))/g, '$1</tbody></table>$2')
    // Clickable image (image-as-link): [![alt](src)](url) → <a><img></a>
    // Must run BEFORE the plain link regex so the inner ![alt](src) isn't
    // half-eaten. Internal vs external follows the same same-tab/_blank
    // rule as plain links.
    .replace(/\[!\[([^\]]*)\]\(([^)]+)\)\]\(([^)]+)\)/g, (_m: string, alt: string, src: string, href: string) => {
      const isInternal = href.startsWith("/");
      const target = isInternal ? "" : ' target="_blank" rel="noopener noreferrer"';
      return `<a href="${href}"${target} class="block my-6"><img src="${src}" alt="${alt}" style="width: 100%; max-width: 600px; height: auto; border-radius: 8px; cursor: pointer;" class="hover:opacity-90 transition-opacity" /></a>`;
    })
    // Standalone markdown image: ![alt](src) → <img>
    // Run BEFORE the plain link regex (which would otherwise capture
    // ![alt as the label and produce a broken anchor).
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_m: string, alt: string, src: string) => {
      return `<img src="${src}" alt="${alt}" style="width: 100%; max-width: 600px; height: auto; margin: 20px 0; border-radius: 8px;" />`;
    })
    // Handle markdown links [text](url)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m: string, label: string, href: string) => {
      // Internal Curify URLs (start with /) open in the SAME tab so session
      // attribution + click tracking works. External URLs keep _blank.
      // Audit 2026-05-30: 90 WC-blog landers / 0 follow-ups / 0% engagement,
      // tracked back to ALL inline markdown links rendering with _blank.
      const isInternal = href.startsWith("/");
      const target = isInternal ? "" : ' target="_blank" rel="noopener noreferrer"';
      return `<a href="${href}"${target} class="text-blue-600 hover:underline">${label}</a>`;
    })
    // Handle bold text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Handle markdown blockquotes — pull-quote rendering with a colored
    // left border + italic. Applied after links/bold so those still
    // resolve inside the quote, but before the bullet-header rule so a
    // quoted line doesn't get caught as a list item.
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-purple-300 pl-4 italic text-gray-700 my-6 text-lg">$1</blockquote>')
    // Handle bullet points with bold headers: **Header**: Description
    .replace(/^\*\*(.*?)\*\*:\s*(.+)$/gm, '<li><strong>$1:</strong> $2</li>')
    // Handle bullet points at start of line
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // Handle bullet points after colon (like "criteria (adapt as needed):- Quality:")
    .replace(/:- (.+)$/gm, ':<ul class="list-disc pl-6 mb-4"><li>$1</li></ul>')
    // Handle bullet points after colon with space (like "calculator: - GPU")
    .replace(/: - (.+)$/gm, ':<ul class="list-disc pl-6 mb-4"><li>$1</li></ul>')
    // Convert consecutive list items to proper lists
    .replace(/(<li>[\s\S]*?<\/li>)(\s*<li>[\s\S]*?<\/li>)*/g, '<ul class="list-disc pl-6 mb-4 space-y-1">$&</ul>')
    // Handle paragraph breaks (but avoid breaking within lists)
    .replace(/(<\/ul>)\s*\n\s*\n/g, '$1')
    .replace(/\n\n/g, '</p><p class="mb-4">')
    // Handle remaining line breaks
    .replace(/\n/g, '<br/>')}</p>`;
}

// Enhanced content formatter for ASL content
export function formatAslContent(content: string): string {
  return `<p>${content
    // Handle code blocks first
    .replace(/```(\w+)?\n([\s\S]*?)```/g, (match, language, code) => {
      const lang = language || 'text';
      return `</p><pre class="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto text-sm font-mono leading-relaxed my-6 border border-gray-700"><code class="language-${lang}">${code}</code></pre><p>`;
    })
    // Handle markdown tables first
    .replace(/\| (.+?) \| (.+?) \| (.+?) \|\n\| :--- \| :--- \| :--- \|\n/g, '<table class="min-w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden mb-6"><thead class="bg-gray-50"><tr><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">$1</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">$2</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">$3</th></tr></thead><tbody>')
    .replace(/\| (.+?) \| (.+?) \| (.+?) \| (.+?) \|\n\| :--- \| :--- \| :--- \| :--- \|\n/g, '<table class="min-w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden mb-6"><thead class="bg-gray-50"><tr><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">$1</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">$2</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">$3</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">$4</th></tr></thead><tbody>')
    // Handle table rows
    .replace(/\| (.+?) \| (.+?) \| (.+?) \|/g, '<tr class="hover:bg-gray-50"><td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b">$1</td><td class="px-6 py-4 text-sm text-gray-500 border-b">$2</td><td class="px-6 py-4 text-sm text-gray-500 border-b">$3</td></tr>')
    .replace(/\| (.+?) \| (.+?) \| (.+?) \| (.+?) \|/g, '<tr class="hover:bg-gray-50"><td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b">$1</td><td class="px-6 py-4 text-sm text-gray-500 border-b">$2</td><td class="px-6 py-4 text-sm text-gray-500 border-b">$3</td><td class="px-6 py-4 text-sm text-gray-500 border-b">$4</td></tr>')
    // Close table tags
    .replace(/(<tr class="hover:bg-gray-50">[\s\S]*?<\/tr>)(\s*(?!<tr))/g, '$1</tbody></table>$2')
    // Clickable image (image-as-link): [![alt](src)](url) → <a><img></a>
    // Must run BEFORE the plain link regex so the inner ![alt](src) isn't
    // half-eaten. Internal vs external follows the same same-tab/_blank
    // rule as plain links.
    .replace(/\[!\[([^\]]*)\]\(([^)]+)\)\]\(([^)]+)\)/g, (_m: string, alt: string, src: string, href: string) => {
      const isInternal = href.startsWith("/");
      const target = isInternal ? "" : ' target="_blank" rel="noopener noreferrer"';
      return `<a href="${href}"${target} class="block my-6"><img src="${src}" alt="${alt}" style="width: 100%; max-width: 600px; height: auto; border-radius: 8px; cursor: pointer;" class="hover:opacity-90 transition-opacity" /></a>`;
    })
    // Standalone markdown image: ![alt](src) → <img>
    // Run BEFORE the plain link regex (which would otherwise capture
    // ![alt as the label and produce a broken anchor).
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_m: string, alt: string, src: string) => {
      return `<img src="${src}" alt="${alt}" style="width: 100%; max-width: 600px; height: auto; margin: 20px 0; border-radius: 8px;" />`;
    })
    // Handle markdown links [text](url)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m: string, label: string, href: string) => {
      // Internal Curify URLs (start with /) open in the SAME tab so session
      // attribution + click tracking works. External URLs keep _blank.
      // Audit 2026-05-30: 90 WC-blog landers / 0 follow-ups / 0% engagement,
      // tracked back to ALL inline markdown links rendering with _blank.
      const isInternal = href.startsWith("/");
      const target = isInternal ? "" : ' target="_blank" rel="noopener noreferrer"';
      return `<a href="${href}"${target} class="text-blue-600 hover:underline">${label}</a>`;
    })
    // Handle bold text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Handle markdown blockquotes — pull-quote rendering with a colored
    // left border + italic. Applied after links/bold so those still
    // resolve inside the quote, but before the bullet-header rule so a
    // quoted line doesn't get caught as a list item.
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-purple-300 pl-4 italic text-gray-700 my-6 text-lg">$1</blockquote>')
    // Handle bullet points with bold headers: **Header**: Description
    .replace(/^\*\*(.*?)\*\*:\s*(.+)$/gm, '<li><strong>$1:</strong> $2</li>')
    // Handle regular bullet points
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // Convert consecutive list items to proper lists
    .replace(/(<li>[\s\S]*?<\/li>)(\s*<li>[\s\S]*?<\/li>)*/g, '<ul class="list-disc pl-6 mb-4 space-y-1">$&</ul>')
    // Handle paragraph breaks
    .replace(/\n\n/g, '</p><p class="mb-4">')
    // Handle remaining line breaks
    .replace(/\n/g, '<br/>')}</p>`;
}

// Enhanced content formatter for Nano Template content
export function formatNanoTemplateContent(content: string): string {
  // Process list items first to prevent <p> tags from breaking them
  let processedContent = content
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)+/g, '<ul class="list-disc pl-6 mb-4 space-y-1">$&</ul>');

  // Then apply other formatting
  return processedContent
    // Handle image references [Image: url - alt text]
    .replace(/\[Image:\s*([^\]]+)\s*-\s*([^\]]+)\]/g, '<img src="$1" alt="$2" style="width: 100%; max-width: 600px; height: auto; margin: 20px 0; border-radius: 8px;" />')
    // Handle bolded lines as headers (e.g., **Advanced Capabilities**)
    .replace(/^\*\*(.*?)\*\*$/gm, '<h3 class="text-xl font-semibold mt-6 mb-3 text-gray-900">$1</h3>')
    // Handle markdown headers (e.g., ### Subheading)
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-semibold mt-6 mb-3 text-gray-900">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold mt-8 mb-4 text-gray-900">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold mt-8 mb-6 text-gray-900">$1</h1>')
    // Handle markdown tables first - support both with and without spaces
    // 4-column table header
    .replace(/^\| (.+?) \| (.+?) \| (.+?) \| (.+?) \|\n\|-+\s*\|[- ]+\s*\|[- ]+\s*\|[- ]+\s*\|\n/gm, '<table class="min-w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden mb-6"><thead class="bg-gray-50"><tr><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">$1</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">$2</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">$3</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">$4</th></tr></thead><tbody>')
    // 3-column table header
    .replace(/^\| (.+?) \| (.+?) \| (.+?) \|\n\|-+\s*\|[- ]+\s*\|[- ]+\s*\|\n/gm, '<table class="min-w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden mb-6"><thead class="bg-gray-50"><tr><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">$1</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">$2</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">$3</th></tr></thead><tbody>')
    // Handle table rows - support both with and without spaces
    // 4-column table rows
    .replace(/^\| (.+?) \| (.+?) \| (.+?) \| (.+?) \|\n/gm, '<tr class="hover:bg-gray-50"><td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b">$1</td><td class="px-6 py-4 text-sm text-gray-500 border-b">$2</td><td class="px-6 py-4 text-sm text-gray-500 border-b">$3</td><td class="px-6 py-4 text-sm text-gray-500 border-b">$4</td></tr>')
    // 3-column table rows
    .replace(/^\| (.+?) \| (.+?) \| (.+?) \|\n/gm, '<tr class="hover:bg-gray-50"><td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b">$1</td><td class="px-6 py-4 text-sm text-gray-500 border-b">$2</td><td class="px-6 py-4 text-sm text-gray-500 border-b">$3</td></tr>')
    // Close table tags
    .replace(/(<tr class="hover:bg-gray-50">[\s\S]*?<\/tr>)(\s*(?!<tr))/g, '$1</tbody></table>$2')
    // Clickable image (image-as-link): [![alt](src)](url) → <a><img></a>
    // Must run BEFORE the plain link regex so the inner ![alt](src) isn't
    // half-eaten. Internal vs external follows the same same-tab/_blank
    // rule as plain links.
    .replace(/\[!\[([^\]]*)\]\(([^)]+)\)\]\(([^)]+)\)/g, (_m: string, alt: string, src: string, href: string) => {
      const isInternal = href.startsWith("/");
      const target = isInternal ? "" : ' target="_blank" rel="noopener noreferrer"';
      return `<a href="${href}"${target} class="block my-6"><img src="${src}" alt="${alt}" style="width: 100%; max-width: 600px; height: auto; border-radius: 8px; cursor: pointer;" class="hover:opacity-90 transition-opacity" /></a>`;
    })
    // Standalone markdown image: ![alt](src) → <img>
    // Run BEFORE the plain link regex (which would otherwise capture
    // ![alt as the label and produce a broken anchor).
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_m: string, alt: string, src: string) => {
      return `<img src="${src}" alt="${alt}" style="width: 100%; max-width: 600px; height: auto; margin: 20px 0; border-radius: 8px;" />`;
    })
    // Handle markdown links [text](url)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m: string, label: string, href: string) => {
      // Internal Curify URLs (start with /) open in the SAME tab so session
      // attribution + click tracking works. External URLs keep _blank.
      // Audit 2026-05-30: 90 WC-blog landers / 0 follow-ups / 0% engagement,
      // tracked back to ALL inline markdown links rendering with _blank.
      const isInternal = href.startsWith("/");
      const target = isInternal ? "" : ' target="_blank" rel="noopener noreferrer"';
      return `<a href="${href}"${target} class="text-blue-600 hover:underline">${label}</a>`;
    })
    // Handle mermaid diagrams - process before other formatting
    .replace(/```mermaid\n([\s\S]*?)```/g, '<div class="mermaid">$1</div>')
    // Handle bold text (but not headers)
    .replace(/(?<!^)\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Handle bullet points with bold headers: **Header**: Description
    .replace(/^\*\*(.*?)\*\*:\s*(.+)$/gm, '<li><strong>$1:</strong> $2</li>')
    // Handle paragraph breaks (but don't break lists or headers)
    .replace(/(?:^|\n)(?!<[h|u]).+(?=\n\n|\n|$)/gm, (match) => {
      if (!match.includes('<li>') && !match.includes('<h') && !match.includes('<ul>') && !match.includes('<table>')) {
        return `<p class="mb-4 text-base leading-relaxed">${match.trim()}</p>`;
      }
      return match;
    })
    // Clean up extra line breaks
    .replace(/\n+/g, '');
}

// Enhanced content formatter for Nano Banana content
export function formatNanoBananaContent(content: string): string {
  // Check if content contains HTML (like our tools section with background box)
  if (content.includes('<div style=')) {
    // Return content as-is for HTML sections to preserve styling
    return content;
  }

  // Pre-process: image immediately followed (after blank-line gap) by a
  // standalone markdown CTA link → wrap the image in the same link. See
  // the parallel comment in formatContent for the full rationale.
  let preprocessed = content.replace(
    /(!\[[^\]]*\]\([^)]+\))\n+(\[[^\]]+\]\(([^)]+)\))(?=\n|$)/g,
    (_m, imgMd, linkMd, linkUrl) => `[${imgMd}](${linkUrl})\n\n${linkMd}`
  );

  return preprocessed
    // Image-as-link [![alt](src)](href) — MUST run before the standalone
    // image rule so the inner ![alt](src) isn't replaced first and orphan
    // the wrapping [](href). toCdnUrl applied to src so /images/... is
    // rewritten to the CDN host (CDN fix 2026-06-04, was 404'ing the
    // wrapped images in prod even though the standalone ones worked).
    .replace(/\[!\[([^\]]*)\]\(([^)]+)\)\]\(([^)]+)\)/g, (_m: string, alt: string, src: string, href: string) => {
      const isInternal = href.startsWith("/");
      const target = isInternal ? "" : ' target="_blank" rel="noopener noreferrer"';
      return `<a href="${href}"${target} class="block my-4 mx-auto max-w-md"><img src="${toCdnUrl(src)}" alt="${alt}" class="rounded-lg shadow hover:opacity-90 transition-opacity cursor-pointer" /></a>`;
    })
    // Handle standalone markdown images ![alt](src) — must run before the
    // plain link rule since the syntax overlaps with [text](url). Kept as
    // markdown (not raw <img>) in messages because ICU MessageFormat
    // treats attributed HTML tags as INVALID_TAG and silently swallows
    // the whole message, surfacing as the dot-path key in the rendered page.
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_m: string, alt: string, src: string) =>
      `<img src="${toCdnUrl(src)}" alt="${alt}" class="my-4 mx-auto max-w-md rounded-lg shadow" />`)
    // Handle markdown links [text](url)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m: string, label: string, href: string) => {
      // Internal Curify URLs (start with /) open in the SAME tab so session
      // attribution + click tracking works. External URLs keep _blank.
      // Audit 2026-05-30: 90 WC-blog landers / 0 follow-ups / 0% engagement,
      // tracked back to ALL inline markdown links rendering with _blank.
      const isInternal = href.startsWith("/");
      const target = isInternal ? "" : ' target="_blank" rel="noopener noreferrer"';
      return `<a href="${href}"${target} class="text-blue-600 hover:underline">${label}</a>`;
    })
    // Handle bold text — must run before italic so **x** is consumed first
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Handle single-asterisk italic — guarded against adjacent asterisks
    // so we never partially eat what was meant to be bold.
    .replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '<em>$1</em>')
    // Handle paragraph breaks
    .replace(/\n\n/g, '</p><p class="mb-4 text-base leading-relaxed">')
    // Handle remaining line breaks
    .replace(/\n/g, '<br/>');
}

// Standard content formatter (used by most components)
export function formatContent(content: string): string {
  let processed = content;

  // Handle code blocks FIRST to protect them from other processing
  const codeBlocks: string[] = [];
  processed = processed.replace(/```[\w]*\n([\s\S]*?)```/g, (match, code) => {
    const index = codeBlocks.length;
    codeBlocks.push(code.trim());
    return `__CODE_BLOCK_${index}__`;
  });

  // Handle inline code
  processed = processed.replace(/`([^`]+)`/g, '<code class="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono border border-gray-300">$1</code>');

  // Handle tables next
  processed = parseMarkdownTable(processed);

  // Pre-process: image immediately followed (after blank-line gap) by a
  // standalone markdown CTA link → wrap the image in the same link, so the
  // image itself is tappable while the visible CTA stays below as a
  // fallback affordance. Authored shape in blog.json:
  //
  //     ![alt](/images/foo.jpg)
  //
  //     [Open the X template →](/nano-template/X)
  //
  // Rewrites to the standard image-in-link markdown pattern:
  //
  //     [![alt](/images/foo.jpg)](/nano-template/X)
  //
  //     [Open the X template →](/nano-template/X)
  //
  // Which the image-as-link regex below converts to <a><img></a> + the
  // CTA stays as a regular link. Requires the link to be on its own line
  // (look-ahead `(?=\n|$)`) so we don't accidentally consume the start of
  // a paragraph that happens to begin with a link.
  //
  // Surfaced 2026-06-05 from user UX feedback on /blog/brazil-argentina-
  // soccer-poster-prompts — the Messi-vs-Ronaldo image was paired with
  // an "Open the Sports Battle template →" CTA but only the small CTA
  // text was clickable. Same pattern across portugal/france/1v1/evolution/
  // WC hub / illustrator industrial AI blogs — one regex retroactively
  // upgrades them all.
  processed = processed.replace(
    /(!\[[^\]]*\]\([^)]+\))\n+(\[[^\]]+\]\(([^)]+)\))(?=\n|$)/g,
    (_m, imgMd, linkMd, linkUrl) => `[${imgMd}](${linkUrl})\n\n${linkMd}`
  );
  
  // Then apply all inline formatting
  const result = `<p>${processed
    .replace(/^\*\*(.*?)\*\*$/gm, '</p><h3 class="text-xl font-semibold mt-6 mb-3 text-gray-900">$1</h3><p>')
    .replace(/^### (.+)$/gm, '</p><h3 class="text-xl font-semibold mt-6 mb-3 text-gray-900">$1</h3><p>')
    .replace(/^## (.+)$/gm, '</p><h2 class="text-2xl font-bold mt-8 mb-4 text-gray-900">$1</h2><p>')
    .replace(/^# (.+)$/gm, '</p><h1 class="text-3xl font-bold mt-8 mb-6 text-gray-900">$1</h1><p>')
    // Image-as-link [![alt](src)](href) — MUST run before the standalone
    // image rule so the inner ![alt](src) isn't replaced first and orphan
    // the wrapping [](href). Same same-tab/_blank rule as plain links.
    // Image styling matches the standalone-image rule below so the visual
    // is identical whether or not the image is wrapped in a link.
    .replace(/\[!\[([^\]]*)\]\(([^)]+)\)\]\(([^)]+)\)/g, (_m: string, alt: string, src: string, href: string) => {
      const isInternal = href.startsWith("/");
      const target = isInternal ? "" : ' target="_blank" rel="noopener noreferrer"';
      return `<a href="${href}"${target} class="block my-4 mx-auto max-w-md"><img src="${toCdnUrl(src)}" alt="${alt}" class="rounded-lg shadow hover:opacity-90 transition-opacity cursor-pointer" /></a>`;
    })
    // Handle markdown images ![alt](src) — MUST run before the link rule
    // since the syntax overlaps with [text](url). Kept as markdown (not
    // raw <img>) in messages because ICU MessageFormat treats attributed
    // HTML tags as INVALID_TAG and silently swallows the whole message.
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_m: string, alt: string, src: string) =>
      `<img src="${toCdnUrl(src)}" alt="${alt}" class="my-4 mx-auto max-w-md rounded-lg shadow" />`)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // bold LAST, inline
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m: string, label: string, href: string) => {
      // Internal Curify URLs (start with /) open in the SAME tab so session
      // attribution + click tracking works. External URLs keep _blank.
      // Audit 2026-05-30: 90 WC-blog landers / 0 follow-ups / 0% engagement,
      // tracked back to ALL inline markdown links rendering with _blank.
      const isInternal = href.startsWith("/");
      const target = isInternal ? "" : ' target="_blank" rel="noopener noreferrer"';
      return `<a href="${href}"${target} class="text-blue-600 hover:underline">${label}</a>`;
    })
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)+/g, '<ul class="list-disc pl-6 mb-4 space-y-1">$&</ul>')
    .replace(/\n\n+/g, '</p><p class="mb-4">')
    .replace(/\n/g, '<br/>')
  }</p>`;
  
  // Restore code blocks
  let finalResult = result;
  codeBlocks.forEach((code, index) => {
    const lang = code.includes('python') ? 'python' : code.includes('javascript') || code.includes('js') ? 'javascript' : 'text';
    finalResult = finalResult.replace(`__CODE_BLOCK_${index}__`, `</p><pre class="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto text-sm font-mono leading-relaxed my-6 border border-gray-700"><code class="language-${lang}">${code}</code></pre><p>`);
  });
  
  return finalResult;
}
