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
