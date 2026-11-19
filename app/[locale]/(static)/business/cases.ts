import type { BusinessCaseId } from '@/lib/business-cases';
import type { BusinessLang } from './copy';

export type BusinessCase = {
  id: BusinessCaseId; image: string; video?: string; article?: string;
  copy: Record<BusinessLang, { title: string; badge: string; input: string; output: string; note: string }>;
};
export const businessCases: BusinessCase[] = [
  {
    id: 'hotel-room', image: 'https://cdn.curify-ai.com/images/real_estate/hotel-room-before-after.jpg',
    article: '/blog/hotel-photo-editing-case-study',
    copy: {
      en: { title: 'A clearer view of the room', badge: 'PHOTO RETOUCHING · EDITING TRIAL', input: 'One hotel room, source exposures and a bedding reference.', output: 'A before-and-after edit balancing the room, linen and window highlights.', note: 'Published with permission. V4 trial, not final client sign-off; details need review before a batch.' },
      zh: { title: '让客房细节更清楚', badge: '照片精修 · 试修案例', input: '同一客房的原始曝光照片与床品参考。', output: '调整室内亮度、床品与窗户高光的前后对照。', note: '已获许可公开。展示 V4 试稿，非客户最终验收；批量制作前需逐项检查细节。' },
    },
  },
  {
    id: 'zeelum-backpack', image: 'https://cdn.curify-ai.com/case-studies/zeelum-20261107/zeelum-poster.jpg',
    video: 'https://cdn.curify-ai.com/case-studies/zeelum-20261107/zeelum-v10-silent.mp4', article: '/blog/product-photos-to-feature-video',
    copy: {
      en: { title: 'Product photos, a feature in motion', badge: 'PRODUCT VIDEO · AI-ASSISTED DEMO', input: 'Backpack exterior, branding and open-compartment photographs.', output: 'A 10-second square film showing the product, opening action and interior.', note: 'Silent V10 demonstration from a custom workflow, not an approved campaign or a one-click tool result.' },
      zh: { title: '从商品照片到功能演示', badge: '商品视频 · AI 辅助演示', input: '背包外观、品牌细节与打开隔层的照片。', output: '10 秒方形视频，展示外观、打开动作与内部空间。', note: 'V10 静音演示，使用定制多步骤流程；非已验收广告，也非工具一键生成结果。' },
    },
  },
  {
    id: 'fabric', image: '/business/fabric-poster.jpg', video: '/business/fabric-watermarked.mp4',
    copy: {
      en: { title: 'From cotton to a finished garment', badge: 'PRODUCT STORY · CREATIVE DEMO', input: 'A textile production story and visual direction.', output: 'A short advertisement connecting raw cotton to a finished shirt.', note: 'Watermarked Curify Gallery demonstration, not a client commission.' },
      zh: { title: '从棉花到成衣的产品故事', badge: '产品故事 · 创作示例', input: '纺织品制作故事与视觉方向。', output: '把原棉到衬衫的过程串联为产品短片。', note: '保留水印的 Curify Gallery 创作示例，非客户委托项目。' },
    },
  },
  {
    id: 'kyoto', image: '/business/kyoto-poster.jpg', video: '/business/kyoto-watermarked.mp4',
    copy: {
      en: { title: 'A Kyoto-inspired keepsake', badge: 'PERSONAL FILM · CREATIVE DEMO', input: 'An original AI character and an autumn destination story.', output: 'A kimono walk through a Kyoto-inspired setting.', note: 'Watermarked creative demonstration with an AI character, not a real visitor delivery.' },
      zh: { title: '京都风格的旅拍纪念片', badge: '个人短片 · 创作示例', input: '原创 AI 角色与秋日目的地故事。', output: '身着和服漫步京都风格街景的纪念短片。', note: '保留水印的 AI 角色创作示例，非真实游客交付案例。' },
    },
  },
];
export const portfolioCopy = {
  en: {
    title: 'See the work. Picture your project.', intro: 'Start with an example close to what you need. See what went in, what came out and what we would agree before producing yours.',
    input: 'Starting material', output: 'What we made', similar: 'Make something like this', article: 'Read the project notes',
    brief: 'Your quantity, deadline, formats and a link to source material (optional)…',
    hint: 'This example is attached to your inquiry. No account needed. Sample scope and pricing are agreed before production.',
    submit: 'Discuss my project', inquiry: 'Project inquiry', selfServe: 'Want to make it yourself?',
    selfServeIntro: 'Explore the tools for a single task, or discuss a managed project for custom sequences and batches.', tool: 'Browse tools',
  },
  zh: {
    title: '先看作品，再聊你的项目', intro: '从接近你需求的示例开始，了解输入素材、制作结果，以及正式制作前需要确认的标准。',
    input: '输入素材', output: '制作结果', similar: '制作类似项目', article: '阅读项目过程',
    brief: '数量、时间、交付格式与素材链接（选填）…',
    hint: '询盘会附上当前案例，无需注册。试稿范围与费用在制作前确认。',
    submit: '咨询我的项目', inquiry: '项目咨询', selfServe: '想自己动手制作？',
    selfServeIntro: '单项任务可以先探索工具；定制镜头与批量项目可以交给我们制作。', tool: '浏览自助工具',
  },
};
