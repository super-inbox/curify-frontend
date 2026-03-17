/**
 * Parses a markdown table string into an HTML table string.
 * Handles separator rows like |---|---| or | :--- | :--- | or |:--:|:--:|
 */
function parseMarkdownTable(tableText: string): string {
  const lines = tableText.trim().split("\n").filter((l) => l.trim());

  if (lines.length < 2) return tableText;

  // Detect and skip the separator row (2nd line)
  const separatorIndex = lines.findIndex((line) =>
    /^\|[\s]*[-:]+[-|\s:]*\|/.test(line)
  );
  if (separatorIndex === -1) return tableText;

  const headerLine = lines[separatorIndex - 1];
  const dataLines = lines.slice(separatorIndex + 1);

  const parseRow = (line: string) =>
    line
      .split("|")
      .slice(1, -1) // remove leading/trailing empty strings from split
      .map((cell) => cell.trim());

  const headers = parseRow(headerLine);

  const headerHtml = headers
    .map(
      (h) =>
        `<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">${h}</th>`
    )
    .join("");

  const rowsHtml = dataLines
    .map((line) => {
      const cells = parseRow(line);
      const cellsHtml = cells
        .map(
          (c, i) =>
            `<td class="px-6 py-4 text-sm ${i === 0 ? "font-medium text-gray-900" : "text-gray-500"} border-b">${c}</td>`
        )
        .join("");
      return `<tr class="hover:bg-gray-50">${cellsHtml}</tr>`;
    })
    .join("");

  return `
    <div class="overflow-x-auto mb-6">
      <table class="min-w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden">
        <thead class="bg-gray-50">
          <tr>${headerHtml}</tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </div>`;
}

/**
 * Formats markdown content to HTML.
 * Handles tables, bold, bullet lists, and paragraph breaks.
 */
export function formatContent(content: string): string {
  // 1. Extract and replace markdown tables before other processing
  const tableRegex = /(\|.+\|\n\|[-| :]+\|\n(?:\|.+\|\n?)*)/g;
  content = content.replace(tableRegex, (match) => parseMarkdownTable(match));

  return (
    content
      // Bold text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      // Bullet points with bold header: **Header**: Description
      .replace(
        /^[-*]\s+\*\*(.*?)\*\*:\s*(.+)$/gm,
        "<li><strong>$1:</strong> $2</li>"
      )
      // Regular bullet points
      .replace(/^[-*]\s+(.+)$/gm, "<li>$1</li>")
      // Wrap consecutive <li> items in <ul>
      .replace(
        /(<li>[\s\S]*?<\/li>)(\n<li>[\s\S]*?<\/li>)*/g,
        (match) => `<ul class="list-disc pl-6 mb-4">${match}</ul>`
      )
      // Double newlines → paragraph breaks
      .replace(/\n\n/g, '</p><p class="mb-4">')
      // Remaining single newlines
      .replace(/\n/g, "<br/>")
  );
}