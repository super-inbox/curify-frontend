// @vitest-environment jsdom
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import ExportDialog from '../../app/[locale]/_componentForPage/ExportDialog';
vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
vi.mock('next/image', () => ({ default: (props: any) => React.createElement('img', props) }));
vi.mock('@headlessui/react', () => {
  const Wrapper = ({ children }: any) => React.createElement('div', null, children);
  return { Dialog: Object.assign(Wrapper, { Panel: Wrapper, Title: Wrapper }), Transition: Object.assign(Wrapper, { Child: Wrapper }) };
});
beforeEach(() => vi.stubGlobal('React', React));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
describe('export download intent', () => {
  it('records only a clicked file, never an opened export dialog', () => {
    const onDownload = vi.fn();
    const file = {name:'captions.srt',type:'SRT',downloadUrl:'https://example.com/result.srt'};
    render(React.createElement(ExportDialog, {isOpen:true,onClose:vi.fn(),files:[file],onDownload}));
    expect(onDownload).not.toHaveBeenCalled();
    const link=screen.getByRole('link');
    link.addEventListener('click', event => event.preventDefault());
    fireEvent.click(link);
    expect(onDownload).toHaveBeenCalledExactlyOnceWith(file);
    expect(link.getAttribute('href')).toBe(file.downloadUrl);
  });
});
