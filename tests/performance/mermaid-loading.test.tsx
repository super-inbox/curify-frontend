// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, waitFor } from '@testing-library/react';
import { MermaidInit } from '../../app/[locale]/(public)/blog/[slug]/components/MermaidInit';

const script = vi.hoisted(() => ({ ready: undefined as undefined | (() => void), loads: 0 }));
vi.mock('next/script', () => ({ default: (props: { onReady: () => void }) => {
  script.ready = props.onReady;
  script.loads++;
  return null;
}}));
afterEach(() => {
  cleanup();
  document.body.innerHTML = '';
  delete (window as any).mermaid;
  script.ready = undefined;
  script.loads = 0;
});
const mount = () => render(<MermaidInit scopeId="article" />);

describe('article-scoped Mermaid loading', () => {
  it('does not load for an article without diagrams, even if another section has one', () => {
    document.body.innerHTML = '<div id="article"><p>Text</p></div><div class="mermaid">outside</div>';
    mount();
    expect(script.loads).toBe(0);
  });
  it('waits for script readiness and renders only unprocessed diagrams in this article', async () => {
    document.body.innerHTML = '<div id="article"><div class="mermaid">graph TD; A-->B</div><div class="mermaid" data-processed="true"><svg/></div></div><div class="mermaid">outside</div>';
    mount();
    await waitFor(() => expect(script.ready).toBeTypeOf('function'));
    const run = vi.fn().mockResolvedValue(undefined);
    const initialize = vi.fn();
    (window as any).mermaid = { run, initialize };
    script.ready!();
    expect(initialize).toHaveBeenCalledWith(expect.objectContaining({ startOnLoad: false }));
    expect(run).toHaveBeenCalledWith({ nodes: [document.querySelector('#article .mermaid')] });
  });
  it('renders new article nodes on remount with an already-loaded script', async () => {
    document.body.innerHTML = '<div id="article"><div class="mermaid">graph TD; A-->B</div></div>';
    const run = vi.fn().mockResolvedValue(undefined);
    (window as any).mermaid = { run, initialize: vi.fn() };
    const first = mount();
    await waitFor(() => expect(script.ready).toBeTypeOf('function'));
    script.ready!();
    first.unmount();
    const next = document.createElement('div'); next.className = 'mermaid'; next.textContent = 'graph TD; C-->D';
    document.getElementById('article')!.replaceChildren(next);
    mount();
    script.ready!();
    expect(run).toHaveBeenLastCalledWith({ nodes: [next] });
    expect(run).toHaveBeenCalledTimes(2);
  });
});
