// Run with a local Next server: BUSINESS_TEST_URL=http://localhost:3001 node scripts/test-business-tracking.cjs
// All analytics and lead requests are intercepted; no production events or emails.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const base = process.env.BUSINESS_TEST_URL || 'http://localhost:3001';
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const [path, lang] of (process.argv.includes('--inbound-only') ? [] : [['/business', 'en'], ['/zh/business', 'zh'], ['/ja/business', 'en']])) {
      const context = await browser.newContext();
      const page = await context.newPage();
      const events = [], leads = [];
      let failLead = true;
      await page.route('**/interactions/track', async route => {
        events.push(JSON.parse(route.request().postData()));
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      });
      await page.route('**/user/contact-team', async route => {
        leads.push(JSON.parse(route.request().postData()));
        await route.fulfill({ status: failLead ? 500 : 200, contentType: 'application/json', body: JSON.stringify({ data: 'ok', message: 'Test failure' }) });
      });
      const count = (id, action) => events.filter(e => e.content_id === id && e.action_type === action).length;
      const waitEvent = async (id, action, n = 1) => {
        for (let i = 0; i < 100 && count(id, action) < n; i++) await page.waitForTimeout(50);
        assert.equal(count(id, action), n, `${path}: ${id}/${action}`);
      };
      await page.goto(`${base}${path}?utm_source=test&utm_campaign=business-qa&email=private@example.com`, { waitUntil: 'domcontentloaded' });
      await waitEvent(`business:${lang}`, 'view');
      // Keep links on the page while allowing React handlers to receive real clicks.
      await page.evaluate(() => document.addEventListener('click', e => { if (e.target.closest('a')) e.preventDefault(); }, { capture: true }));
      await page.locator('[data-business-event=examples]').click();
      await waitEvent(`business:${lang}:examples`, 'click');
      const links = page.locator('a[data-business-event^="sector:"]');
      assert.equal(await links.count(), 9);
      for (const link of await links.all()) {
        const event = await link.getAttribute('data-business-event');
        const id = event.split(':')[1];
        const url = new URL(await link.getAttribute('href'), base);
        assert.equal(url.searchParams.get('source'), `business:${lang}:${id}`);
        await link.click();
        await waitEvent(`business:${lang}:${event}`, 'click');
      }
      await page.locator('[data-business-event=enterprise]').click();
      await waitEvent(`business:${lang}:enterprise`, 'click');
      await page.locator('footer a[href$="/business"]').click();
      await waitEvent('footer:business', 'click');
      const video = page.locator('video').first();
      await video.evaluate(v => { v.muted = true; return v.play(); });
      await waitEvent(`business:${lang}:video:fabric`, 'video_play');
      await video.evaluate(v => { v.pause(); return v.play(); });
      await page.waitForTimeout(200);
      assert.equal(count(`business:${lang}:video:fabric`, 'video_play'), 1, 'resume does not duplicate playback');
      await video.evaluate(v => v.pause());
      const form = page.locator('#business-page form').last();
      await form.locator('input[type=email]').fill('business-test@example.com');
      await form.locator('textarea').fill('Test brief');
      await form.locator('button[type=submit]').click();
      await form.locator('[role=status]').waitFor();
      await waitEvent(`business:${lang}:brief`, 'click');
      assert.equal(count(`contact:submit:business:${lang}:brief`, 'click'), 0, 'failed leads are not conversions');
      failLead = false;
      await form.locator('button[type=submit]').click();
      await waitEvent(`business:${lang}:brief`, 'click', 2);
      await waitEvent(`contact:submit:business:${lang}:brief`, 'click');
      const hero = page.locator('#business-page form').first();
      await hero.locator('input[type=email]').fill('business-test@example.com');
      await hero.locator('button[type=submit]').click();
      await waitEvent(`business:${lang}:hero`, 'click');
      await waitEvent(`contact:submit:business:${lang}:hero`, 'click');
      for (const lead of leads) {
        assert.ok(lead.source.startsWith(`business:${lang}:`));
        assert.ok(lead.content.includes('utm_campaign=business-qa'));
        assert.ok(lead.content.includes('Session: session_'));
      }
      const own = events.filter(e => e.content_id.startsWith('business:'));
      assert.ok(own.every(e => e.session_id && e.current_page_route === '/business'));
      assert.ok(own.every(e => e.current_page_url.includes('utm_campaign=business-qa') && !e.current_page_url.includes('email=')));
      assert.ok(own.every(e => ['page', 'menu_link'].includes(e.content_type)));
      assert.equal(count(`business:${lang}`, 'view'), 1, 'one page view despite interactions and strict effects');
      console.log(`PASS ${path}: view, 9 sectors, examples, cross-links, playback dedupe, attempts/conversions, retry, session/UTM attribution`);
      await context.close();
    }
    const page = await browser.newPage();
    const inbound = [];
    page.on('pageerror', error => console.error('Browser error:', error.message));
    await page.route('**/interactions/track', async route => {
      inbound.push(JSON.parse(route.request().postData()));
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });
    for (const [path, selector, id] of [
      ['/enterprise', 'a[href="/business"]', 'enterprise::business'],
      ['/', '#solutions a[href="/business"]', 'home-solution:business'],
    ]) {
      await page.goto(base + path, { waitUntil: 'load', timeout: 90000 });
      await page.waitForFunction(selector => {
        const link = document.querySelector(selector);
        return link && Object.keys(link).some(k => k.startsWith('__reactProps') && typeof link[k]?.onClick === 'function');
      }, selector);
      await page.evaluate(() => document.addEventListener('click', e => { if (e.target.closest('a')) e.preventDefault(); }, { capture: true }));
      await page.locator(selector).first().click();
      if (path === '/') await page.screenshot({ path: '/tmp/business-home-tracking.png' });
      for (let i = 0; i < 100 && !inbound.some(e => e.content_id === id); i++) await page.waitForTimeout(50);
      assert.equal(inbound.filter(e => e.content_id === id && e.action_type === 'click').length, 1, JSON.stringify({path, inbound}));
      console.log(`PASS inbound ${path}: ${id}`);
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
