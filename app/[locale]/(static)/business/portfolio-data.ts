export const categories = [
  {
    "id": "product",
    "zh": "商品与广告",
    "en": "Products & ads"
  },
  {
    "id": "photo",
    "zh": "摄影与修图",
    "en": "Photography & editing"
  },
  {
    "id": "brand",
    "zh": "品牌与平面",
    "en": "Brand & graphic design"
  },
  {
    "id": "story",
    "zh": "故事与纪念片",
    "en": "Stories & keepsakes"
  },
  {
    "id": "education",
    "zh": "教育与知识",
    "en": "Education & knowledge"
  },
  {
    "id": "demo",
    "zh": "3D 与产品演示",
    "en": "3D & product demos"
  }
] as const;
export type Work = { id: string; categories: string[]; title: {en:string;zh:string}; description:{en:string;zh:string}; image:string; video?:string|null; href?:string|null; kind:string; steps?:{en:string[];zh:string[]}|null; tool?:string|null; images?:string[]|null };
export const works: Work[] = [
  {
    "id": "zeelum",
    "categories": [
      "product",
      "demo"
    ],
    "title": {
      "zh": "商品照片 → 背包功能短片",
      "en": "Product photos → a backpack feature film"
    },
    "description": {
      "zh": "统一布光后生成运动，再剪成 10 秒无声试片。重点展示隔层与内部结构；这是试片，不是已验收广告。",
      "en": "Relit product photographs become a 10-second silent feature demo. A production trial, not an approved advertising campaign."
    },
    "image": "https://cdn.curify-ai.com/case-studies/zeelum-20261107/zeelum-poster.jpg",
    "video": "https://cdn.curify-ai.com/case-studies/zeelum-20261107/zeelum-v10-silent.mp4",
    "href": "/blog/product-photos-to-feature-video",
    "kind": "trial",
    "steps": {
      "zh": [
        "用有限商品照片展示背包外观与功能。",
        "提供的商品照片与功能需求。",
        "统一布光、生成开包运动、检查结构并剪辑。",
        "V10 无声试片：外观、标志、下部隔层、主仓。"
      ],
      "en": [
        "Show the backpack and its features from a limited photo set.",
        "Supplied product photographs and feature requirements.",
        "Relight frames, generate opening motion, review structure and edit.",
        "V10 silent trial: exterior, label, lower compartment and main interior."
      ]
    },
    "tool": null,
    "images": null
  },
  {
    "id": "hotel",
    "categories": [
      "photo"
    ],
    "title": {
      "zh": "酒店客房：从原图到第 4 版试片",
      "en": "Hotel room: original → version 4"
    },
    "description": {
      "zh": "调整明暗与色彩，整理客房展示；电视画面有添加。公开授权的试修对比，不作像素级保真承诺。",
      "en": "A room-editing trial with tonal and colour adjustments; a TV picture was added. Authorized comparison, not a pixel-exact preservation claim."
    },
    "image": "https://cdn.curify-ai.com/images/real_estate/hotel-room-before-after.jpg",
    "video": null,
    "href": "/blog/hotel-photo-editing-case-study",
    "kind": "trial",
    "steps": {
      "zh": [
        "让客房照片更适合展示，同时核对房间细节。",
        "获授权展示的客房原始照片。",
        "多轮调整与版本对照，说明新增电视画面。",
        "第 4 版试片与原图并排；交付范围仍须逐批确认。"
      ],
      "en": [
        "Improve the room presentation while checking visible details.",
        "The authorized original room photograph.",
        "Iterative edits and version comparison, including a disclosed TV-picture addition.",
        "Version 4 beside the original; each batch still needs an agreed scope."
      ]
    },
    "tool": null,
    "images": null
  },
  {
    "id": "fabric",
    "categories": [
      "product",
      "brand"
    ],
    "title": {
      "zh": "从棉花到成衣的产品故事",
      "en": "A product story from cotton to shirt"
    },
    "description": {
      "zh": "以原料、工序和成衣串起一条服装广告创意。原创演示，保留水印。",
      "en": "An original apparel-ad demonstration connecting material, process and finished garment. Watermark retained."
    },
    "image": "/business/fabric-poster.jpg",
    "video": "/business/fabric-watermarked.mp4",
    "href": null,
    "kind": "demo",
    "steps": null,
    "tool": null,
    "images": null
  },
  {
    "id": "matcha",
    "categories": [
      "product"
    ],
    "title": {
      "zh": "抹茶饮品广告创意",
      "en": "Matcha drink advertising concept"
    },
    "description": {
      "zh": "用饮品与原料画面构成广告样片，无品牌客户交付声明。",
      "en": "An unbranded drink-ad demonstration built around the product and ingredients."
    },
    "image": "/business/matcha-poster.jpg",
    "video": "/business/matcha-watermarked.mp4",
    "href": null,
    "kind": "demo",
    "steps": null,
    "tool": null,
    "images": null
  },
  {
    "id": "chair",
    "categories": [
      "demo",
      "product"
    ],
    "title": {
      "zh": "办公椅功能视觉演示",
      "en": "Office-chair feature visualization"
    },
    "description": {
      "zh": "用气流与调节信息展示卖点。AI 创意演示，不是工程仿真或可编辑 3D 模型交付。",
      "en": "Airflow and adjustment graphics communicate product features. An AI creative demo, not engineering simulation or delivery of an editable 3D model."
    },
    "image": "/business/chair-poster.jpg",
    "video": "/business/chair-watermarked.mp4",
    "href": null,
    "kind": "demo",
    "steps": null,
    "tool": null,
    "images": null
  },
  {
    "id": "kyoto",
    "categories": [
      "story"
    ],
    "title": {
      "zh": "京都灵感旅行纪念片",
      "en": "A Kyoto-inspired keepsake film"
    },
    "description": {
      "zh": "原创 AI 角色的秋日和服漫步，展示旅行照片套餐可以延伸的故事形式。",
      "en": "An original AI character on an autumn kimono walk: a keepsake format to complement a travel-photo package."
    },
    "image": "/business/kyoto-poster.jpg",
    "video": "/business/kyoto-watermarked.mp4",
    "href": null,
    "kind": "demo",
    "steps": null,
    "tool": null,
    "images": null
  },
  {
    "id": "twilight",
    "categories": [
      "photo"
    ],
    "title": {
      "zh": "日景 → 暮色房产展示",
      "en": "Daylight → twilight property presentation"
    },
    "description": {
      "zh": "生成房屋示例的日转夜对比，展示天空、窗光和整体氛围变化；非客户房产交付。",
      "en": "A generated-house comparison showing sky, window-light and atmosphere changes. Not a delivered client listing."
    },
    "image": "https://cdn.curify-ai.com/images/real_estate/virtual-twilight-before-after.jpg",
    "video": null,
    "href": "/tools/real-estate-photo-editing",
    "kind": "demo",
    "steps": null,
    "tool": null,
    "images": null
  },
  {
    "id": "sandals",
    "categories": [
      "photo",
      "product"
    ],
    "title": {
      "zh": "鞋履：背景与光影整理",
      "en": "Footwear: background and lighting"
    },
    "description": {
      "zh": "提供的凉鞋前后对照：背景更亮、鞋面与阴影更柔和。颜色与结构须按原图复核。",
      "en": "A supplied sandal comparison with a brighter setting and softer surfaces and shadows. Colour and construction still require source checks."
    },
    "image": "/service-examples/sandals-before-after.jpg",
    "video": null,
    "href": "/tools/product-photo-retouching-service",
    "kind": "reference",
    "steps": null,
    "tool": null,
    "images": null
  },
  {
    "id": "jewelry",
    "categories": [
      "photo",
      "product"
    ],
    "title": {
      "zh": "珠宝：金属与宝石呈现",
      "en": "Jewelry: metal and stone presentation"
    },
    "description": {
      "zh": "提供的戒指对比展示明暗与反光变化。增强闪耀不代表宝石品质，爪位、刻字和形状需核对。",
      "en": "A supplied ring comparison illustrates light and reflection changes. Enhanced sparkle does not imply gemstone quality; check prongs, engraving and shape."
    },
    "image": "/service-examples/jewelry-before-after.jpg",
    "video": null,
    "href": "/tools/product-photo-retouching-service",
    "kind": "reference",
    "steps": null,
    "tool": null,
    "images": null
  },
  {
    "id": "shoe-series",
    "categories": [
      "photo",
      "product"
    ],
    "title": {
      "zh": "六组鞋履修图方向",
      "en": "Six footwear editing directions"
    },
    "description": {
      "zh": "同一集合展示光线、色彩、材质、背景与细节的不同处理。生成演示，不是已交付订单。",
      "en": "A generated demonstration collection exploring light, colour, material, background and detail treatments. Not a completed customer order."
    },
    "image": "/service-examples/womens-shoe-restoration-en.jpg",
    "video": null,
    "href": "/tools/product-photo-retouching-service",
    "kind": "demo",
    "steps": null,
    "tool": null,
    "images": null
  },
  {
    "id": "hsk-series",
    "categories": [
      "education",
      "brand"
    ],
    "title": {
      "zh": "HSK 双语阅读系列",
      "en": "An HSK bilingual reading series"
    },
    "description": {
      "zh": "围绕城市与日常生活制作成套阅读海报：中文、拼音和英文配合插画。原创教学内容演示，非考试机构认证材料。",
      "en": "A coordinated reading-poster series combining Chinese, pinyin, English and illustration. Original learning-content demos, not exam-board certified materials."
    },
    "image": "https://cdn.curify-ai.com/images/nano_insp/template-hsk-bilingual-reading-text-lesson-poster-hsk2-my-first-weekend-in-beijing-watercolor-v2.jpg",
    "video": null,
    "href": "/nano-template/hsk-bilingual-reading-text-lesson-poster",
    "kind": "demo",
    "steps": {
      "zh": [
        "把生活主题做成便于连续发布的阅读材料。",
        "原创分级短文、中文/拼音/英文与场景设定。",
        "统一水彩风格与版式，执行文字、素材和视觉检查。",
        "公开系列海报与配套阅读视频；这里展示三张成套海报。"
      ],
      "en": [
        "Turn everyday topics into a repeatable reading series.",
        "Original graded passages, Chinese/pinyin/English and scene briefs.",
        "Apply a shared watercolor layout and run text, asset and visual checks.",
        "A public poster series and companion reading videos; three posters shown here."
      ]
    },
    "tool": null,
    "images": [
      "https://cdn.curify-ai.com/images/nano_insp/template-hsk-bilingual-reading-text-lesson-poster-hsk2-my-first-weekend-in-beijing-watercolor-v2.jpg",
      "https://cdn.curify-ai.com/images/nano_insp/template-hsk-bilingual-reading-text-lesson-poster-hsk2-less-spicy-please-watercolor-v2.jpg",
      "https://cdn.curify-ai.com/images/nano_insp/template-hsk-bilingual-reading-text-lesson-poster-hsk3-an-evening-in-shanghai-watercolor-v2.jpg"
    ]
  },
  {
    "id": "giftbox",
    "categories": [
      "brand",
      "demo"
    ],
    "title": {
      "zh": "磁吸礼盒：开合与包裹概念",
      "en": "Magnetic gift box: open, closed and wrap"
    },
    "description": {
      "zh": "原创包装概念图展示开合状态与外包装。用于讨论视觉方向，不是可生产刀模或工程结构图。",
      "en": "An original packaging concept showing open, closed and outer-wrap views. For visual direction, not a production dieline or engineering drawing."
    },
    "image": "https://cdn.curify-ai.com/images/search-quality-20261020/magnetic-box.jpg",
    "video": null,
    "href": null,
    "kind": "demo",
    "steps": null,
    "tool": "/tools/packaging-mockup",
    "images": null
  }
];
