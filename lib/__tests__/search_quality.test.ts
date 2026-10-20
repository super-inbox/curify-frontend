import { describe, it, expect, vi } from 'vitest';
import { matchesSubject, retrievalQuery, sourceVideoUrl, youtubeSource } from '../searchQuality';
import { matchToolIntent } from '../searchIndex';
vi.mock('@/services/api', () => ({ apiClient: { request: vi.fn().mockRejectedValue(new Error('No network in test')) } }));
import { nanoPromptsService } from '@/services/nanoPrompts';
import curated from '@/lib/generated/search-curated-gallery.json';
import gallery from '@/public/data/nanobanana.json';
describe('search intent quality', () => {
  it('serves curated detail pages without a Redis dependency and preserves source records', async () => {
    for (const entry of curated) {
      const source = gallery.find(p => p.id === entry.id)!;
      expect(entry.prompt).toBe(source.promptText);
      expect(entry.imageURL).toBe(source.imageUrl);
      expect((await nanoPromptsService.getNanoPrompt(entry.id)).title).toBe(entry.title);
    }
  });
  it('recognizes short Chinese tool aliases without broadening ASCII matches', () => {
    expect(matchToolIntent('字幕翻译')?.href).toBe('/tools/bilingual-subtitles');
    expect(matchToolIntent('给视频加字幕')?.href).toBe('/tools/bilingual-subtitles');
    expect(matchToolIntent('dublin travel')).toBeNull();
    expect(matchToolIntent('dessert')).toBeNull();
  });
  it('canonicalizes evidenced multilingual subjects without changing others', () => {
    expect(retrievalQuery('Diseño industrial')).toBe('industrial design');
    expect(retrievalQuery('industrial desing')).toBe('industrial design');
    expect(retrievalQuery('industrial photography')).toBe('industrial photography');
  });
  it('requires original subject and language, even for broad format matches', () => {
    expect(matchesSubject('art movements', 'fitness movement posture')).toBe(false);
    expect(matchesSubject('art movements', 'art history timeline')).toBe(true);
    expect(matchesSubject('盆栽郁金香的种植图解', '植物图解 英伟达策略')).toBe(false);
    expect(matchesSubject('盆栽郁金香的种植图解', '郁金香种植')).toBe(true);
    expect(matchesSubject('infographic poem in filipino', 'Seoul travel infographic')).toBe(false);
    expect(matchesSubject('infographic poem in filipino', 'Filipino original poem')).toBe(true);
    expect(matchesSubject('peacock dress', 'peacock couture dress')).toBe(true);
    expect(matchesSubject('peacock dress', 'wedding dress')).toBe(false);
    expect(matchesSubject('magnetic box mockup', 'electromagnetic induction')).toBe(false);
    expect(matchesSubject('coffee poster', 'coffee poster')).toBe(true);
  });
  it('retains URL case and query parameters, rejects unsafe and unrelated schemes', () => {
    const url='https://www.youtube.com/watch?v=AbCdEf12345&t=7s';
    expect(sourceVideoUrl(url)).toBe(url);
    expect(youtubeSource(url)).toBe(url);
    expect(youtubeSource('https://youtube.com.evil.example/video/x')).toBeNull();
    expect(sourceVideoUrl('javascript:alert(1)')).toBeNull();
    expect(sourceVideoUrl('https://u:p@youtube.com/watch?v=x')).toBeNull();
    expect(sourceVideoUrl('https://example.com/about')).toBeNull();
    expect(sourceVideoUrl('https://example.com/video/clip.mp4')).toBeTruthy();
  });
});
