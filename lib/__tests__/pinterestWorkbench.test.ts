// @vitest-environment jsdom
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
const h=vi.hoisted(()=>({event:vi.fn(),action:vi.fn(),generate:vi.fn(),clipboard:vi.fn()}));
vi.mock('next-intl',()=>({useTranslations:()=> (key:string)=>key}));
vi.mock('next/link',()=>({default:({children,...props}:any)=>React.createElement('a',props,children)}));
vi.mock('jotai',async(importOriginal)=>({...await importOriginal<typeof import('jotai')>(),useAtom:()=>[null,vi.fn()]}));
vi.mock('@/services/useTracking',()=>({trackEvent:h.event,useTracking:()=>({track:h.event,trackAction:h.action})}));
vi.mock('@/services/useDirectGenerate',()=>({useDirectGenerate:()=>({generate:h.generate,clearWarning:vi.fn(),dismissAndGenerate:vi.fn(),isGenerating:false,duplicateWarning:null})}));
vi.mock('@/services/useFreeformGenerate',()=>({useFreeformGenerate:()=>({generate:vi.fn(),isGenerating:false})}));
vi.mock('@/lib/template_workflows',()=>({getTemplateWorkflows:()=>[],videoShowWorkflow:()=>({key:'video'}),packPdfWorkflow:()=>({key:'pack-pdf'})}));
vi.mock('@/lib/template_packs',()=>({getPackTiers:()=>[]}));
import ReproduceWorkbench from '@/app/[locale]/_components/ReproduceWorkbench';
const props={locale:'en',templateId:'template-test',parameters:[{name:'subject',label:'Subject',type:'text' as const,description:'Subject'}],initialParams:{subject:'cat'},basePrompt:'Draw {{subject}}',allowGeneration:true,trackingContentId:'template-test:cat',col1:{mode:'source' as const,image:React.createElement('img',{alt:'source',src:'/source.png'}),sourceReferenceUrl:'/source.png',copyText:'Draw cat',shareUrl:'/example/cat',title:'Cat'}};
beforeEach(()=>{vi.clearAllMocks();vi.stubGlobal('React',React);Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:h.clipboard.mockResolvedValue(undefined)}});});
afterEach(()=>{cleanup();vi.unstubAllGlobals();});
describe('mobile workbench entry',()=>{
 it('links directly to the parameter area without generating or signing in',()=>{
  render(React.createElement(ReproduceWorkbench,props));
  const entry=screen.getByRole('link',{name:'remixThis'});
  expect(entry.getAttribute('href')).toBe('#customize');expect(document.querySelector('#customize')).not.toBeNull();
  fireEvent.click(entry);expect(h.generate).not.toHaveBeenCalled();
  expect(h.event).toHaveBeenCalledWith(expect.objectContaining({contentId:'generation:entry_click:template-test:cat'}));
 });
 it('records one edit milestone, without recording parameter values',()=>{
  render(React.createElement(ReproduceWorkbench,props));
  const input=screen.getByDisplayValue('cat');fireEvent.change(input,{target:{value:'private dog'}});fireEvent.change(input,{target:{value:'private rabbit'}});
  const edits=h.event.mock.calls.filter(([e])=>e.contentId.includes('params_edit'));expect(edits).toHaveLength(1);
  expect(JSON.stringify(edits)).not.toContain('private');
 });
 it('records prompt copying as copy, never as a generation',async()=>{
  render(React.createElement(ReproduceWorkbench,{...props,allowGeneration:false}));
  expect(screen.queryByRole('link',{name:'remixThis'})).toBeNull();
  fireEvent.click(screen.getByRole('button',{name:'copyPrompt'}));
  await waitFor(()=>expect(h.action).toHaveBeenCalledWith(expect.anything(),'copy'));
  expect(h.generate).not.toHaveBeenCalled();expect(h.action).not.toHaveBeenCalledWith(expect.anything(),'generate');
 });
});
