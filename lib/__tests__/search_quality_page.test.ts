import {it,vi,expect} from 'vitest';
import fs from 'node:fs';
vi.mock('next/headers',()=>({headers:async()=>new Headers({'user-agent':'local-review'})}));
vi.mock('next/navigation',()=>({redirect:(s:string)=>{throw Error('REDIRECT '+s)}}));
vi.mock('next-intl/server',()=>({getTranslations:async(arg:any)=>{
 const locale=arg?.locale||'en';let d:any=JSON.parse(fs.readFileSync(`${process.cwd()}/messages/${locale}/nano.json`,'utf8'));
 const fn:any=(k:string)=>k.split('.').reduce((o:any,p:string)=>o?.[p],d)??k;fn.has=(k:string)=>k.split('.').reduce((o:any,p:string)=>o?.[p],d)!=null;fn.raw=fn;return fn;
}}));
vi.mock('@/services/nanoPrompts',()=>({nanoPromptsService:{listByTag:async()=>[],getByTag:async()=>[],getNanoPromptsByTag:async()=>[]}}));
vi.mock('@/app/[locale]/(public)/search/SearchResultsClient',()=>({default:()=>null}));
vi.mock('@/lib/searchRewrite',()=>({getMultiQueryPaths:async()=>({rewrites:['fitness infographic','travel seoul'],decomposition:{}}),flattenPaths:()=>['fitness infographic','travel seoul']}));
import Page from '@/app/[locale]/(public)/search/page';
import {matchToolIntent} from '@/lib/searchIndex';

const page = async(q:string):Promise<any> => Page({params:Promise.resolve({locale:'en'}),searchParams:Promise.resolve({q})});
it('routes Chinese subtitles before image retrieval',async()=>{
 await expect(page('字幕翻译')).rejects.toThrow('REDIRECT /en/tools/bilingual-subtitles');
});
it('retains case-sensitive pasted sources in a tool chooser',async()=>{
 const r=await page('https://www.youtube.com/watch?v=AbCdEf12345');
 expect(r.props.sourceUrl).toBe('https://www.youtube.com/watch?v=AbCdEf12345');
});
it('retrieves cubism and Spanish industrial design',async()=>{
 const cubism=await page('cubism');expect(cubism.props.inspirations[0].id).toContain('picasso');
 const es=await page('diseño industrial'), en=await page('industrial design');
 expect(es.props.inspirations.slice(0,4).map((x:any)=>x.id)).toEqual(en.props.inspirations.slice(0,4).map((x:any)=>x.id));
});
it('keeps original subjects despite irrelevant rewrite paths',async()=>{
 const art=await page('art movements');expect(art.props.inspirations[0].id).toContain('art-history');
 expect(art.props.inspirations.some((x:any)=>/fitness|yoga|posture/.test(x.id))).toBe(false);
 const tulip=await page('盆栽郁金香的种植图解');
 expect(tulip.props.inspirations).toHaveLength(0);expect(tulip.props.matchedTemplates).toHaveLength(0);
});
it('surfaces exact packaging and language-specific content',async()=>{
 await expect(page('dieline to 3d box')).rejects.toThrow('REDIRECT /en/tools/packaging-mockup');
 const box=await page('magnetic box mockup');expect(box.props.galleryPrompts[0].id).toBe(2026102001);
 const poem=await page('infographic poem in filipino');expect(poem.props.galleryPrompts[0].id).toBe(2026102002);
 const bilingual=await page('infographic poem in filipino and korea');expect(bilingual.props.galleryPrompts).toHaveLength(0);
 const gown=await page('peacock dress');expect(gown.props.inspirations[0].id).toContain('peacock-couture');
});

it.each(['Salvador Dali', 'Salvador Dalí'])('finds the painting instead of Dali travel: %s', async q => {
 const r=await page(q);
 expect(r.props.inspirations[0]?.id).toContain('the-persistence-of-memory');
 expect(r.props.inspirations.some((x:any)=>x.id.includes('travel'))).toBe(false);
 expect(r.props.matchedTemplates.map((x:any)=>x.template_id)).toEqual(['template-classical-famous-painting-analysis-cartoon-infographic']);
});
it.each(['Damien Hirst', 'flanderization'])('does not substitute unrelated rewrite results for %s', async q => {
 const r=await page(q);
 expect(r.props.inspirations).toHaveLength(0);
 expect(r.props.matchedTemplates).toHaveLength(0);
});

// Exercise the actual server redirect ordering, not only the shared matcher.
import toolEval from '@/scripts/configs/tool_search_eval_set.json';
for (const row of toolEval.cases) {
 it(`server tool eval: ${row.locale} / ${row.query}`, async () => {
   try {
     await Page({params:Promise.resolve({locale:row.locale}),searchParams:Promise.resolve({q:row.query})});
     expect(row.expected).toBeNull();
   } catch (error) {
     const message=String(error);
     if (!message.includes('REDIRECT ')) throw error;
     const href=message.split('REDIRECT ')[1];
     const url=new URL(href, 'https://example.test');
     if (row.expected) {
       expect(url.pathname).toBe(row.expected);
       expect(url.searchParams.get('from_search')).toBe(row.query);
     } else expect(url.pathname).not.toContain('/tools');
   }
 });
}

it.each(['reading about kite', '风筝'])('finds the new educational kite example: %s', async q => {
 const r=await page(q);
 expect(r.props.inspirations[0]?.id).toContain('how-a-kite-flies-20261107');
 expect(r.props.inspirations.every((x:any)=>x.id.includes('kite'))).toBe(true);
});
it('keeps basketball rules on the requested sport and format', async()=>{
 const r=await page('basketball rules');
 expect(r.props.inspirations.length).toBeGreaterThan(0);
 expect(r.props.inspirations.every((x:any)=>x.id.includes('basketball') && x.id.includes('rules'))).toBe(true);
});
it.each(['pizza box', 'tajikistan', 'leggings'])('does not fill real gaps with other subjects: %s', async q=>{
 const r=await page(q);expect(r.props.inspirations).toHaveLength(0);
});
it('limits Chinese costume examples to actual costumes',async()=>{
 const r=await page('chinese costume');
 expect(r.props.inspirations.length).toBeGreaterThan(0);
 expect(r.props.inspirations.some((x:any)=>/baiji|panda|angelica|americas/.test(x.id))).toBe(false);
});
it('normalizes the observed weather typo without unrelated rewrites',async()=>{
 const r=await page('weaather and seasons');
 expect(r.props.inspirations.length).toBeGreaterThan(0);
 expect(r.props.inspirations.some((x:any)=>/walter-white/.test(x.id))).toBe(false);
});
it('routes the legacy World Cup topic slug', async()=>{
 await expect(page('wc-portugal')).rejects.toThrow('/topics/portugal-world-cup');
});
it.each([
 ['my videos','workspace'], ['my workplace','workspace'],
 ['hacer un video','video'], ['generar un video a partir de un link de diapositiva','slides'],
 ['how long does it take to upload a video','upload'], ['translate','translate'], ['combine','combine'],
 ['/Users/example/Pictures/input.jpg','local-file'],
])('handles task/help intent without image search: %s',async(q,kind)=>{
 const r=await page(q);expect(r.props.kind).toBe(kind);expect(r.props.inspirations).toBeUndefined();
});

it('surfaces an existing leggings gallery reference rather than unrelated retouching',async()=>{
 const r=await page('leggings');
 expect(r.props.galleryPrompts.map((x:any)=>x.id)).toContain(4152);
 expect(r.props.inspirations).toHaveLength(0);
});

it('retrieves the exact existing gallery title instead of generic spotlight rewrites',async()=>{
 const r=await page('glamour under the spotlight');
 expect(r.props.galleryPrompts.map((x:any)=>x.id)).toContain(750);
 expect(r.props.inspirations).toHaveLength(0);
});

// The saved review cases are executable, not a report-only list.
import auditSet from '@/scripts/configs/search_quality_audit_20261107.json';
type AuditCase = { query: string; required_id?: string; required_gallery_id?: number; exclude_subjects?: string[]; empty_examples?: boolean; help_kind?: string; redirect_path?: string };
for (const c of auditSet.cases as AuditCase[]) {
 it(`saved full-audit case: ${c.query}`, async()=>{
   if (c.redirect_path) { await expect(page(c.query)).rejects.toThrow(c.redirect_path); return; }
   const r=await page(c.query);
   if (c.help_kind) { expect(r.props.kind).toBe(c.help_kind); return; }
   const ids=(r.props.inspirations ?? []).map((x:any)=>x.id);
   if (c.required_id) expect(ids).toContain(c.required_id);
   if (c.empty_examples) expect(ids).toHaveLength(0);
   if (c.required_gallery_id) expect(r.props.galleryPrompts.map((x:any)=>x.id)).toContain(c.required_gallery_id);
   for (const excluded of c.exclude_subjects ?? []) expect(ids.some((id:string)=>id.includes(excluded))).toBe(false);
 });
}

it.each([
 ['i love you in asl','i-love-you'],
 ['thank you in asl','thank-you'],
 ['please in asl','please'],
 ['我爱你手语','i-love-you'],
 ['asl short sentences',''],
])('finds ASL phrase study examples: %s',async(q,suffix)=>{
 const r=await page(q);
 expect(r.props.inspirations.slice(0,10).some((x:any)=>x.id.startsWith('template-asl-short-phrase-sequence') && x.id.endsWith(suffix))).toBe(true);
});
