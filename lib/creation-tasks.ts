/** Public task catalogue. Only fixed presets may be seeded by a shared link. */
export type TaskId = 'retouch' | 'motion' | 'wedding' | 'product' | 'souvenir' | 'asl';
export type TaskLang = 'en' | 'zh';
export const taskLang = (locale: string): TaskLang => locale === 'zh' ? 'zh' : 'en';
export const CREATION_TASKS = [
  { id: 'retouch', slug: 'wedding-photo-editing', example: 'portrait-input', image: '/generation-examples/acceptance-2026-10-25/wedding-input.webp', title: ['Retouch my photo', '修我的照片'], description: ['Upload a portrait. Review the edit against your original.', '上传人像照片，对照原图检查修整结果。'], caption: ['Example source photo · upload your own', '示例输入照片 · 使用你自己的照片'] },
  { id: 'motion', slug: 'photo-motion', example: 'gentle-motion', image: '/task-examples/photo-motion.jpg', title: ['Bring my photos to life', '让摄影作品动起来'], description: ['Plan camera moves, animate your photos and add music.', '规划镜头运动，让照片动起来，再配上音乐。'], caption: ['London production study · not an output of this new tool', 'London 制作案例 · 非本次新工具的输出'] },
  { id: 'wedding', slug: 'ai-wedding-photo-generator', example: 'wedding-studio', image: '/generation-examples/acceptance-2026-10-25/wedding-output.jpg', title: ['Create wedding portraits', '生成我的婚纱照'], description: ['Choose a setting and upload a photo of two adults.', '选择场景，上传两位成年人的合照。'], caption: ['Studio style · actual tool output with fictional subjects', '影棚风格 · 虚构人物的实际工具输出'] },
  { id: 'product', slug: 'ecommerce-photo', example: 'product-poster', image: '/task-examples/product-poster.jpg', title: ['Product images & videos', '商品图片与视频'], description: ['Make a scene poster or turn product photos into a video.', '用商品照片制作场景海报，或生成产品视频。'], caption: ['Poster example · check product details in your result', '海报示例 · 制作后请核对商品细节'] },
  { id: 'souvenir', slug: 'travel-souvenir-video', example: 'kyoto', image: '/business/kyoto-poster.jpg', title: ['Make a travel keepsake', '制作文旅纪念视频'], description: ['Your portrait, a destination and a short AI souvenir film.', '用你的人像与目的地场景，制作 AI 纪念短片。'], caption: ['Kyoto creative demo · AI character', '京都创作示例 · AI 角色'] },
  { id: 'asl', slug: 'asl-video-translator', example: 'asl-captioned', image: '/task-examples/asl-captioned.jpg', title: ['Translate an ASL video', 'ASL 视频翻译'], description: ['Upload signing footage and review the English captions.', '上传手语视频，检查并编辑英文字幕。'], caption: ['Captioned demonstration · review meaning before export', '字幕演示 · 导出前请核对含义'] },
] as const;
export function creationTask(id: string | null | undefined) { return CREATION_TASKS.find(t => t.id === id); }
export function taskHref(id: TaskId) {
  const t = creationTask(id)!;
  return `/tools/${t.slug}?task=${t.id}&example=${t.example}#reproduce`;
}
export function taskForLocation(path: string, search: string) {
  const q = new URLSearchParams(search);
  const pathWithoutLocale = path.replace(/^\/(en|zh|ja|ko|de|fr|es|hi|tr|ru)(?=\/)/, '');
  if(q.get('task')==='product' && q.get('example')==='product-video' && pathWithoutLocale==='/tools/product-video') return {...creationTask('product')!, slug:'product-video', example:'product-video'};
  const task = creationTask(q.get('task'));
  return task && path.replace(/^\/(en|zh|ja|ko|de|fr|es|hi|tr|ru)(?=\/)/, '') === `/tools/${task.slug}` && q.get('example') === task.example ? task : undefined;
}
