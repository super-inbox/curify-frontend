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
  kazahkstan: 'kazakhstan',
  'weaather and seasons': 'weather and seasons',
  llaveros: 'keychain keyring',
  'travel maps soel': 'seoul travel map',
  'xi`an': 'xian',
  "xi'an travel poster": 'xian travel poster',
  '纸袋': 'paper bag',
  'reading about kite': 'kite',
  '风筝': 'kite 风筝',
  'moutain bike': 'mountain bike',
  'moutain bike 3d drawing': 'mountain bike 3d drawing',
  'south east asia map': 'southeast asia map',
  'china旅游地图': 'china travel map',
  'mode im alten rom': 'ancient roman clothing',
};
/** Evidence-bounded product three-view intent. Never treat perspective/3D as
 * orthographic. Keep original subject AND format through every retrieval path.
 * Unknown product names are intentionally left to the existing search flow. */
export function productThreeViewGroups(query: string): string[][] {
  const q = query.toLowerCase().replace(/三\s*视\s*图/g, '三视图');
  if (!/三视图|\borthographic\b|\bthree[ -]views?\b/.test(q)) return [];
  const subjects: [RegExp, string[]][] = [
    [/手链|手镯|\b(?:bracelets?|bangles?)\b/, ['bracelet', 'bangle', '手链', '手镯']],
    [/戒指|\brings?\b/, ['ring', '戒指']],
    [/椅子|\bchairs?\b/, ['chair', '椅子']],
    [/鞋子|\bshoes?\b/, ['shoe', '鞋子']],
  ];
  const subject = subjects.find(([pattern]) => pattern.test(q));
  return subject ? [subject[1], ['orthographic', 'three-view', 'three view', '三视图']] : [];
}
export function retrievalQuery(query: string): string {
  const key = query.toLowerCase().trim().replace(/\s+/g, ' ');
  const threeView = productThreeViewGroups(key);
  return aliases[key] ?? (threeView.length ? `${threeView[0][0]} orthographic three view` : query);
}
export function subjectGroups(query: string): string[][] {
  const q = query.toLowerCase();
  const groups: string[][] = productThreeViewGroups(query);
  // Full-name searches only: “Dali” alone can legitimately mean the city.
  const exact = q.trim().replace(/\s+/g, ' ');
  // Evidence-bounded constraints from the full zero-click audit.
  // Separate groups require BOTH the requested subject and output form.
  const audited: Record<string, string[][]> = {
    "xi'an travel poster": [['xian', "xi'an", 'xi’an', '西安'], ['poster', '海报']],
    'xi`an': [['xian', "xi'an", 'xi’an', '西安']],
    'travel maps soel': [['seoul', '首尔'], ['travel', 'map', '旅行', '地图']],
    '回民街': [['muslim quarter', 'huimin street', '回民街']],
    '纸袋': [['paper bag', 'paper carrier bag', 'paper shopping bag', '纸袋']],
    'amharic language': [['amharic', 'አማርኛ', '阿姆哈拉']],
    'glamour under the spotlight': [['glamour under the spotlight']],
    'basketball rules': [['basketball', '篮球'], ['rules', '规则']],
    'pizza box': [['pizza', '披萨'], ['box', 'packaging', '盒', '包装']],
    'chinese costume': [['chinese', 'china', 'beijing', 'ming dynasty', 'qing dynasty', 'bai', 'buyi', 'tujia', 'hanfu', '中国', '汉服'], ['costume', 'robe', '服饰', '服装']],
    'reading about kite': [['kite', '风筝']],
    '风筝': [['kite', '风筝']],
    'kazahkstan': [['kazakhstan', 'kazakh', '哈萨克']],
    'kazakhstan': [['kazakhstan', 'kazakh', '哈萨克']],
    'tajikistan': [['tajikistan', 'tajik', '塔吉克']],
    'leggings': [['leggings', '瑜伽裤', '紧身裤']],
    'llaveros': [['keychain', 'keyring', 'llavero', '钥匙扣']],
    '徽章': [['badge', 'emblem', 'pin badge', '徽章']],
    'weaather and seasons': [['season', '季节', '四季'], ['weather', '天气']],
  };
  // November 26 live audit: keep compound entities intact through relaxed
  // and rewritten paths. These are observed public intents, not a frequency gate.
  const followup: Record<string, string[][]> = {
    'mountain bike': [['mountain bike', 'mountain biking', '山地自行车', '山地车']],
    'moutain bike': [['mountain bike', 'mountain biking', '山地自行车', '山地车']],
    'moutain bike 3d drawing': [['mountain bike', '山地自行车', '山地车'], ['3d drawing', 'technical drawing', '三维', '技术图']],
    'mountain bike 3d drawing': [['mountain bike', '山地自行车', '山地车'], ['3d drawing', 'technical drawing', '三维', '技术图']],
    'ice cream': [['ice cream', 'ice-cream', 'gelato', '冰淇淋', '冰激凌']],
    'ice cream packaging': [['ice cream', 'ice-cream', 'gelato', '冰淇淋', '冰激凌'], ['packaging', 'package', 'brand identity', '包装']],
    'angus young': [['angus young']],
    'mode im alten rom': [['ancient rome', 'ancient roman', '古罗马'], ['clothing', 'fashion', 'costume', 'toga', '服饰', '服装']],
    'costume australia': [['australia', 'australian', '澳大利亚', '澳洲'], ['costume', 'clothing', '服饰', '服装']],
    'serpentine timeline': [['serpentine', '蛇形']],
    'serpentine timeline infographic': [['serpentine', '蛇形']],
    '蛇形时间线': [['serpentine', '蛇形']],
    '蛇形时间轴': [['serpentine', '蛇形']],
  };
  if (followup[exact]) groups.push(...followup[exact]);
  // Country/region + map is a conjunction, never an OR of generic map words.
  const mapSubjects: [RegExp, string[]][] = [
    [/\bbelgium\b|比利时/, ['belgium', 'belgian', '比利时']],
    [/\bchina\b|中国/, ['china', '中国']],
    [/\bjapan\b|日本/, ['japan', '日本']],
    [/\bspain\b|西班牙/, ['spain', '西班牙']],
    [/\bsouth ?east asia\b|东南亚/, ['southeast asia', 'south east asia', '东南亚']],
  ];
  if (/\bmaps?\b|地图/.test(exact)) {
    const subject = mapSubjects.find(([pattern]) => pattern.test(exact));
    if (subject) groups.push(subject[1], ['map', '地图']);
  }
  if (audited[exact]) groups.push(...audited[exact]);
  if (/^salvador dal[ií]$/.test(exact)) groups.push(['salvador dalí', 'salvador dali']);
  if (exact === 'damien hirst' || exact === 'flanderization') groups.push([exact]);
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


/** For the audited subjects, generic alias/tag words are not proof that the
 * depicted example matches. Check its identity, title and chosen parameters. */
export function needsConcreteSubject(query: string): boolean {
  return productThreeViewGroups(query).length > 0 || /\bmaps?\b|地图/.test(query.toLowerCase()) && subjectGroups(query).length > 0 || new Set(['mountain bike', 'moutain bike', 'mountain bike 3d drawing', 'moutain bike 3d drawing', 'ice cream', 'ice cream packaging', 'angus young', 'mode im alten rom', 'costume australia', 'pizza box', 'chinese costume', 'leggings', '徽章', '纸袋', "xi'an travel poster", 'xi`an', '回民街', 'amharic language']).has(query.trim().toLowerCase());
}
export function concreteSubjectText(record: { id?: string; params?: unknown; locales?: unknown }): string {
  const locales = record.locales && typeof record.locales === 'object' ? Object.values(record.locales) : [];
  return JSON.stringify([record.id, record.params, locales.map((v: any) => [v?.title, v?.category])]);
}
