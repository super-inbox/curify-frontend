'use client';
import { useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { useAtomValue } from 'jotai';
import { userAtom } from '@/app/atoms/atoms';
import { apiClient } from '@/services/api';
import { creditsToDollars } from '@/lib/pricing';
import { trackTaskStage, rememberTaskProject, trackTaskProject } from '@/services/taskTracking';
import ReferenceImageUpload from './ReferenceImageUpload';
import TaskEntryContext from './TaskEntryContext';
import { Link } from '@/i18n/navigation';
type Status = {status: string; result_url?: string; download_url?: string; completed_shots?: number; total_shots?: number; message?: string; plan?: {label: string; seconds: number}[]; resolved_music?: string; music_reason?: string};
type Capabilities = {available: boolean; modes?: {motion: boolean; souvenir: boolean}; credits_per_shot: number; souvenir_credits: number; destination_scripts?: Record<string,{version: string; duration_seconds: number; shots: number; credits: number; scenes: string[]}>};
const destinations = [['kyoto','Kyoto','京都'],['tengwangge','Tengwang Pavilion','滕王阁'],['bali','Bali','巴厘岛'],['dubai','Dubai','迪拜'],['granada','Granada','格拉纳达']];
export default function CreativeVideoForm({mode}: {mode: 'motion' | 'souvenir'}) {
  const locale = useLocale(); const zh = locale === 'zh'; const t = (en:string, cn:string) => zh ? cn : en;
  const user = useAtomValue(userAtom); const owner = user?.user_id;
  const [caps,setCaps] = useState<Capabilities>(); const [images,setImages] = useState<(string|null)[]>([null]);
  const [uploading,setUploading] = useState<Record<number,boolean>>({}); const [destination,setDestination] = useState('kyoto');
  const [pace,setPace] = useState('gentle'); const [music,setMusic] = useState('auto'); const [orientation,setOrientation] = useState('portrait');
  const [consent,setConsent] = useState(false); const [project,setProject] = useState(''); const [status,setStatus] = useState<Status>();
  const [busy,setBusy] = useState(false); const [error,setError] = useState(''); const lock = useRef(false);
  const available = caps?.available && (caps.modes?.[mode] ?? true);
  const key = owner ? `creative-video:${owner}:${mode}` : null;
  useEffect(() => { let live=true; apiClient.request<Capabilities>('/creative-video/capabilities').then(c=>{if(live)setCaps(c);}).catch(()=>{if(live)setCaps({available:false,credits_per_shot:0,souvenir_credits:0});}); return()=>{live=false;}; },[]);
  useEffect(()=>{setProject(key ? sessionStorage.getItem(key)||'' : '');setStatus(undefined);setImages([null]);},[key]);
  useEffect(()=>{
    if(!project || !owner)return; let live=true; let timer:ReturnType<typeof setTimeout>; let last=''; let failures=0;
    const poll=async()=>{try {
      const next=await apiClient.request<Status>(`/creative-video/status/${encodeURIComponent(project)}`); if(!live)return;
      failures=0;setStatus(next);setError('');
      if(next.status!==last){last=next.status;if(next.status==='completed')trackTaskProject(project,'success');else if(next.status==='pending')trackTaskStage('pending');else if(['failed','review_required'].includes(next.status))trackTaskStage('error');}
      if(['queued','rendering'].includes(next.status))timer=setTimeout(poll,5000);
    }catch{if(!live)return;setError(t('Status unavailable. Your project is saved; refresh to reconnect.','暂时无法获取状态。项目已保存，可刷新重连。'));if(++failures<6)timer=setTimeout(poll,10000);}};
    void poll();return()=>{live=false;clearTimeout(timer);};
  // Restart polling after an explicit resume.
  },[project,owner,busy]);
  const files=images.filter((x):x is string=>!!x); const script=caps?.destination_scripts?.[destination]; const shots=mode==='souvenir'?(script?.shots ?? 0):files.length; const duration=mode==='souvenir'?(script?.duration_seconds ?? 0):files.length*6;
  const cost=caps ? mode==='souvenir'?(script?.credits ?? 0):caps.credits_per_shot*files.length : 0;
  async function start(resume=false){
    if(lock.current)return;lock.current=true;setBusy(true);setError('');trackTaskStage(resume?'resume':'attempt');
    try{const result=await apiClient.request<{project_id:string}>(resume?`/creative-video/resume/${encodeURIComponent(project)}`:'/creative-video/generate',{method:'POST',...(resume?{}:{body:JSON.stringify({mode,images:files,destination,pace,music,orientation,consent})})});
      if(!resume)rememberTaskProject(result.project_id);
      if(key)sessionStorage.setItem(key,result.project_id);setProject(result.project_id);setStatus({status:'queued'});if(!resume)trackTaskStage('accepted');
    }catch(e){const message=e instanceof Error?e.message:'';setError(message.includes('402')?t('Not enough credits. Add credits and resume the saved project.','积分不足。补充积分后可继续已保存的项目。'):t('Could not start. Your inputs are retained. Please try again.','暂时无法开始，输入已保留，请重试。'));trackTaskStage('error');}
    finally{lock.current=false;setBusy(false);}
  }
  const control='rounded-lg border p-3 bg-white w-full';
  return <div id="reproduce" className="mx-auto max-w-3xl space-y-6 rounded-2xl border bg-white p-6">
    <TaskEntryContext slug={mode==='motion'?'photo-motion':'travel-souvenir-video'} locale={locale}/>
    {!available && <p role="status" className="rounded-lg bg-amber-50 p-4">{t('Preview: generation is not available on this server yet.','功能预览：当前服务器尚未开放生成。')}</p>}
    <p>{mode==='motion'?t('Upload 1–4 photos. AI considers all photos together, plans a camera move for each and selects music. Each photo contributes six seconds, in upload order.','上传 1–4 张照片，AI 综合分析多图，为每张规划运镜并选择配乐。每张约 6 秒，按上传顺序组合。'):t('Upload one adult portrait and choose a destination. Each destination uses its own story, scenes and costume references, with your likeness throughout.','上传一张成年人肖像，选择目的地。五个目的地分别使用自己的故事脚本、场景与服装参考，由你的肖像贯穿全片。')}</p>
    {!project ? <>
      <div className="grid gap-4 sm:grid-cols-2">{images.map((value,i)=><ReferenceImageUpload imageUploadEndpoint="/creative-video/upload" key={`${owner}:${i}`} required label={t(`Photo ${i+1}`,`照片 ${i+1}`)} onChange={url=>{setImages(prev=>prev.map((v,n)=>n===i?url:v));}} onUploadingChange={v=>setUploading(prev=>({...prev,[i]:v}))}/>)}</div>
      {mode==='motion' && images.length<4 && <button onClick={()=>setImages([...images,null])} className={control}>{t('Add another photo','添加照片')}</button>}
      <div className="grid gap-4 sm:grid-cols-2">
        {mode==='souvenir' && <label>{t('Destination','目的地')}<select className={control} value={destination} onChange={e=>setDestination(e.target.value)}>{destinations.map(d=><option key={d[0]} value={d[0]}>{d[zh?2:1]}</option>)}</select></label>}
        {mode==='motion' && <label>{t('Camera movement','运镜节奏')}<select className={control} value={pace} onChange={e=>setPace(e.target.value)}><option value="gentle">{t('Gentle','舒缓')}</option><option value="dynamic">{t('Dynamic','动感')}</option></select></label>}
        <label>{t('Music','配乐')}<select className={control} value={music} onChange={e=>setMusic(e.target.value)}><option value="auto">{t('Automatic selection','自动选配')}</option><option value="none">{t('No music','无配乐')}</option><option value="calm">{t('Calm','舒缓')}</option><option value="piano">{t('Piano','钢琴')}</option></select></label>
        <label>{t('Format','画幅')}<select className={control} value={orientation} onChange={e=>setOrientation(e.target.value)}><option value="portrait">9:16</option><option value="landscape">16:9</option></select></label>
      </div>
      <div className="rounded-lg bg-neutral-50 p-4 text-sm">
        <p>{mode==='souvenir' ? t(`Destination story · ${shots} scenes · ${duration}s`, `目的地故事 · ${shots} 个场景 · ${duration} 秒`) : t(`Photo-aware camera planning · about ${duration}s`, `多图内容运镜规划 · 约 ${duration} 秒`)}</p>
        {mode==='souvenir' && script && <ol className="mt-2 list-decimal space-y-1 pl-5">{script.scenes.map((scene,i)=><li key={i}>{scene}</li>)}</ol>}
        <p className="mt-2">{mode==='motion' ? t(`${caps?.credits_per_shot ?? 0} credits per photo; planning included.`, `每张照片 ${caps?.credits_per_shot ?? 0} 积分，包含运镜与配乐规划。`) : t('One fixed price for the complete destination film, including scene images, video generation and editing.', '完整目的地短片统一价，包含场景图、视频生成与剪辑。')}</p>
      </div>
      {caps && cost > 0 && <p className="text-sm text-neutral-600">{t(`At standard top-up rates: US$${creditsToDollars(cost).toFixed(2)} equivalent.`, `按直接充值单价折合 US$${creditsToDollars(cost).toFixed(2)}。`)}</p>}
      <p className="text-sm text-neutral-600">{t('AI may alter faces, objects and architecture. Review the result. Credits are charged when the finished video is delivered.','AI 可能改变人脸、物体与建筑细节，请检查结果。完成视频交付时扣除积分。')}</p>
      <label className="flex gap-3"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/>{t('I have permission to use these photos and the likeness of any depicted adults.','我有权使用这些照片及其中成年人的肖像。')}</label>
      <button className="rounded-full bg-purple-700 px-6 py-3 text-white disabled:opacity-40" disabled={!available||(mode==='souvenir'&&!script)||!owner||!files.length||!consent||busy||Object.values(uploading).some(Boolean)} onClick={()=>void start()}>{busy?t('Starting…','正在开始…'):t(`Create video · ${cost} credits`,`生成视频 · ${cost} 积分`)}</button>
    </> : <div className="space-y-4" aria-live="polite">
      <p>{t('Project','项目')}: <code className="break-all">{project}</code></p><p>{status?.status} · {status?.completed_shots||0}/{status?.total_shots||shots}</p>
      {status?.plan?.some(shot=>shot.label) && <ol className="list-decimal space-y-1 pl-5">{status.plan.map((shot,i)=><li key={i}>{shot.label} · {Number(shot.seconds.toFixed(2))}s</li>)}</ol>}
      {status?.resolved_music && <p>{t('Selected music','已选配乐')}: {status.resolved_music}{status.music_reason ? ` · ${status.music_reason}` : ''}</p>}
      {status?.message && <p>{status.message}</p>}
      {status?.status==='completed' && status.result_url && <><video controls playsInline src={status.result_url} className="max-h-[600px] w-full"/><a href={status.download_url || status.result_url} download onClick={()=>trackTaskProject(project,'download')} className="block text-purple-700">{t('Download video','下载视频')} →</a></>}
      {['pending','awaiting_credits'].includes(status?.status||'') && <button className={control} disabled={busy} onClick={()=>void start(true)}>{t('Resume saved project','继续已保存的项目')}</button>}
      {['completed','failed'].includes(status?.status||'') && <button className={control} onClick={()=>{if(key)sessionStorage.removeItem(key);setProject('');setStatus(undefined);}}>{t('Make another video','制作另一条视频')}</button>}
    </div>}
    {error && <p role="alert">{error} <Link href="/pricing" className="underline">{t('Credits & plans','积分与套餐')}</Link></p>}
  </div>;
}
