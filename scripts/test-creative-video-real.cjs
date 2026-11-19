// Opt-in real-provider acceptance; use only the isolated local API/database test server.
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
if(process.env.RUN_REAL_CREATIVE_VIDEO!=='1')throw Error('Set RUN_REAL_CREATIVE_VIDEO=1 to authorize paid provider acceptance samples.');
const out=process.env.CREATIVE_ACCEPTANCE_DIR||'/tmp/creative-video-acceptance';
const cases=[{mode:'motion',uid:1999111901,slug:'photo-motion',example:'gentle-motion',input:process.env.CREATIVE_MOTION_INPUT}, {mode:'souvenir',uid:1999111902,slug:'travel-souvenir-video',example:'kyoto',input:process.env.CREATIVE_TRAVEL_INPUT}];
if(cases.some(c=>!c.input))throw Error('Set CREATIVE_MOTION_INPUT and CREATIVE_TRAVEL_INPUT to approved local sample photos.');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{await Promise.all(cases.map(async c=>{
 const statePath=path.join(out,c.mode+'.json');if(fs.existsSync(statePath))throw Error('Saved run exists; resume it rather than create another.');
 const context=await browser.newContext();const page=await context.newPage();page.setDefaultTimeout(120000);
 const token=fs.readFileSync(path.join(out,'token-'+c.uid),'utf8');
 await context.addInitScript(({uid,token})=>{localStorage.setItem('access_token',token);localStorage.setItem('curifyUser',JSON.stringify({user_id:uid,email:'local-test@example.invalid',non_expiring_credits:1000,expiring_credits:0}));},{uid:c.uid,token});
 page.on('requestfailed',req=>console.log(c.mode,'request failed',new URL(req.url()).pathname,req.failure()?.errorText));
 page.on('console',m=>{if(m.type()==='error')console.log(c.mode,'console',m.text().slice(0,300));});
 const events=[];await page.route('**/interactions/track',r=>{events.push(JSON.parse(r.request().postData()).content_id);return r.fulfill({json:{}});});
 await page.route('**/curify-video-translate-*/**',r=>r.abort()); // Network isolation: explicit routes below take precedence.
 await page.route('**/user/profile',r=>r.fulfill({json:{data:{user_id:c.uid,email:'local-test@example.invalid',non_expiring_credits:1000,expiring_credits:0}}}));
 page.on('response',async response=>{if(new URL(response.url()).pathname==='/creative-video/generate' && response.request().method()==='POST'){const body=await response.json();if(!response.ok()){console.log(c.mode,'generate failed',response.status());return;}fs.writeFileSync(statePath,JSON.stringify({mode:c.mode,uid:c.uid,input:c.input,project_id:body.project_id,events},null,2));console.log(c.mode,'accepted',body.project_id);}});
 await page.goto('http://localhost:3001/tools/'+c.slug+'?task='+c.mode+'&example='+c.example,{waitUntil:'domcontentloaded'});
 console.log(c.mode,'page ready');await page.locator('input[type=file]').setInputFiles(c.input);console.log(c.mode,'file chosen');await page.locator('label').filter({hasText:'Music'}).locator('select').selectOption(c.mode==='motion'?'calm':'piano');await page.locator('input[type=checkbox]').check();
 console.log(c.mode,'settings chosen');await page.screenshot({path:path.join(out,c.mode+'-pre-submit.png'),fullPage:true});
 const button=page.getByRole('button',{name:/Create video/});await page.waitForFunction(()=>Array.from(document.querySelectorAll('button')).some(b=>b.textContent.includes('Create video')&&!b.disabled));await button.click();
 await page.waitForFunction(()=>document.querySelector('#reproduce code'));await page.screenshot({path:path.join(out,c.mode+'-submitted.png'),fullPage:true});
 let last='';for(let i=0;i<240;i++){await page.waitForTimeout(5000);const text=await page.locator('#reproduce').innerText();const state=JSON.parse(fs.readFileSync(statePath));state.events=events;fs.writeFileSync(statePath,JSON.stringify(state,null,2));
  if(await page.locator('#reproduce video').count()){await page.screenshot({path:path.join(out,c.mode+'-completed.png'),fullPage:true});console.log(c.mode,'UI completed');break;}
  if(/review_required|failed|pending/.test(text)){console.log(c.mode,'needs attention',text.slice(-400));break;}
  if(i%6===0)console.log(c.mode,'rendering',i*5+'s');
 }
 await context.close();}));}finally{await browser.close();}})().catch(e=>{console.error(e.message);process.exit(1)});
