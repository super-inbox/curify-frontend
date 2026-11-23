// @vitest-environment jsdom
import React from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import CdnImage from '../../app/[locale]/_components/CdnImage';
vi.mock('@/lib/constants', () => ({ CDN_BASE: 'https://cdn.curify-ai.com' }));
vi.mock('next/image', () => ({default: ({src, unoptimized, sizes, priority, fetchPriority}: any) => <img src={src} data-unoptimized={String(unoptimized)} sizes={sizes} data-priority={String(priority)} fetchPriority={fetchPriority} />}));
afterEach(cleanup);
it('preserves direct CDN delivery by default', () => {
 const {container}=render(<CdnImage src="/images/example.jpg" alt="example" width={512} height={512}/>);
 expect(container.querySelector('img')?.src).toBe('https://cdn.curify-ai.com/images/example.jpg');
 expect(container.querySelector('img')?.dataset.unoptimized).toBe('true');
});
it('honors responsive optimization and LCP priority only when requested', () => {
 const {container}=render(<CdnImage src="/images/example.jpg" alt="example" fill unoptimized={false} sizes="50vw" priority fetchPriority="high"/>);
 const img=container.querySelector('img')!;
 expect(img.dataset.unoptimized).toBe('false');
 expect(img.sizes).toBe('50vw');
 expect(img.dataset.priority).toBe('true');
 expect(img.getAttribute('fetchpriority')).toBe('high');
});
