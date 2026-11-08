// @vitest-environment jsdom
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import PackagingMockupForm from '../../app/[locale]/_components/PackagingMockupForm';
const mock = vi.hoisted(() => ({ user: {user_id: 1} as object | null, uploadProps: {} as any, setModal: vi.fn(), setDrawer: vi.fn(), setContext: vi.fn(), track: vi.fn(), start: vi.fn(), submit: vi.fn(), state: {phase:'idle',error:null,resultUrl:null,busy:false} as any }));
vi.mock('@/app/atoms/atoms', () => ({userAtom:'user',modalAtom:'modal',drawerAtom:'drawer',topUpContextAtom:'context'}));
vi.mock('jotai', () => ({useAtomValue:()=>mock.user,useSetAtom:(atom:string)=>atom==='modal'?mock.setModal:atom==='context'?mock.setContext:mock.setDrawer}));
vi.mock('@/services/useTracking',()=>({trackEvent:mock.track}));
vi.mock('@/services/useFactoryExport',()=>({useFactoryExport:()=>({...mock.state,start:mock.start})}));
vi.mock('@/services/factoryExport',()=>({PACKAGING_MOCKUP_CREDITS:15,factoryExportService:{packagingMockup:mock.submit}}));
vi.mock('@/app/[locale]/_components/ReferenceImageUpload',()=>({default:(props:any)=>{mock.uploadProps=props;return React.createElement('button',{onClick:()=>props.onChange('images/test.png')},'Upload fixture');}}));
beforeEach(()=>{vi.stubGlobal('React',React);vi.clearAllMocks();mock.user={user_id:1};mock.state={phase:'idle',error:null,resultUrl:null,busy:false};mock.start.mockImplementation((submit:()=>unknown)=>submit());});
afterEach(()=>{cleanup();vi.unstubAllGlobals();});
describe('packaging conversion',()=>{
 it('requires a dieline, explains paid credits and submits its dimensions only on request',()=>{
  render(React.createElement(PackagingMockupForm));
  const generate=screen.getByRole('button',{name:/Make the mockup/}) as HTMLButtonElement;
  expect(generate.disabled).toBe(true);expect(mock.uploadProps.required).toBe(true);
  expect(mock.uploadProps.signInHint).toContain('paid credits');
  fireEvent.click(screen.getByText('Upload fixture'));expect(generate.disabled).toBe(false);
  expect(mock.submit).not.toHaveBeenCalled();fireEvent.click(generate);
  expect(mock.submit).toHaveBeenCalledWith({image_url:'images/test.png',w_mm:117,h_mm:114,d_mm:39,angle:'45'});
 });
 it('opens topup without auto-submitting or retaining another project context',()=>{
  render(React.createElement(PackagingMockupForm));fireEvent.click(screen.getByText('Buy credits'));
  expect(mock.setContext).toHaveBeenCalledWith(null);expect(mock.setModal).toHaveBeenCalledWith('topup');expect(mock.submit).not.toHaveBeenCalled();
 });
 it('gates anonymous credit purchases with sign-in',()=>{
  mock.user=null;render(React.createElement(PackagingMockupForm));fireEvent.click(screen.getByText('Buy credits'));
  expect(mock.setDrawer).toHaveBeenCalledWith('signin');expect(mock.setModal).not.toHaveBeenCalled();
 });
 it('previews output and tracks file-open intent only after a click',()=>{
  mock.state={phase:'done',error:null,resultUrl:'https://example.com/output.jpg',busy:false};
  render(React.createElement(PackagingMockupForm));expect(screen.getByRole('img').getAttribute('src')).toBe(mock.state.resultUrl);
  expect(mock.track).not.toHaveBeenCalled();const link=screen.getByRole('link');link.addEventListener('click',e=>e.preventDefault());fireEvent.click(link);
  expect(mock.track).toHaveBeenCalledWith({contentId:'download:click:packaging-mockup',contentType:'menu_link',actionType:'click'});
  expect(link.getAttribute('target')).toBe('_blank');
 });
});
