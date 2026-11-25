'use client';
import { Link } from '@/i18n/navigation';
import CreativeVideoForm from './CreativeVideoForm';
import ToolsGrid from './ToolsGrid';
import { TOOL_REGISTRY, type ToolDef } from '@/lib/tools-registry';
import RelatedBlogsByCategory from './RelatedBlogsByCategory';
import { useTracking } from '@/services/useTracking';

type Copy = [string, string];
type Demo = { id: string; title: Copy; src: string; poster: string; description: Copy };
const travel: Demo[] = [
  {id:'kyoto',title:['Kyoto · a kimono walk','京都 · 和服漫游'],src:'/business/kyoto-watermarked.mp4',poster:'/business/kyoto-poster.jpg',description:['A character portrait becomes a Kyoto-inspired story: dressing, lantern-lit lanes, temple visits and a quiet tea-room moment. A reference for a personal travel keepsake; the current self-serve edit is about 23 seconds.','以人物肖像为主角，串联和服装扮、灯笼街巷、寺院与茶室，呈现京都旅行故事。适合个人旅拍纪念；当前自助版本剪辑约 23 秒。']},
  {id:'bali',title:['Bali · an island escape','巴厘岛 · 海岛假日'],src:'/creative-video/bali.mp4',poster:'/creative-video/bali.jpg',description:['Clifftop light, temple gates and rice terraces form a 30-second island story around one character. Use a portrait to create an imagined holiday film for a resort stay or travel memory.','以人物肖像贯穿海边晨光、寺庙石门与梯田，构成约 30 秒海岛故事。适合度假酒店体验或旅行纪念，以 AI 重现想象中的假日。']},
  {id:'granada',title:['Granada · courtyards and light','格拉纳达 · 庭院与光影'],src:'/creative-video/granada.mp4',poster:'/creative-video/granada.jpg',description:['A recurring character and shawl connect the Alhambra skyline, reflecting pools and courtyard architecture. The 30-second narrative suits a cultural-city keepsake with a quieter visual rhythm.','由人物与披肩串联阿尔罕布拉宫轮廓、倒影水池和庭院建筑，组成约 30 秒文化城市纪念片。适合偏好建筑、光影和舒缓节奏的旅行故事。']},
  {id:'dubai',title:['Dubai · life along the Creek','迪拜 · 河湾漫游'],src:'/creative-video/dubai.mp4',poster:'/creative-video/dubai.jpg',description:['Working dhows, an abra crossing and waterfront scenes build a 30-second Dubai Creek journey. This example focuses on the old waterfront and everyday travel atmosphere rather than a skyline montage.','以传统木船、渡船过河和水岸生活，串联约 30 秒迪拜河湾旅程。展示老城水岸与日常旅行氛围，适合有地方文化特色的纪念短片。']},
  {id:'tengwangge',title:['Tengwang Pavilion · an evening story','滕王阁 · 夜游故事'],src:'/creative-video/tengwangge.mp4',poster:'/creative-video/tengwangge.jpg',description:['Traditional clothing, pavilion stairs, illuminated eaves and river light create a 30-second heritage-inspired film. A portrait-led souvenir for a landmark visit or cultural attraction experience.','以古风装扮、登阁石阶、灯火飞檐与江畔夜色，组成约 30 秒文化纪念片。适合景区游览、古风旅拍与地标打卡的个人故事。']},
];
const motion: Demo[] = [
  {id:'london',title:['London · photographs into a city film','伦敦 · 摄影照片串成城市短片'],src:'/creative-video/london.mp4',poster:'/creative-video/london.jpg',description:['London photographs become a short sequence through the Underground, a stairwell, the whale hall and the Thames. Controlled camera moves and an electronic soundtrack connect the locations. This custom production study includes more shots and image extension than the current 1–4-photo self-serve workflow.','用伦敦摄影照片串联地铁、楼梯、鲸鱼大厅与泰晤士河，以镜头移动和电子配乐形成旅行节奏。这是既有定制制作案例，镜头数和扩图步骤多于当前 1–4 张照片的自助流程。']},
  {id:'zeelum',title:['ZEELUM · product detail in motion','ZEELUM · 商品细节动起来'],src:'https://cdn.curify-ai.com/case-studies/zeelum-20261107/zeelum-v10-silent.mp4',poster:'https://cdn.curify-ai.com/case-studies/zeelum-20261107/zeelum-poster.jpg',description:['Exterior and open-compartment backpack photos were used to create this 10-second silent feature demonstration. It includes an opening action and interior reveal from a custom workflow. The photo-motion tool focuses on camera movement; it does not promise this product-opening animation.','由背包外观与隔层照片制作的 10 秒静音功能演示，展示打开动作和内部空间。它来自定制多步骤流程；当前摄影运镜工具主要移动镜头，不承诺自动复现背包开合动作。']},
];
export default function CreativeVideoToolPage({mode,locale}:{mode:'motion'|'souvenir';locale:string}) {
  const zh=locale==='zh'; const ix=zh?1:0; const t=(en:string,cn:string)=>zh?cn:en;
  const isTravel=mode==='souvenir'; const demos=isTravel?travel:motion;
  const {trackAction}=useTracking();
  const siblingSlug=isTravel?'photo-motion':'travel-souvenir-video';
  const sibling: ToolDef={id:siblingSlug,slug:siblingSlug,groupId:'video',status:'demo',job_type:'video_transcript',namespace:'creativeVideo',action:{type:'page'},i18n:{titleKey:'',descKey:''}};
  const relatedTools=[sibling,...TOOL_REGISTRY.filter(tool=>['wedding-photo-editing','product-video'].includes(tool.slug))];
  const relatedCopy={[siblingSlug]:{title:isTravel?t('Photo camera motion','摄影运镜'):t('Travel souvenir video','文旅纪念视频'),description:isTravel?t('Turn 1–4 photos into a short film with planned camera moves and music.','上传 1–4 张照片，规划运镜并配乐，制作摄影短片。'):t('Choose one of five destinations and make a personal film from your portrait.','从五个目的地中选择一个，用你的肖像制作个人纪念短片。')}};

  const steps=isTravel ? [
    [t('Upload one portrait','上传一张肖像'),t('Choose a clear adult portrait with an unobstructed face.','选择面部清晰、无遮挡的成年人肖像。')],
    [t('Choose your destination','选择旅行目的地'),t('Pick Kyoto, Bali, Granada, Dubai or Tengwang Pavilion. Each has its own story and scenes.','选择京都、巴厘岛、格拉纳达、迪拜或滕王阁，每个目的地有独立脚本与场景。')],
    [t('Create and review','生成并检查'),t('Review the finished film for likeness and scene details, then download it.','检查成片中的人物相似度和场景细节，再下载保存。')],
  ] : [
    [t('Upload 1–4 photos','上传 1–4 张照片'),t('Use sharp photos and arrange them in the order you want to show them.','使用清晰照片，按希望播放的顺序上传。')],
    [t('Plan camera moves and music','规划运镜与配乐'),t('AI considers the photos together and chooses a movement for each. Keep automatic music or choose your own option.','AI 综合分析多张照片，为每张选择运镜；配乐可自动选配或手动选择。')],
    [t('Review your film','检查成片'),t('Each photo contributes about six seconds. Review camera movement, faces and geometry before downloading.','每张照片约贡献 6 秒。下载前检查运镜、人脸和建筑结构。')],
  ];
  const faqs=[
    [t('What does it cost?','费用是多少？'),isTravel?t('Each destination film costs 180 credits. The generation form shows the current server quote before you start.','每条文旅短片 180 积分，五个目的地统一价。生成前表单会显示服务器当前报价。'):t('18 credits per photo: 18, 36, 54 or 72 credits for one to four photos.','每张照片 18 积分，1–4 张分别为 18、36、54、72 积分。')],
    [t('How long is the finished video?','成片多长？'),isTravel?t('Kyoto is edited to about 23 seconds; the other four destinations are about 30 seconds. All use an 11-scene story.','京都约 23 秒，其余四个目的地约 30 秒，均使用 11 场景故事。'):t('Approximately six seconds per photo: about 6–24 seconds for 1–4 photos.','每张约 6 秒，1–4 张合成约 6–24 秒。')],
    [t('Will my result exactly match these demos?','我的结果会和示例完全一样吗？'),t('No. These are existing creative and custom-production examples. Your source material changes the result, and AI can alter faces, objects and architecture. Review the finished video before sharing.','不会完全一样。这里展示的是既有创作与定制制作案例。你的素材会影响结果，AI 也可能改变人脸、物体或建筑细节，分享前请检查成片。')],
    [t('Can I use my own music?','可以使用自己的音乐吗？'),t('Choose automatic music, calm, piano or no music. Uploading your own audio is not currently supported. Demo soundtracks may differ from the self-serve library.','目前可选自动配乐、舒缓、钢琴或无配乐，暂不支持上传音频。示例配乐可能与自助工具曲库不同。')],
    [t('When are credits charged?','什么时候扣积分？'),t('You need enough credits to start. Credits are deducted when the completed result is delivered. If rendering is still pending, resume the saved project instead of creating a duplicate.','开始前需要有足够积分，完成交付时扣除。若生成仍在等待，请继续已有项目，避免重复创建。')],
  ];
  return <main className={`mx-auto ${isTravel ? "max-w-[1600px]" : "max-w-5xl"} px-4 sm:px-6 pb-12 pt-20 text-[var(--c2)]`}>
    <Link href="/tools" className="text-sm text-purple-700">← {t('All tools','全部工具')}</Link>
    <h1 className="mb-4 mt-5 text-4xl font-bold text-[var(--c1)]">{isTravel?t('AI travel souvenir video','AI 文旅纪念视频'):t('Photo camera-motion video','摄影运镜视频')}</h1>
    <p className="mb-6 text-lg">{isTravel?t('Make your portrait the main character of a destination story. Choose from five journeys and create a personal travel keepsake.','让你的肖像成为目的地故事的主角，从五段旅行中选择一段，制作个人纪念短片。'):t('Turn your photos into a short film with image-aware camera planning and music.','用你的照片制作短片，由 AI 根据画面内容规划运镜并搭配音乐。')}</p>
    <a href="#reproduce" className="inline-block rounded-xl bg-purple-700 px-5 py-3 font-semibold text-white">{t('Make it with my photos','用我的照片制作')} →</a>
    <section className="mt-12" aria-labelledby="demo-title">
      <h2 id="demo-title" className="mb-3 text-2xl font-semibold">{t('See the examples','看看制作案例')}</h2>
      <p className="mb-6 text-sm text-neutral-600">{t('Existing production examples for inspiration. The current self-serve workflow may use different edits and soundtracks.','既有制作案例供参考，当前自助流程的剪辑与配乐可能不同。')}</p>
      <div className={`grid items-start gap-5 ${isTravel?'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5':'md:grid-cols-2'}`}>
        {demos.map(d=><article key={d.id} className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <video controls playsInline preload="none" poster={d.poster} src={d.src} aria-label={d.title[ix]} className={isTravel ? "aspect-[9/16] w-full bg-neutral-950 object-contain" : "h-80 w-full bg-neutral-950 object-contain"} onPlay={()=>trackAction({contentId:`tool-demo:${mode}:${d.id}:play`,contentType:'tool_card'},'click')}/>
          <div className="p-3"><h3 className="font-semibold">{d.title[ix]}</h3>
            <details className="mt-2 text-sm"><summary className="cursor-pointer text-purple-700 hover:underline focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-500">{t('About this example','查看案例说明')}</summary><p className="mt-2 leading-6 text-neutral-600">{d.description[ix]}</p></details>
          </div>
        </article>)}
      </div>
    </section>
    <section className="my-10 rounded-2xl border border-neutral-200 p-6"><h2 className="text-2xl font-semibold">{t('How it works','如何制作')}</h2><div className="mt-5 grid gap-6 md:grid-cols-3">{steps.map(([title,body],i)=><div key={title}><h3 className="font-semibold">{i+1}. {title}</h3><p className="mt-2 text-sm leading-6">{body}</p></div>)}</div></section>
    <CreativeVideoForm mode={mode}/>
    <section className="mt-16"><h2 className="mb-4 text-2xl font-semibold">{t('What you can make','适合制作什么')}</h2><p className="leading-7">{isTravel?t('Personal holiday keepsakes, cultural-attraction souvenirs and hotel guest experiences. Each destination supplies a different visual story; one portrait anchors the identity across the scenes.','个人假日纪念、景区游览短片和酒店住客体验。每个目的地提供不同的视觉故事，用一张肖像串联各个场景。'):t('Photography portfolios, city-trip recaps and short visual stories. Start with photos that have a clear subject and visible depth. Camera movement adds emphasis while preserving the original photographic scene as the reference.','摄影作品展示、城市旅行回顾和视觉短故事。建议使用主体清晰、前后景有层次的照片，以原始画面为参考，通过镜头移动突出重点。')}</p></section>
    <section className="mt-16"><h2 className="mb-5 text-2xl font-semibold">{t('Frequently asked questions','常见问题')}</h2>{faqs.map(([q,a])=><div key={q} className="mb-5"><h3 className="mb-2 font-medium">{q}</h3><p className="text-sm leading-6 text-neutral-600">{a}</p></div>)}</section>
    <section className="mt-12"><h2 className="mb-4 text-2xl font-semibold text-[var(--c1)]">{t('Related tools','相关工具')}</h2><ToolsGrid tools={relatedTools} copyOverrides={relatedCopy} gridClassName="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"/></section>
    <RelatedBlogsByCategory locale={zh?'zh':'en'} categories={isTravel?['creator-tools']:['merch-pod']} pinnedSlugs={isTravel?['ai-travel-scrapbook-templates','ai-travel-itinerary-templates']:['ai-product-photo-to-ecommerce-listing','url-to-product-video']} max={3} heading={t('Related reading','相关阅读')}/>
  </main>;
}
