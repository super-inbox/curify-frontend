// Local browser QA. All backend writes are mocked; no production jobs or analytics.
const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 for(const locale of (process.argv.includes('--flow-only')?[]:['','/zh','/ja'])){
  const context=await browser.newContext({viewport:{width:1440,height:1000}});const page=await context.newPage();page.setDefaultTimeout(30000);const events=[];
  await page.route('**/interactions/track',r=>{events.push(JSON.parse(r.request().postData()));return r.fulfill({json:{}});});
  await page.goto('http://localhost:3001'+locale+'/',{waitUntil:'domcontentloaded'});
  console.log('loaded',locale);await page.locator('[data-creation-task="asl"]').waitFor();await page.waitForTimeout(2500);assert.equal(await page.locator('[data-creation-task]').count(),6);
  assert(await page.evaluate(()=>!!(document.querySelector('#create-tasks').compareDocumentPosition(document.querySelector('#solutions'))&Node.DOCUMENT_POSITION_FOLLOWING)));
  await page.addStyleTag({content:'header, nav, [class*=sticky] {position:static !important;} nextjs-portal {display:none !important;}'});await page.locator('#create-tasks img').evaluateAll(async imgs=>{await Promise.all(imgs.map(im=>im.decode().catch(()=>{})));});assert(await page.locator('#create-tasks img').evaluateAll(imgs=>imgs.every(im=>im.naturalWidth>0)));await page.locator('#create-tasks').screenshot({animations:'disabled',path:`/tmp/home-tasks-${locale.slice(1)||'en'}-desktop.png`});
  assert(await page.evaluate(()=>!!(document.querySelector('#home-tools').compareDocumentPosition(document.querySelector('#solutions'))&Node.DOCUMENT_POSITION_FOLLOWING) && !!(document.querySelector('#solutions').compareDocumentPosition(document.querySelector('#explore-niche'))&Node.DOCUMENT_POSITION_FOLLOWING)));
  await page.setViewportSize({width:390,height:844});await page.locator('#create-tasks img').evaluateAll(async imgs=>{await Promise.all(imgs.map(im=>im.decode().catch(()=>{})));});assert(await page.locator('#create-tasks img').evaluateAll(imgs=>imgs.every(im=>im.naturalWidth>0)));await page.locator('#create-tasks').screenshot({animations:'disabled',path:`/tmp/home-tasks-${locale.slice(1)||'en'}-mobile.png`});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));
  console.log('screenshots',locale);await page.locator('[data-creation-task="motion"] a').click();await page.locator('#reproduce').waitFor();console.log('tool loaded',locale);
  await page.locator('[data-task-context=motion]').waitFor();await page.waitForTimeout(1500);assert(events.some(e=>e.content_id==='home-task:motion:gentle-motion'));assert(events.some(e=>e.content_id==='task:motion:gentle-motion:arrive'));
  await context.close();console.log('homepage passed',locale||'en');
 }
 const context=await browser.newContext();const page=await context.newPage();page.setDefaultTimeout(30000);const events=[];let generates=0,resumes=0,status='pending';
 await context.addInitScript(()=>{localStorage.setItem('access_token','local-test');localStorage.setItem('curifyUser',JSON.stringify({user_id:7,email:'test@example.invalid',non_expiring_credits:1000,expiring_credits:0}));});
 await page.route('**/interactions/track',r=>{events.push(JSON.parse(r.request().postData()));return r.fulfill({json:{}});});
 await page.route('**/creative-video/capabilities',r=>r.fulfill({json:{available:true,credits_per_shot:60,souvenir_credits:260}}));
 await page.route('**/creative-video/upload',r=>r.fulfill({json:{data:{image_id:'test',blob_url:'images/uploads/7/'+'a'.repeat(32)+'.jpg'}}}));
 await page.route('**/creative-video/generate',r=>{generates++;assert.equal(JSON.parse(r.request().postData()).consent,true);return r.fulfill({json:{project_id:'local-test'}});});
 await page.route('**/creative-video/status/*',r=>r.fulfill({json:{status,completed_shots:status==='completed'?1:0,total_shots:1,result_url:status==='completed'?'/video/asl-demo-translation.mp4':null}}));
 await page.route('**/creative-video/resume/*',r=>{resumes++;status='completed';return r.fulfill({json:{project_id:'local-test'}});});
 await page.goto('http://localhost:3001/tools/photo-motion?task=motion&example=gentle-motion');
 await page.locator('input[type=file]').setInputFiles('public/task-examples/photo-motion.jpg');
 await page.locator('input[type=checkbox]').check();await page.getByRole('button',{name:'Create video · 60 credits'}).click();
 await page.getByRole('button',{name:'Resume saved project'}).waitFor();assert.equal(generates,1);
 await page.reload();await page.getByRole('button',{name:'Resume saved project'}).click();await page.locator('video').waitFor();assert.equal(generates,1);assert.equal(resumes,1);assert.equal(events.filter(e=>e.content_id==='task:motion:gentle-motion:accepted').length,1,'resume is not a new accepted job');
 await page.waitForTimeout(500);for(const stage of ['upload','attempt','accepted','pending','success'])assert(events.some(e=>e.content_id===`task:motion:gentle-motion:${stage}`),stage);
 await page.screenshot({path:'/tmp/photo-motion-flow.png',fullPage:true});
 await page.reload();await page.locator('video').waitFor();await page.waitForTimeout(500);assert.equal(events.filter(e=>e.content_id==='task:motion:gentle-motion:success').length,1,'refresh must not duplicate success');
 await page.goto('http://localhost:3001/zh/tools/travel-souvenir-video?task=souvenir&example=kyoto');
 await page.locator('select').first().waitFor();assert.equal(await page.locator('select').first().locator('option').count(),5);
 await page.locator('input[type=file]').setInputFiles('public/task-examples/photo-motion.jpg');await page.locator('input[type=checkbox]').check();
 await page.route('**/creative-video/generate',r=>r.fulfill({status:402,json:{detail:'Not enough credits'}}));
 await page.getByRole('button',{name:'生成视频 · 260 积分'}).click();await page.locator('#reproduce [role=alert]').waitFor();assert.equal(await page.locator('video').count(),0,'failed request cannot render success');
 await page.screenshot({path:'/tmp/travel-video-form.png',fullPage:true});
 await page.route('**/creative-video/capabilities',r=>r.fulfill({json:{available:true,modes:{motion:true,souvenir:false},credits_per_shot:60,souvenir_credits:260}}));
 await page.reload();await page.getByText('功能预览：当前服务器尚未开放生成。').waitFor();assert(await page.getByRole('button',{name:/生成视频/}).isDisabled());
 await context.close();console.log('video upload, pending, reload, resume, success passed');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
