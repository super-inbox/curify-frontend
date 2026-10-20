/** Narrow, evidenced intent constraints from the October 2026 search review.
 * Apply to every retrieval path using the original query, never its rewrite.
 */
const aliases: Record<string, string> = {
  'diseño industrial': 'industrial design',
  'diseno industrial': 'industrial design',
  'industrial desing': 'industrial design',
  'tablero de presentacion': 'industrial design presentation board',
  'tablero de presentación': 'industrial design presentation board',
  'art movments': 'art movements',
  cubism: 'cubism picasso',
};
export function retrievalQuery(query: string): string {
  const key = query.toLowerCase().trim().replace(/\s+/g, ' ');
  return aliases[key] ?? query;
}
export function subjectGroups(query: string): string[][] {
  const q = query.toLowerCase();
  const groups: string[][] = [];
  if (/\bart move?ments\b/.test(q)) groups.push(['art movement', 'art history', '艺术流派', '艺术运动', '美术史']);
  if (/郁金香|\btulips?\b/.test(q)) groups.push(['郁金香', 'tulip']);
  if (/\b(filipino|tagalog)\b/.test(q)) groups.push(['filipino', 'tagalog']);
  if (/\bpoems?\b|\bpoetry\b/.test(q)) {
    groups.push(['poem', 'poetry', 'tula', '诗']);
    if (/\bkorea(n)?\b/.test(q)) groups.push(['korean', '한국어', '韩语']);
  }
  if (/\bpeacock\b/.test(q)) groups.push(['peacock', '孔雀']);
  if (/\bmagnetic\b/.test(q) && /\bbox\b/.test(q)) groups.push(['magnetic box', 'magnetic gift box', 'magnetic closure', '磁吸']);
  if (/\bdieline\b/.test(q)) groups.push(['dieline', '刀版', '刀模']);
  return groups;
}
export function createSubjectMatcher(query: string): (text: string) => boolean {
  const groups = subjectGroups(query).map(group => group.map(term => {
    if (/[^\x00-\x7F]/.test(term)) return (text: string) => text.includes(term);
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`(?:^|[^a-z0-9])${escaped}(?:s)?(?:$|[^a-z0-9])`, 'i');
    return (text: string) => pattern.test(text);
  }));
  return text => groups.every(group => group.some(matches => matches(text.toLowerCase())));
}
export function matchesSubject(query: string, text: string): boolean {
  return createSubjectMatcher(query)(text);
}
/** Only parse; never fetch pasted URLs on the server. */
export function sourceVideoUrl(raw: string): string | null {
  try {
    const u = new URL(raw.trim());
    if (!['https:', 'http:'].includes(u.protocol) || u.username || u.password) return null;
    if (!u.hostname.includes('.') || u.hostname === 'localhost') return null;
    const videoHost = /(^|\.)(youtube\.com|youtu\.be|vimeo\.com|facebook\.com|fb\.watch|drive\.google\.com|tsdeaf\.org)$/.test(u.hostname);
    if (!videoHost && !/\.(mp4|mov|webm|m4v)$/i.test(u.pathname) && !/\/(video|media2)\//i.test(u.pathname)) return null;
    return u.href;
  } catch { return null; }
}
export function youtubeSource(raw: string): string | null {
  const value = sourceVideoUrl(raw);
  if (!value) return null;
  const u = new URL(value);
  return ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'].includes(u.hostname) ? value : null;
}

export function matchesCuratedGallery(query: string, entry: { aliases?: string[]; title: string; description: string }): boolean {
  const q = query.toLowerCase().trim();
  return (entry.aliases ?? []).some(alias => q === alias.toLowerCase() ||
    (/[^\x00-\x7F]/.test(alias) && q.includes(alias))) &&
    matchesSubject(query, JSON.stringify(entry));
}
