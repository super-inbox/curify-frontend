import { describe, it, expect, vi, afterEach } from 'vitest';
import { CREATION_TASKS, taskHref, taskForLocation, taskLang } from '../creation-tasks';
vi.mock('@/services/useTracking',()=>({trackEvent:vi.fn()}));
import { trackEvent } from '@/services/useTracking';
import { trackTaskStage } from '@/services/taskTracking';
afterEach(()=>{vi.unstubAllGlobals();vi.clearAllMocks();});
describe('creation task attribution',()=>{
 it('has six distinct executable entries with approved presets',()=>{
  expect(new Set(CREATION_TASKS.map(t=>t.id)).size).toBe(6);
  for(const task of CREATION_TASKS){const u=new URL(taskHref(task.id),'https://curify.ai');expect(taskForLocation(u.pathname,u.search)).toBe(task);expect(taskForLocation('/zh'+u.pathname,u.search)).toBe(task);}
 });
 it('rejects mismatched routes and arbitrary preset injection',()=>{
  expect(taskForLocation('/tools/photo-motion','?task=asl&example=asl-captioned')).toBeUndefined();
  expect(taskForLocation('/tools/photo-motion','?task=motion&example=untrusted')).toBeUndefined();
  expect(taskForLocation('/tools/photo-motion','')).toBeUndefined();
  expect(taskLang('ja')).toBe('en');
 });
 it('tracks only stable IDs and keeps arrival out of active clicks',()=>{
  vi.stubGlobal('window',{location:{pathname:'/zh/tools/photo-motion',search:'?task=motion&example=gentle-motion&email=secret@example.com'}});
  trackTaskStage('arrive');trackTaskStage('success');
  expect(trackEvent).toHaveBeenNthCalledWith(1,{contentId:'task:motion:gentle-motion:arrive',contentType:'page',actionType:'view'});
  expect(trackEvent).toHaveBeenNthCalledWith(2,{contentId:'task:motion:gentle-motion:success',contentType:'menu_link',actionType:'click'});
  expect(JSON.stringify(vi.mocked(trackEvent).mock.calls)).not.toContain('secret');
 });
});
