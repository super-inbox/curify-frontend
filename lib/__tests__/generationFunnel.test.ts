// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, renderHook } from '@testing-library/react';
const h = vi.hoisted(() => ({
  user: null as null | {non_expiring_credits:number},
  drawer: vi.fn(), modal: vi.fn(), topup: vi.fn(), event: vi.fn(), action: vi.fn(),
  freeform: vi.fn(), status: vi.fn(), request: vi.fn(), poll: vi.fn(), duplicate: vi.fn(), first: vi.fn(), awaiting: vi.fn(),
}));
vi.mock('jotai', () => ({ useAtom: (atom: string) => atom === 'user' ? [h.user, vi.fn()] : [null, atom === 'drawer' ? h.drawer : atom === 'modal' ? h.modal : h.topup] }));
vi.mock('@/app/atoms/atoms', () => ({ userAtom:'user',drawerAtom:'drawer',modalAtom:'modal',topUpContextAtom:'topup' }));
vi.mock('next-intl', () => ({useTranslations: () => (key:string) => key}));
vi.mock('@/services/useTracking', () => ({trackEvent:h.event,useTracking:()=>({track:h.event,trackAction:h.action})}));
vi.mock('@/services/nanoGenerate', () => ({nanoGenerateService:{generate:h.request,getProjectStatus:h.status}}));
vi.mock('@/services/freeformGenerate',()=>({freeformGenerateService:{generate:h.freeform}}));
vi.mock('@/services/pollNanoResult', () => ({pollNanoResult:h.poll,NanoGenerationError:class extends Error{}}));
vi.mock('@/lib/editDistance', () => ({findDuplicate:h.duplicate}));
vi.mock('@/services/funnelEvents', () => ({trackFirstGeneration:h.first}));
vi.mock('@/lib/awaitingCredits', () => ({navigateToAwaitingCredits:h.awaiting,isAwaitingCredits:()=>false,AwaitingCreditsError:class extends Error{}}));
import { useFreeformGenerate } from '@/services/useFreeformGenerate';
import { useDirectGenerate } from '@/services/useDirectGenerate';
import { trackGenerationStage, useGenerationExposure } from '@/services/generationFunnel';
const target='template-test:example-test';
const stages=()=>h.event.mock.calls.map(([e])=>e.contentId).filter((id:string)=>id.startsWith('generation:')).map((id:string)=>id.split(':')[1]);
const setup=()=>{
 const onSuccess=vi.fn(),onReusedExisting=vi.fn();
 const hook=renderHook(()=>useDirectGenerate({templateId:'template-test',params:{subject:'cat'},tracking:{contentId:target,contentType:'nano_inspiration_reproduce_section'},onSuccess,onReusedExisting}));
 return {...hook,onSuccess,onReusedExisting};
};
beforeEach(()=>{
 vi.clearAllMocks(); h.user=null;h.duplicate.mockReturnValue(null);h.awaiting.mockReturnValue(false);
 h.request.mockResolvedValue({success:true,signed_url:'https://cdn.example/result.png'});
 vi.stubGlobal('alert',vi.fn());
});
afterEach(()=>{cleanup();vi.unstubAllGlobals();});
describe('generation funnel lifecycle',()=>{
 it('records anonymous intent and auth gate without recording a request',async()=>{
  const {result}=setup();await act(async()=>{await result.current.generate();});
  expect(stages()).toEqual(['attempt','auth_required']);expect(h.drawer).toHaveBeenCalledWith('signin');expect(h.request).not.toHaveBeenCalled();
 });
 it('resumes once after login, preserving params and not double-counting intent',async()=>{
  const {result,rerender,onSuccess}=setup();await act(async()=>{await result.current.generate();});
  h.user={non_expiring_credits:100};await act(async()=>{rerender();});
  expect(stages()).toEqual(['attempt','auth_required','auth_resumed','request','success']);
  expect(h.request).toHaveBeenCalledTimes(1);expect(h.request.mock.calls[0][0].params).toEqual({subject:'cat'});expect(onSuccess).toHaveBeenCalledTimes(1);
  rerender();expect(h.request).toHaveBeenCalledTimes(1);
 });
 it('records a credit gate separately from a network failure',async()=>{
  h.user={non_expiring_credits:0};const {result}=setup();await act(async()=>{await result.current.generate();});
  expect(stages()).toEqual(['attempt','credits_required']);expect(h.request).not.toHaveBeenCalled();expect(h.modal).toHaveBeenCalledWith('topup');
 });
 it('distinguishes an existing image from newly generated output',async()=>{
  h.user={non_expiring_credits:100};h.duplicate.mockReturnValue({exampleId:'existing',score:1,imageUrl:'https://cdn.example/existing.png'});
  const {result,onReusedExisting,onSuccess}=setup();await act(async()=>{await result.current.generate();});
  expect(stages()).toEqual(['attempt','duplicate','reused']);expect(h.request).not.toHaveBeenCalled();expect(onSuccess).not.toHaveBeenCalled();expect(onReusedExisting).toHaveBeenCalledTimes(1);
 });
 it('records a rejected generation as failure, never success',async()=>{
  h.user={non_expiring_credits:100};h.request.mockRejectedValue(new Error('network'));
  const {result,onSuccess}=setup();await act(async()=>{await result.current.generate();});
  expect(stages()).toEqual(['attempt','request','failure']);expect(onSuccess).not.toHaveBeenCalled();
 });
 it('waits for async rendering and blocks duplicate in-flight requests',async()=>{
  h.user={non_expiring_credits:100};h.request.mockResolvedValue({success:true,project_id:'project'});
  let complete!:(value:string)=>void;h.poll.mockImplementation(()=>new Promise<string>(resolve=>{complete=resolve;}));
  const {result,onSuccess}=setup();let pending!:Promise<void>;
  await act(async()=>{pending=result.current.generate();});
  expect(stages()).toEqual(['attempt','request']);expect(onSuccess).not.toHaveBeenCalled();
  await act(async()=>{await result.current.generate();});expect(h.request).toHaveBeenCalledTimes(1);
  await act(async()=>{complete('https://cdn.example/done.png');await pending;});
  expect(stages()).toEqual(['attempt','request','success']);expect(onSuccess).toHaveBeenCalledTimes(1);
 });
 it('uses accepted backend enums and bounds event IDs',()=>{
  trackGenerationStage('attempt','x'.repeat(300));
  expect(h.event.mock.calls[0][0]).toMatchObject({contentType:'menu_link',actionType:'click'});
  expect(h.event.mock.calls[0][0].contentId).toHaveLength(255);
 });
 it('counts exposure only when actually visible, once per target',()=>{
  let callback!:(entries:unknown[])=>void;const disconnect=vi.fn();
  vi.stubGlobal('IntersectionObserver',class {constructor(cb:typeof callback){callback=cb;} observe(){} disconnect=disconnect;});
  const {result,rerender}=renderHook(({enabled})=>useGenerationExposure<HTMLButtonElement>('cta_view',target,enabled),{initialProps:{enabled:false}});
  result.current.current=document.createElement('button');rerender({enabled:true});
  callback([{isIntersecting:false,intersectionRatio:0}]);expect(h.event).not.toHaveBeenCalled();
  callback([{isIntersecting:true,intersectionRatio:1}]);callback([{isIntersecting:true,intersectionRatio:1}]);
  expect(stages()).toEqual(['cta_view']);expect(disconnect).toHaveBeenCalled();
 });
});

describe('output format generation funnel',()=>{
 const tracking={contentId:'workflow-social:template-test',contentType:'nano_inspiration_reproduce_section' as const};
 it('resumes the same output-format request after signin and records completion',async()=>{
  h.freeform.mockResolvedValue({success:true,project_id:'format-project'});
  h.status.mockResolvedValue({status:'COMPLETED',result_url:'https://cdn.example/format.png'});
  const onSuccess=vi.fn();const {result,rerender}=renderHook(()=>useFreeformGenerate({tracking,onSuccess}));
  await act(async()=>{await result.current.generate({prompt:'private prompt',referenceImageUrl:'https://cdn.example/input.png',tracking});});
  expect(stages()).toEqual(['attempt','auth_required']);
  h.user={non_expiring_credits:100};await act(async()=>{rerender();});
  expect(stages()).toEqual(['attempt','auth_required','auth_resumed','request']);
  await act(async()=>{await new Promise(resolve=>setTimeout(resolve,1600));});
  expect(stages()).toEqual(['attempt','auth_required','auth_resumed','request','success']);
  expect(h.freeform).toHaveBeenCalledExactlyOnceWith({prompt:'private prompt',reference_image_url:'https://cdn.example/input.png'});
  expect(onSuccess).toHaveBeenCalledTimes(1);expect(JSON.stringify(h.event.mock.calls)).not.toContain('private prompt');
 });
 it('records server-side credit rejection without a false completion',async()=>{
  h.user={non_expiring_credits:100};h.freeform.mockResolvedValue({success:false,message:'Insufficient credits'});
  const onInsufficientCredits=vi.fn();const {result}=renderHook(()=>useFreeformGenerate({tracking,onInsufficientCredits}));
  await act(async()=>{await result.current.generate({prompt:'draw'});});
  expect(stages()).toEqual(['attempt','request','credits_required']);expect(onInsufficientCredits).toHaveBeenCalledTimes(1);
 });
 it('records output-format request errors',async()=>{
  h.user={non_expiring_credits:100};h.freeform.mockRejectedValue(new Error('network'));
  const {result}=renderHook(()=>useFreeformGenerate({tracking}));
  await act(async()=>{await result.current.generate({prompt:'draw'});});
  expect(stages()).toEqual(['attempt','request','failure']);
 });
});
