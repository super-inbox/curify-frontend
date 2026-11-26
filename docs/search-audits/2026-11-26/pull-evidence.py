# Read-only reproduction; credentials are loaded from the existing private environment and never printed.
# Raw query strings and actor IDs are written only under /tmp with umask 077; do not commit those outputs.
import asyncio,json,ast,re,os
from pathlib import Path
from collections import Counter,defaultdict
from datetime import datetime,timedelta
from urllib.parse import urlparse
import asyncpg
os.umask(0o077)
ROOT=Path('/Users/qqwjq/curify-studio/curify_background')
url=next(l.split('=',1)[1].strip().strip('\"').strip("'") for l in (ROOT/'.env').read_text().splitlines() if l.startswith('DATABASE_URL=')).replace('+asyncpg','')
tree=ast.parse((ROOT/'app/crud/admin.py').read_text()); BOT=next(ast.literal_eval(n.value) for n in tree.body if isinstance(n,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='_BOT_UA_REGEX' for t in n.targets))
tree=ast.parse((ROOT/'app/constants/subscription_constants.py').read_text()); EMAILS=next(ast.literal_eval(n.value) for n in tree.body if isinstance(n,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='TEST_USERS' for t in n.targets))
START=datetime(2026,10,26,16);END=datetime(2026,11,25,16)
async def main():
 c=await asyncpg.connect(url,timeout=20)
 try:
  async with c.transaction(readonly=True):
   await c.execute("SET LOCAL statement_timeout='90s'")
   tests=set(r['user_id'] for r in await c.fetch('select user_id from "user" where lower(email)=any($1::text[])',EMAILS))|{155,1117,1267}
   sql="""WITH raw AS (
    select id,user_id,session_id,created_at,action_type::text action,content_type::text kind,content_id,current_page_url page,current_page_route route,referrer,
    coalesce('u:'||user_id::text,'s:'||session_id) who
    from user_interactions where created_at >= $1 and created_at < $2
    and (user_id is null or not(user_id=any($3::int[])))
    and not(coalesce(user_agent,'') ~* $4 or coalesce(user_agent,'') like '%Build/MMB29P%')
   ), eligible AS (select who from raw where who is not null group by who having count(*)>1),
   firstpv AS (select distinct on(who) who,route,referrer from raw where action='VIEW' and kind='PAGE' order by who,created_at),
   acted AS (select distinct who from raw where action not in('VIEW','VIDEO_PLAY')),
   clean AS (select raw.* from raw join eligible using(who) left join firstpv f using(who) left join acted a using(who)
    where not(coalesce(f.route,'') like '/carousel/%' and coalesce(f.referrer,'')='' and a.who is null))
   select id,user_id,session_id,who,created_at,action,kind,content_id,page,route from clean
    where action in('SEARCH','SEARCH_NORESULT','SEARCH_LOWRESULT') or (action in('CLICK','COPY','VIDEO_CLICK','GENERATE','REMIX','DOWNLOAD') and (route ~ '^(/[a-z]{2})?/(search|topics|tools|nano-template|nano-banana-pro-prompts)' or content_id='search-redirect')) order by created_at"""
   events=[dict(r) for r in await c.fetch(sql,START,END+timedelta(minutes=5),list(tests),BOT)]
   latest=await c.fetchval('select max(created_at) from user_interactions')
 finally: await c.close()
 Path('/private/tmp/curify-search-gap-20261126-raw.json').write_text(json.dumps(events,default=str))
 clicks=defaultdict(list)
 for r in events:
  if r['action'] not in ['SEARCH','SEARCH_NORESULT','SEARCH_LOWRESULT']:clicks[r['who']].append(r)
 def norm(q):return re.sub(r'\s+',' ',re.sub(r'\|(?:within|rw|n|paths)=[^|]*','',q or '')).strip().lower()
 def public(q):return bool(q) and len(q)<=110 and not re.search(r'https?://|www\.|@|file:|/users/|c:\\|\b\d{7,}\b',q,re.I)
 def is_card(c):return c['action'] in ['CLICK','COPY','VIDEO_CLICK'] and c['kind'] in ['NANO_INSPIRATION_EXAMPLE_GRID','NANO_INSPIRATION_TEMPLATE_CARD','NANO_GALLERY','NANO_INSPIRATION'] and c['content_id']!='search-redirect'
 def searchroute(r):return bool(re.match(r'^(/[a-z]{2})?/search(?:/|$|\?)',r['route'] or ''))
 searches=[]
 for r in events:
  if r['action'] not in ['SEARCH','SEARCH_NORESULT','SEARCH_LOWRESULT'] or r['created_at']>=END:continue
  q=norm(r['content_id']);m=re.search(r'\|within=([^|]*)',r['content_id'] or '')
  cs=[c for c in clicks[r['who']] if r['created_at']<=c['created_at']<=r['created_at']+timedelta(minutes=5)]
  r.update(query=q,public=public(q),within=m.group(1) if m else '',locale=(re.match(r'^/(zh|es|fr|de|ja|ko|hi|tr|ru)(?:/|$)',urlparse(r['page'] or '').path).group(1) if re.match(r'^/(zh|es|fr|de|ja|ko|hi|tr|ru)(?:/|$)',urlparse(r['page'] or '').path) else 'en'),card=any(is_card(c) and searchroute(c) for c in cs),broad_card=any(is_card(c) for c in cs),redirect=any(c['content_id']=='search-redirect' for c in cs),tool=any(c['kind']=='TOOL_CARD' for c in cs),chip=any(c['kind']=='TOPIC_CAPSULE' and c['content_id']!='search-redirect' for c in cs),targets=list({(c['kind'],c['content_id']) for c in cs if is_card(c) and searchroute(c)}))
  searches.append(r)
 out={'window_timezone':'Asia/Shanghai complete days','source_latest_utc':str(latest),'test_account_count':len(tests),'excluded_private_query_examples':True,'windows':{}}
 allrows=[]
 for label,start,end in [('current7',datetime(2026,11,18,16),END),('previous7',datetime(2026,11,11,16),datetime(2026,11,18,16)),('current30',START,END)]:
  rs=[r for r in searches if start<=r['created_at']<end];ss=[r for r in rs if r['action']=='SEARCH']; byq=defaultdict(list)
  for r in rs:byq[(r['query'],r['locale'],r['within'])].append(r)
  summary={'search_events':len(ss),'noresult_markers':sum(r['action']=='SEARCH_NORESULT' for r in rs),'lowresult_markers':sum(r['action']=='SEARCH_LOWRESULT' for r in rs),'search_actor_keys':len({r['who'] for r in ss}),'all_signal_actor_keys':len({r['who'] for r in rs}),'signed_in_search_accounts':len({r['user_id'] for r in ss if r['user_id']}),'search_sessions':len({r['session_id'] for r in ss if r['session_id']}),'distinct_query_locale_contexts':len(byq),'public_contexts':sum(public(k[0]) for k in byq),'privacy_exceptions':sum(not public(k[0]) for k in byq),'search_events_with_card':sum(r['card'] for r in ss),'search_events_with_broad_card':sum(r['broad_card'] for r in ss),'search_events_with_redirect':sum(r['redirect'] for r in ss),'search_events_with_tool':sum(r['tool'] for r in ss),'zero_card_query_contexts':sum(not any(r['card'] for r in v) for v in byq.values()),'by_locale':dict(Counter(r['locale'] for r in ss))}
  rows=[]
  for (q,locale,within),v in byq.items():
   if not public(q):continue
   rows.append({'query':q,'locale':locale,'within':within,'searches':sum(r['action']=='SEARCH' for r in v),'noresult':sum(r['action']=='SEARCH_NORESULT' for r in v),'lowresult':sum(r['action']=='SEARCH_LOWRESULT' for r in v),'actors':len({r['who'] for r in v}),'days':len({(r['created_at']+timedelta(hours=8)).date() for r in v}),'searches_with_card':sum(r['card'] and r['action']=='SEARCH' for r in v),'has_card':any(r['card'] for r in v),'has_broad_card':any(r['broad_card'] for r in v),'has_redirect':any(r['redirect'] for r in v),'has_tool':any(r['tool'] for r in v),'targets':list({tuple(t) for r in v for t in r['targets']})})
  rows.sort(key=lambda r:(-r['searches'],-r['actors'],r['query']))
  out['windows'][label]={'summary':summary,'queries':rows}
 Path('/private/tmp/curify-search-gap-20261126-aggregates.json').write_text(json.dumps(out,ensure_ascii=False,indent=2))
 print(json.dumps({k:v['summary'] for k,v in out['windows'].items()},ensure_ascii=False,indent=2))
 # Full queries remain private in /tmp; review and allowlist before publishing.
try:
 asyncio.run(main())
except Exception as e:
 print('DATA_ACCESS_FAILED',type(e).__name__)
 raise SystemExit(1)
