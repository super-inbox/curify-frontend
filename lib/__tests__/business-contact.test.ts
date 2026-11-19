import { beforeEach, describe, expect, it, vi } from 'vitest';
import { businessCaseContext } from '@/lib/business-cases';
const { request } = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock('@/services/api', () => ({ apiClient: { request } }));
vi.mock('@/services/useTracking', () => ({
  getSessionId: () => 'session_test',
  getFirstTouch: () => ({ landing_page: '/business', utm: { utm_source: 'test' } }),
}));
import { contactService } from '@/services/contact';

describe('business inquiry persistence contract', () => {
  beforeEach(() => { request.mockReset(); request.mockResolvedValue({ data: 'ok' }); });
  it('rejects unknown/inherited case IDs from a contact URL', () => {
    for (const id of [null, '', 'unknown', '__proto__', 'constructor', 'hotel-room\nService: injected']) {
      expect(businessCaseContext(id)).toBeUndefined();
    }
  });
  it('serializes case, canonical service and attribution into the backend stored content field', async () => {
    await contactService.sendMail({
      email: 'test@example.com', subject: 'My hotel project', content: '20 photos',
      source: 'business:en:case:hotel-room', role: 'photographer', caseContext: businessCaseContext('hotel-room'),
    });
    const [path, options] = request.mock.calls[0];
    const body = JSON.parse(options.body);
    expect(path).toBe('/user/contact-team');
    expect(body).not.toHaveProperty('caseContext');
    expect(body).not.toHaveProperty('role');
    expect(body.source).toBe('business:en:case:hotel-room');
    for (const value of ['20 photos', 'Case ID: hotel-room', 'Service: photo-retouching', 'Role: photographer', 'Session: session_test', 'utm_source=test']) expect(body.content).toContain(value);
  });
  it('keeps ordinary contact callers working without case context', async () => {
    await contactService.sendMail({ email: 'test@example.com', subject: 'Other', content: 'Hello' });
    const body = JSON.parse(request.mock.calls[0][1].body);
    expect(body.content).toContain('Hello');
    expect(body.content).not.toContain('Case ID:');
  });
  it('propagates a rejected backend submission so the UI cannot mark it converted', async () => {
    request.mockRejectedValueOnce(new Error('unavailable'));
    await expect(contactService.sendMail({ email: 'test@example.com', subject: 'Other', content: 'Hello' })).rejects.toThrow('unavailable');
  });
});
