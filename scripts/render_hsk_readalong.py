"""Reproducible HSK reading video batch. Typography is deterministic, never OCR.
Usage: python scripts/render_hsk_readalong.py all --config CONFIG.json --output OUTPUT_DIR

Uses the established Azure female voice and authored passages, without importing
app startup code. Four paced reading pages, two sentences per page, plus glossary.
"""
from pathlib import Path
import argparse,concurrent.futures,hashlib,json,math,re,subprocess,time,urllib.request,wave,xml.sax.saxutils
from PIL import Image,ImageDraw,ImageFont
from dotenv import dotenv_values
ROOT=Path.cwd()/'output/hsk-readalong'
W,H=1080,1920
CJK='/System/Library/Fonts/Hiragino Sans GB.ttc'
LAT='/System/Library/Fonts/Supplemental/Arial.ttf'
BOLD='/System/Library/Fonts/Supplemental/Arial Bold.ttf'
INK='#203A39'; MUTED='#667874'; PAPER='#FBF7EF'
ACCENTS={'Chinese cities':'#BA5B42','Festivals':'#AB454C','Seasons':'#4C7863','Around the world':'#3D7485','Everyday connections':'#836447'}
OVERWRITE=False
CARDS=[]

def ft(size,cjk=False,bold=False):return ImageFont.truetype(CJK if cjk else BOLD if bold else LAT,size)
def text(d,xy,s,size=32,fill=INK,cjk=False,bold=False):d.text(xy,s,font=ft(size,cjk,bold),fill=fill)
def wrap(s,font,width,d):
 words=s.split(); out=[]; line=''
 for word in words:
  new=(line+' '+word).strip()
  if d.textlength(new,font=font)>width and line:out.append(line);line=word
  else:line=new
 if line:out.append(line)
 return out

def art(d,scene,accent):
 """Native vector-style spot illustrations; no text baked into decorative art."""
 x0,y0,x1,y1=80,320,1000,750
 d.rounded_rectangle((x0,y0,x1,y1),40,fill='#EFE8DB')
 d.ellipse((770,355,925,510),fill='#EAC787')
 d.line((130,698,950,698),fill='#D0C5B3',width=3)
 if scene=='beijing':
  for x,y,ww in [(200,490,230),(500,450,320)]:
   d.rectangle((x,y+60,x+ww,y+190),fill='#B86249')
   d.polygon([(x-35,y+60),(x+ww/2,y-40),(x+ww+35,y+60)],fill='#456260')
   for k in range(3):d.rectangle((x+30+k*(ww-50)/3,y+95,x+60+k*(ww-50)/3,y+190),fill='#F4DCAB')
 elif scene=='shanghai':
  for x,ht,ww in [(170,150,90),(290,235,100),(540,180,110),(685,300,90),(810,210,85)]:
   d.rounded_rectangle((x,690-ht,x+ww,690),8,fill=accent)
   for y in range(710-ht,650,35):d.line((x+20,y,x+ww-20,y),fill='#EAD8B4',width=4)
  d.line((460,390,460,690),fill=INK,width=12)
  for y,r in [(530,43),(445,25)]:d.ellipse((460-r,y-r,460+r,y+r),fill='#CD876C')
 elif scene in ['japan','france','kenya','canada','brazil','australia']:
  d.ellipse((350,380,680,710),fill='#B6D0CE',outline=accent,width=5)
  for delta in [40,100]:d.ellipse((350+delta,380,680-delta,710),outline=accent,width=3)
  for y in [455,545,635]:d.line((375,y,655,y),fill=accent,width=3)
  d.arc((180,410,850,680),185,350,fill=accent,width=5)
  d.polygon([(825,465),(880,430),(852,493),(845,472)],fill='#BC6750')
  if scene=='canada':d.polygon([(240,520),(265,550),(300,530),(284,567),(314,588),(269,589),(251,623),(243,586),(209,572),(235,561)],fill='#BE6846')
  if scene=='australia':
   for x in [820,860,900]:d.arc((x-50,580,x+65,740),180,290,fill='#F7F3E9',width=18)
 elif scene in ['spring','rain','autumn','snow']:
  if scene=='snow':
   d.ellipse((440,515,625,705),fill='#FCFCF8',outline='#B8C8C6',width=4)
   d.ellipse((468,415,600,548),fill='#FCFCF8',outline='#B8C8C6',width=4)
   d.rectangle((454,418,615,438),fill=accent); d.rectangle((487,367,582,424),fill=accent)
   for x in [510,558]:d.ellipse((x,460,x+8,468),fill=INK)
   d.polygon([(534,480),(580,490),(534,499)],fill='#C47A4A')
   for x,y in [(230,400),(800,520),(330,560),(740,395),(290,665)]:d.ellipse((x,y,x+12,y+12),fill='white')
  elif scene=='rain':
   d.pieslice((330,385,740,770),180,360,fill=accent)
   d.line((535,575,535,680),fill=INK,width=9);d.arc((485,640,540,700),0,180,fill=INK,width=9)
   for x,y in [(180,460),(250,570),(790,540),(880,625),(680,375)]:d.line((x,y,x-15,y+40),fill='#739898',width=5)
  else:
   d.line((540,475,540,695),fill='#8D7660',width=18)
   for x,y,r in [(440,465,85),(555,430,100),(650,488,80),(530,537,70)]:d.ellipse((x-r,y-r,x+r,y+r),fill='#AAC2A1' if scene=='spring' else '#D49761')
   if scene=='spring':
    for x,y in [(400,435),(540,390),(660,500),(550,560)]:d.ellipse((x,y,x+23,y+23),fill='#EAC1B7')
   else:
    for x,y in [(290,610),(760,650),(350,685)]:d.ellipse((x,y,x+35,y+18),fill='#BD784E')
 elif scene=='lantern':
  for x,y in [(220,410),(475,385),(730,430)]:
   d.line((x+65,345,x+65,y),fill=accent,width=4)
   d.rounded_rectangle((x,y,x+140,y+180),60,fill=accent)
   d.arc((x+25,y,x+110,y+180),0,360,fill='#EFBB7C',width=4)
   d.line((x+70,y+180,x+70,y+235),fill='#C9974C',width=6)
 elif scene=='boat':
  d.polygon([(230,580),(815,580),(730,675),(310,675)],fill=accent)
  d.line((785,585,832,510,865,525),fill=accent,width=20)
  for x in [350,475,600]:d.line((x,485,x+70,670),fill='#8C7861',width=8)
  for x in [150,370,590,810]:d.arc((x,680,x+210,725),0,180,fill='#6A9691',width=5)
 elif scene in ['call','room']:
  if scene=='call':
   for x,y in [(250,395),(600,450)]:
    d.rounded_rectangle((x,y,x+185,y+245),25,fill=accent)
    d.rounded_rectangle((x+13,y+18,x+172,y+210),13,fill='#F5E9D6')
    d.ellipse((x+57,y+58,x+122,y+123),fill='#B38970');d.arc((x+30,y+120,x+155,y+235),180,360,fill='#738F85',width=45)
  else:
   d.rectangle((260,430,510,625),fill='#ADC8C4');d.line((385,430,385,625),fill=PAPER,width=8)
   d.rounded_rectangle((540,560,850,665),20,fill=accent);d.rectangle((550,660,570,710),fill=INK);d.rectangle((820,660,840,710),fill=INK)
   d.rounded_rectangle((560,565,670,612),15,fill='#F7E4C4')
 elif scene=='food':
  d.ellipse((260,535,800,700),fill='#D8C8AE');d.pieslice((315,400,750,690),0,180,fill=accent)
  for x in [430,535,640]:d.arc((x,370,x+45,510),90,270,fill='#A9A694',width=5)
  d.line((730,415,840,625),fill='#937857',width=8);d.line((757,412,868,617),fill='#937857',width=8)
 elif scene=='parcel':
  d.polygon([(300,465),(620,420),(800,510),(490,560)],fill='#D9BB90')
  d.polygon([(300,465),(490,560),(490,710),(300,615)],fill='#B69670')
  d.polygon([(490,560),(800,510),(800,660),(490,710)],fill='#C8A677')
  d.line((460,445,645,534,645,680),fill='#F0DDAD',width=25)
 else:
  for x,y,col in [(220,405,accent),(535,520,'#DDAF84')]:
   d.rounded_rectangle((x,y,x+310,y+145),45,fill=col)
   d.polygon([(x+55,y+130),(x+55,y+175),(x+105,y+135)],fill=col)
   for xx in [x+85,x+150,x+215]:d.ellipse((xx,y+65,xx+15,y+80),fill=PAPER)

def header(c,page):
 im=Image.new('RGB',(W,H),PAPER);d=ImageDraw.Draw(im);accent=ACCENTS[c['category']]
 d.rounded_rectangle((65,58,240,111),22,fill=accent)
 text(d,(90,67),f'HSK {c["level"]}',30,fill='white',bold=True)
 text(d,(270,74),c['category'].upper(),23,fill=MUTED,bold=True)
 titlefont=ft(58,True)
 assert d.textlength(c['title_zh'],font=titlefont)<940
 d.text((75,152),c['title_zh'],font=titlefont,fill=INK)
 for i,line in enumerate(wrap(c['title_en'],ft(28),930,d)):text(d,(78,238+36*i),line,28,fill=MUTED)
 art(d,c['scene'],accent)
 d.line((80,1768,1000,1768),fill='#D8D9CF',width=2)
 text(d,(80,1800),'CURIFY  /  READ • LISTEN • REPEAT',22,fill=MUTED,bold=True)
 text(d,(900,1800),f'{page}/5',23,fill=MUTED)
 return im,d

def render_sentence(d,row,y,accent,n):
 text(d,(82,y),f'{n:02}',24,fill=accent,bold=True)
 chars=list(row['zh']);pys=re.findall(r'[^\W\d_]+',row['pinyin'],flags=re.UNICODE)
 assert sum('\u4e00'<=h<='\u9fff' for h in chars)==len(pys),row
 cells=[];i=0
 for ch in chars:
  if '\u4e00'<=ch<='\u9fff':p=pys[i];i+=1;cells.append((ch,p,max(57,d.textlength(p,font=ft(28))+10)))
  else:cells.append((ch,'',23))
 x=135;yy=y+12
 for ch,p,w in cells:
  if x+w>988:x=135;yy+=122
  if p:d.text((x+w/2,yy+30),p,font=ft(28),fill=accent,anchor='ms')
  d.text((x+w/2,yy+90),ch,font=ft(50,True),fill=INK,anchor='ms');x+=w
 yy+=122
 for line in wrap(row['en'],ft(27),845,d):
  text(d,(135,yy),line,27,fill=MUTED);yy+=36
 return yy

def pages(c):
 for p in range(4):
  im,d=header(c,p+1);accent=ACCENTS[c['category']]
  end1=render_sentence(d,c['lines'][p*2],830,accent,p*2+1)
  end2=render_sentence(d,c['lines'][p*2+1],1250,accent,p*2+2)
  assert end1<1210 and end2<1735,(c['id'],end1,end2)
  out=ROOT/'frames'/f'{c["id"]}-{p}.png';im.save(out)
  if p==0:im.save(ROOT/'cards'/f'{c["id"]}.png')
 im,d=header(c,5)
 text(d,(82,800),'生词 · Words to keep',38,cjk=True)
 for n,v in enumerate(c['vocab']):
  yy=905+n*185
  d.rounded_rectangle((80,yy-10,1000,yy+145),20,fill='#F0EADF')
  text(d,(105,yy+12),v['zh'],40,cjk=True)
  text(d,(450,yy+18),v['pinyin'],28,fill=ACCENTS[c['category']])
  text(d,(110,yy+85),v['en'],28,fill=MUTED)
 im.save(ROOT/'frames'/f'{c["id"]}-4.png')
 (ROOT/'narration'/f'{c["id"]}.txt').write_text(c['title_zh']+'。\n'+'\n'.join(r['zh'] for r in c['lines'])+'\n')

ENV=dotenv_values('/Users/qqwjq/curify-studio/curify_background/.env')
KEY=ENV.get('AZURE_AI_API_KEY');REGION=ENV.get('AZURE_AI_REGION') or 'westus2'
def tts(job):
 c,p=job;out=ROOT/'audio'/f'{c["id"]}-{p}.wav'
 if out.exists() and out.stat().st_size>1000:return out
 lines=([c['title_zh']+'。'] if p==0 else [])+[r['zh'] for r in c['lines'][2*p:2*p+2]]
 body="<break time='600ms'/>".join(xml.sax.saxutils.escape(s) for s in lines)
 ssml=("<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xmlns:mstts='https://www.w3.org/2001/mstts' xml:lang='zh-CN'>"
       "<voice name='zh-CN-XiaoxiaoNeural'><mstts:express-as style='gentle'><prosody rate='-25%' pitch='-2%'>"+body+"</prosody></mstts:express-as><break time='700ms'/></voice></speak>")
 req=urllib.request.Request(f'https://{REGION}.tts.speech.microsoft.com/cognitiveservices/v1',data=ssml.encode(),headers={'Ocp-Apim-Subscription-Key':KEY,'Content-Type':'application/ssml+xml','X-Microsoft-OutputFormat':'riff-24khz-16bit-mono-pcm','User-Agent':'curify-hsk-reading'})
 for attempt in range(4):
  try:
   with urllib.request.urlopen(req,timeout=60) as response:data=response.read()
   assert data[:4]==b'RIFF' and len(data)>1000,'Empty or invalid speech response'
   out.write_bytes(data)
   print(f'AUDIO {c["id"]} {p+1}/4',flush=True);return out
  except Exception:
   if attempt==3:raise
   time.sleep(2*(attempt+1))

def duration(wav):
 with wave.open(str(wav),'rb') as w:return w.getnframes()/w.getframerate()
def stamp(t):
 ms=round(t*1000);return f'{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02},{ms%1000:03}'
def render_video(c):
 out=ROOT/'video'/f'{c["id"]}.mp4'
 if out.exists() and not OVERWRITE:return str(out)
 durations=[duration(ROOT/'audio'/f'{c["id"]}-{p}.wav') for p in range(4)]+[6.0]
 cmd=['ffmpeg','-hide_banner','-loglevel','error','-y','-threads','2']
 for p,dur in enumerate(durations):cmd+=['-loop','1','-framerate','25','-t',str(dur),'-i',str(ROOT/'frames'/f'{c["id"]}-{p}.png')]
 for p in range(4):cmd+=['-i',str(ROOT/'audio'/f'{c["id"]}-{p}.wav')]
 cmd+=['-f','lavfi','-t','6','-i','anullsrc=r=24000:cl=mono']
 fc=[]
 # Very gentle 1% movement; all authored text is kept inside wide safe margins.
 for p in range(5):fc.append(f"[{p}:v]scale=1080:1920,zoompan=z='1+0.01*min(on/{max(1,int(durations[p]*25))},1)':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=1:s=1080x1920:fps=25,setsar=1,setpts=PTS-STARTPTS[v{p}]")
 for p in range(4):fc.append(f'[{p+5}:a]aresample=24000,asetpts=PTS-STARTPTS[a{p}]')
 fc.append('[9:a]asetpts=PTS-STARTPTS[a4]')
 fc.append(''.join(f'[v{p}][a{p}]' for p in range(5))+'concat=n=5:v=1:a=1[v][a]')
 cmd+=['-filter_complex_threads','1','-filter_complex',';'.join(fc),'-map','[v]','-map','[a]','-c:v','libx264','-threads','2','-preset','fast','-crf','22','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k','-movflags','+faststart',str(out)]
 subprocess.run(cmd,check=True,capture_output=True)
 start=0;srt=[]
 for p,dur in enumerate(durations):
  caption='\n'.join(r['zh'] for r in c['lines'][p*2:p*2+2]) if p<4 else '生词复习 · Vocabulary review'
  srt.append(f'{p+1}\n{stamp(start)} --> {stamp(start+dur)}\n{caption}\n');start+=dur
 (ROOT/'subtitles'/f'{c["id"]}.srt').write_text('\n'.join(srt))
 with wave.open(str(ROOT/'narration'/f'{c["id"]}.wav'),'wb') as dest:
  dest.setnchannels(1);dest.setsampwidth(2);dest.setframerate(24000)
  for p in range(4):
   with wave.open(str(ROOT/'audio'/f'{c["id"]}-{p}.wav'),'rb') as src:dest.writeframes(src.readframes(src.getnframes()))
 print(f'VIDEO {c["id"]} {start:.1f}s',flush=True)
 return str(out)

def main():
 ap=argparse.ArgumentParser();ap.add_argument('mode',choices=['pages','audio','video','all']);ap.add_argument('--config',type=Path,required=True);ap.add_argument('--output',type=Path,required=True);ap.add_argument('--only');ap.add_argument('--overwrite',action='store_true');args=ap.parse_args()
 global OVERWRITE,ROOT,CARDS
 OVERWRITE=args.overwrite
 ROOT=args.output.resolve()
 CARDS=json.loads(args.config.read_text())
 for folder in ['cards','frames','audio','video','narration','subtitles','work']:(ROOT/folder).mkdir(parents=True,exist_ok=True)
 cards=[c for c in CARDS if not args.only or args.only in c['id']]
 if args.mode in ['pages','all']:
  for c in cards:pages(c)
  print(f'PAGES {len(cards)*5} verified for layout bounds',flush=True)
 if args.mode in ['audio','all']:
  assert KEY,'Azure voice key unavailable'
  with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:list(ex.map(tts,[(c,p) for c in cards for p in range(4)]))
 if args.mode in ['video','all']:
  with concurrent.futures.ThreadPoolExecutor(max_workers=2) as ex:list(ex.map(render_video,cards))
if __name__=='__main__':main()
