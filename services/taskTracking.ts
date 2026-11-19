import { creationTask, taskForLocation } from '@/lib/creation-tasks';
import { trackEvent } from './useTracking';
/** Stable event IDs only. Never include input URLs, prompts, emails or file names. */
export function trackTaskStage(stage: 'arrive' | 'upload' | 'attempt' | 'accepted' | 'success' | 'error' | 'download' | 'pending' | 'resume') {
  if (typeof window === 'undefined') return;
  const task = taskForLocation(window.location.pathname, window.location.search);
  if (!task) return;
  trackEvent({ contentId: `task:${task.id}:${task.example}:${stage}`, contentType: stage === 'arrive' ? 'page' : 'menu_link', actionType: stage === 'arrive' ? 'view' : stage === 'download' ? 'download' : 'click' });
}

// Persist only fixed task IDs against a project, scoped to the signed-in account.
function projectKey(projectId: string) {
  try { const user=JSON.parse(localStorage.getItem('curifyUser') || 'null'); return user?.user_id ? `task-project:${user.user_id}:${projectId}` : null; } catch { return null; }
}
export function rememberTaskProject(projectId: string) {
  const task=taskForLocation(window.location.pathname, window.location.search); const key=projectKey(projectId);
  if(task && key) sessionStorage.setItem(key,JSON.stringify({id:task.id,example:task.example,stages:[]}));
}
export function trackTaskProject(projectId: string, stage: 'success' | 'error' | 'download') {
  const key=projectKey(projectId);if(!key)return;
  try { const saved=JSON.parse(sessionStorage.getItem(key)||'null');if(!saved)return;
    const preset=creationTask(saved.id);
    const slug=saved.id==='product' && saved.example==='product-video'?'product-video':preset?.slug;
    const task=taskForLocation(`/tools/${slug}`,`?task=${saved.id}&example=${saved.example}`);
    if(!task || saved.stages.includes(stage))return;
    trackEvent({contentId:`task:${task.id}:${task.example}:${stage}`,contentType:'menu_link',actionType:stage==='download'?'download':'click'});
    sessionStorage.setItem(key,JSON.stringify({...saved,stages:[...saved.stages,stage]}));
  }catch{/* Tracking must never block a result. */}
}
