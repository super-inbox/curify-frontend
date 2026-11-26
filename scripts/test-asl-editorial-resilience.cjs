// Run against an optimized production server: TEST_BASE_URL=http://localhost:3025 node scripts/test-asl-editorial-resilience.cjs
// Includes real script request failures; all tracking requests are intercepted.
// Dev metadata streaming is not the production prerendering behavior under test.
const {chromium}=require('playwright');const assert=require('node:assert/strict');const fs=require('node:fs');const BASE=process.env.TEST_BASE_URL || 'http://localhost:3024';
(async()=>{const browser=await chromium.launch({headless:true,channel:"chrome"});const results=[];
for(const mode of ['desktop','mobile','no-javascript','removed-app-dependencies','blocked-framework-scripts','blocked-analytics']){
 const context=await browser.newContext({viewport:mode==='mobile'?{width:390,height:844}:{width:1366,height:900},javaScriptEnabled:mode!=='no-javascript'});const page=await context.newPage();const errors=[],blocked=[],requests=[],events=[];await page.route('**/interactions/track',route=>{try{events.push(JSON.parse(route.request().postData()));}catch{}return route.fulfill({status:200,contentType:'application/json',body:'{}'});});if(mode==='blocked-analytics')await page.route('**/editorial-tracking.js',route=>{blocked.push(route.request().url());return route.abort('failed');});page.on('pageerror',e=>errors.push(e.message));page.on('request',req=>requests.push(req.url()));
 // Failed application chunks must not remove a read-only article. Framework
 // bootstrap is left available so this is not just disabling JavaScript.
 if(mode==='removed-app-dependencies'||mode==='blocked-framework-scripts')await page.route('**/_next/static/chunks/**',route=>{
  const url=decodeURIComponent(route.request().url());if(mode==='blocked-framework-scripts'||url.includes('/app/')||/\/(6483|1740|7676)[-.]/.test(url)){blocked.push(url);return route.abort('failed');}return route.continue();
 });
 const response=await page.goto(BASE+'/blog/asl-resources',{waitUntil:'networkidle',timeout:60000});assert.equal(response.status(),200);await page.waitForTimeout(500);
 assert.equal(await page.locator('article').count(),1);assert.match(await page.locator('h1').innerText(),/^ASL Resources:/);assert.equal(await page.locator('head link[rel=canonical]').getAttribute('href'),'https://www.curify-ai.com/blog/asl-resources');assert.equal(await page.locator('html#__next_error__').count(),0);assert.equal(await page.locator('[data-resource-grid] > section').count(),8);
 assert.ok(await page.locator('[data-blog-hero] img').evaluate(img=>img.complete && img.naturalWidth>0),'hero image must load');
 assert.equal(await page.locator('[data-blog-hero] > a').first().getAttribute('href'),'/tools/asl-video-translator');assert.equal(await page.locator('[data-blog-cta]').count(),3);assert.equal(await page.locator('#related-articles').count(),1);assert.equal(await page.locator('[data-blog-footer] section a').count(),3);
 const layout=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));assert.ok(layout.scroll<=layout.width);assert.deepEqual(errors,[]);
 assert.ok(!requests.some(url=>decodeURIComponent(url).includes('/(public)/layout')),'article must not load interactive public shell');
 if(mode==='desktop'){
  assert.ok(events.some(e=>e.action_type==='view'),'optional tracker retains page-view contract');
  await page.evaluate(()=>document.addEventListener('click',event=>event.preventDefault(),true));
  await page.locator('[data-blog-cta=inline]').click();await page.waitForTimeout(300);
  assert.ok(events.some(e=>e.content_id==='blog-link:asl-resources:/tools/asl-video-translator'&&e.action_type==='click'),'tool CTA retains click attribution');
  assert.match(await page.evaluate(()=>sessionStorage.getItem('_curify_first_touch')),/blog\/asl-resources/);
 }

 if(mode==='blocked-framework-scripts'||mode==='blocked-analytics')assert.ok(blocked.length>0,'failure case must abort at least one actual request');
 const item={mode,events:events.length,http:response.status(),errors,blocked:blocked.map(url=>url.replace(BASE,'')),layout,article:true,headCanonical:true,resourceCards:8,ctaCount:3,relatedArticles:3};results.push(item);if(mode==='desktop')await page.screenshot({path:'/tmp/asl-isolated-desktop-1126.png',fullPage:false});if(mode==='mobile')await page.screenshot({path:'/tmp/asl-isolated-mobile-1126.png',fullPage:false});await context.close();
}
// English-only editorial fallback must remain excluded from other locales.
const page=await browser.newPage();await page.goto(BASE+'/zh/blog/asl-resources',{waitUntil:'networkidle'});assert.match(await page.locator('meta[name=robots]').getAttribute('content'),/noindex/);assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),'https://www.curify-ai.com/blog/asl-resources');await browser.close();fs.writeFileSync('/tmp/asl-render-isolation-tests-1126.json',JSON.stringify({results,zhFallback:'noindex, english canonical'},null,2));console.log(JSON.stringify(results,null,2));})().catch(e=>{console.error(e);process.exit(1)});
