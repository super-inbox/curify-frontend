/** Reviewed task phrases for registry tools. Generic subjects stay in content search. */
export const TOOL_SEARCH_ALIASES: Record<string, string[]> = {
  'packaging-mockup': ['dieline to 3d box', 'dieline to 3d', 'dieline into a 3d box', 'fold a dieline', 'fold my dieline', '3d packaging mockup', '刀版转3d', '刀模转立体包装盒', '包装刀版转立体'],
  'die-cut-sticker-file': ['die cut sticker file', 'die-cut sticker file', 'export sticker cutline', 'sticker print file', '贴纸刀线文件', '导出贴纸刀线'],
  'acrylic-factory-export': ['acrylic factory file', 'acrylic standee print file', 'export acrylic cutline', '亚克力生产文件', '亚克力立牌刀线'],
  'ai-product-photo-generator': ['ai product photo generator', 'generate product photos', '生成产品照片'],
  'ecommerce-photo': ['ecommerce product photo', 'ecommerce photo generator', '电商产品图生成'],
  'character-sticker-sheet': ['generate character sticker sheet', 'character sticker sheet generator', '生成角色表情包'],
  'mockup': ['merchandise mockup generator', 'generate merch mockup', '生成周边效果图'],
  'product-video': ['product video generator', 'generate a product video', '产品视频生成'],
  'ai-fashion-model-generator': ['ai fashion model generator', 'virtual fashion model', '虚拟服装模特生成'],
  'wedding-photo-editing': ['wedding photo editing', 'retouch wedding photos', '婚纱照精修'],
  'product-photo-retouching-service': ['product photo retouching service', 'bulk product retouching', '产品照片精修服务'],
  'real-estate-photo-editing': ['real estate photo editing', 'edit real estate photos', '房产照片精修'],
  'chinese-costume-tryon': ['chinese costume try on', 'hanfu virtual try on', '汉服虚拟试穿'],
  'brand-direction-explorer': ['brand direction explorer', 'explore brand directions', '品牌视觉方向探索'],
  'ai-wedding-photo-generator': ['ai wedding photo generator', 'generate wedding portraits'],
  'ai-pet-portrait-generator': ['ai pet portrait generator', 'generate pet portraits'],
  'video-enhance': ['video enhancement', 'video enhancer', 'enhance video quality', '视频画质增强'],
  'manga-translation': ['translate manga', 'manga translation', '漫画翻译'],
  'style-transfer': ['image style transfer', 'style transfer tool', '图片风格迁移'],
  'worksheet-from-video': ['worksheet from video', 'video to worksheet', '视频生成练习题'],
  'video-transcript-generator': ['convert video to text', 'transcribe my video'],
  'video-summarizer': ['summarize a video', 'summarize this youtube video'],
};

/** Explicit requests for reference content should not auto-launch a tool page. */
export function isToolReferenceQuery(query: string): boolean {
  return /\b(examples?|inspiration|ideas|tutorials?|guides?|comparisons?|reviews?|infographic|posters?|templates?)\b|教程|灵感|示例|海报|图解/.test(query.toLowerCase());
}
