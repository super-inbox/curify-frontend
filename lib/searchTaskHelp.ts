export type SearchHelpIntent = 'workspace' | 'video' | 'slides' | 'upload' | 'local-file' | 'translate' | 'combine';

export function searchHelpIntent(query: string): SearchHelpIntent | null {
  const q = query.trim().toLowerCase().replace(/\s+/g, ' ');
  if (/^(my videos|my workplace|my workspace)$/.test(q)) return 'workspace';
  if (/^(hacer un video|make a video|create a video)$/.test(q)) return 'video';
  if (q === 'generar un video a partir de un link de diapositiva') return 'slides';
  if (q === 'how long does it take to upload a video') return 'upload';
  // Do not echo, fetch, or send pasted private filesystem paths to rewriting.
  if (/^(?:\/(?:users|home)\/|[a-z]:\\)/i.test(query.trim())) return 'local-file';
  if (q === 'translate') return 'translate';
  if (q === 'combine') return 'combine';
  return null;
}
