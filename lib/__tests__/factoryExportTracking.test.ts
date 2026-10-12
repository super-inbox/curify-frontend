// @vitest-environment jsdom
import { act, renderHook, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({
  user: { value: { user_id: 1 } as { user_id: number } | null },
  drawer: vi.fn(), track: vi.fn(), first: vi.fn(), status: vi.fn(),
}));
vi.mock('jotai', () => ({ useAtomValue: () => mocks.user.value, useSetAtom: () => mocks.drawer }));
vi.mock('@/app/atoms/atoms', () => ({ userAtom: {}, drawerAtom: {} }));
vi.mock('@/services/useTracking', () => ({ trackEvent: mocks.track }));
vi.mock('@/services/funnelEvents', () => ({ trackFirstGeneration: mocks.first }));
vi.mock('@/services/factoryExport', () => ({ factoryExportService: { getProjectStatus: mocks.status } }));
vi.mock('@/lib/awaitingCredits', () => ({ isAwaitingCredits: () => false }));
import { useFactoryExport } from '@/services/useFactoryExport';
const stages = () => mocks.track.mock.calls.map(([event]) => event.contentId);

describe('packaging conversion milestones', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.clearAllMocks(); mocks.user.value = { user_id: 1 }; });
  afterEach(() => { cleanup(); vi.useRealTimers(); });
  it('does not count authentication gating as an accepted generation', async () => {
    mocks.user.value = null;
    const submit = vi.fn();
    const { result } = renderHook(() => useFactoryExport({ trackingSurface: 'packaging-mockup' }));
    await act(async () => { await result.current.start(submit); });
    expect(submit).not.toHaveBeenCalled();
    expect(stages()).toEqual(['generate:attempt:packaging-mockup']);
    expect(mocks.drawer).toHaveBeenCalledWith('signin');
  });
  it('counts completion only after the backend returns COMPLETED', async () => {
    mocks.status.mockResolvedValue({ status: 'COMPLETED', result_url: '/result.png' });
    const { result } = renderHook(() => useFactoryExport({ trackingSurface: 'packaging-mockup' }));
    await act(async () => { await result.current.start(async () => ({ success: true, project_id: 'p1' })); });
    expect(stages()).toEqual(['generate:attempt:packaging-mockup', 'generate:accepted:packaging-mockup']);
    await act(async () => { await vi.advanceTimersByTimeAsync(4000); });
    expect(result.current.phase).toBe('done');
    expect(stages()).toContain('generate:complete:packaging-mockup');
    expect(mocks.first).toHaveBeenCalledWith('packaging-mockup');
  });
  it('does not count a rejected submission as accepted or completed', async () => {
    const { result } = renderHook(() => useFactoryExport({ trackingSurface: 'packaging-mockup' }));
    await act(async () => { await result.current.start(async () => ({ success: false, message: 'Rejected' })); });
    expect(result.current.phase).toBe('failed');
    expect(stages()).toEqual(['generate:attempt:packaging-mockup']);
    expect(mocks.first).not.toHaveBeenCalled();
  });
});
