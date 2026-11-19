import type { SearchHelpIntent } from '@/lib/searchTaskHelp';

const copy = {
  en: {
    workspace: ['Looking for your projects?', 'Open your workspace to find your saved work. Sign in with the account you used to create it.'],
    video: ['What kind of video do you want to make?', 'Choose a workflow for product videos, video translation, or your workspace.'],
    slides: ['Turn slides into a video', 'Importing an arbitrary slide link is not a verified supported workflow. Open your workspace to review the available video workflows; do not assume the link can be imported.'],
    upload: ['How long will a video upload take?', 'Upload time depends on file size and your upload speed. Processing starts separately after upload; there is no fixed time for every file. Check the upload status in your workspace.'],
    'local-file': ['Upload the file itself', 'A path on your computer is not an uploaded image. Open your workspace and select or drop the actual file.'],
    translate: ['What do you want to translate?', 'Choose subtitles, video dubbing, manga, or ASL video translation.'],
    combine: ['What do you want to combine?', 'Open your workspace to check the available editing workflows. A one-word request does not specify whether you mean images, clips, or something else.'],
    workspaceLink: 'Open workspace', product: 'Product video', subtitles: 'Subtitles', dubbing: 'Video dubbing', manga: 'Manga translation', asl: 'ASL video translator',
  },
  zh: {
    workspace: ['在找自己的项目？', '打开工作区查看已保存的内容，请登录创建项目时使用的账号。'],
    video: ['你想制作哪种视频？', '选择商品视频、视频翻译，或打开工作区查看可用流程。'],
    slides: ['把幻灯片做成视频', '目前未确认支持直接导入任意幻灯片链接。请在工作区查看可用的视频流程，不要假设链接可以直接导入。'],
    upload: ['上传视频需要多久？', '上传耗时取决于文件大小和上行网速；上传后的处理时间另算，没有适用于所有文件的固定时间。可在工作区检查状态。'],
    'local-file': ['请上传文件本身', '电脑上的文件路径不等于已上传的图片。请打开工作区，选择或拖入实际文件。'],
    translate: ['你想翻译什么？', '选择字幕、视频配音、漫画或美国手语视频翻译。'],
    combine: ['你想合并什么？', '请在工作区查看可用的编辑流程。仅“合并”一词无法确定你指的是图片、视频片段还是其他内容。'],
    workspaceLink: '打开工作区', product: '商品视频', subtitles: '字幕翻译', dubbing: '视频配音', manga: '漫画翻译', asl: '美国手语视频翻译',
  },
  es: {
    workspace: ['¿Buscas tus proyectos?', 'Abre tu espacio de trabajo e inicia sesión con la cuenta que utilizaste para crearlos.'],
    video: ['¿Qué tipo de video quieres crear?', 'Elige videos de productos, traducción de video o abre tu espacio de trabajo.'],
    slides: ['Convertir diapositivas en video', 'No está confirmado que se puedan importar enlaces arbitrarios de diapositivas. Revisa los flujos disponibles en tu espacio de trabajo.'],
    upload: ['¿Cuánto tarda en subir un video?', 'Depende del tamaño del archivo y de la velocidad de subida. El procesamiento es una etapa distinta y no hay un plazo fijo para todos los archivos.'],
    'local-file': ['Sube el archivo', 'Una ruta de tu ordenador no es una imagen subida. Abre el espacio de trabajo y selecciona o arrastra el archivo.'],
    translate: ['¿Qué quieres traducir?', 'Elige subtítulos, doblaje, manga o traducción de videos en ASL.'],
    combine: ['¿Qué quieres combinar?', 'Revisa los flujos de edición disponibles en tu espacio de trabajo. La palabra por sí sola no indica si se trata de imágenes o clips.'],
    workspaceLink: 'Abrir espacio de trabajo', product: 'Video de producto', subtitles: 'Subtítulos', dubbing: 'Doblaje', manga: 'Traducir manga', asl: 'Traductor de video ASL',
  },
};

export default function SearchTaskHelp({ kind, locale, spanish = false }: { kind: SearchHelpIntent; locale: string; spanish?: boolean }) {
  const t = copy[spanish ? 'es' : locale === 'zh' ? 'zh' : locale === 'es' ? 'es' : 'en'];
  const links = kind === 'translate'
    ? [['bilingual-subtitles', t.subtitles], ['video-dubbing', t.dubbing], ['manga-translation', t.manga], ['asl-video-translator', t.asl]]
    : kind === 'video' ? [['product-video', t.product], ['video-dubbing', t.dubbing]] : [];
  return <main className="mx-auto max-w-2xl px-6 py-16">
    <h1 className="text-3xl font-semibold">{t[kind][0]}</h1>
    <p className="my-6 text-gray-600">{t[kind][1]}</p>
    <div className="flex flex-col gap-3">
      <a className="rounded-xl border p-4 font-semibold" href={`/${locale}/workspace`}>{t.workspaceLink} →</a>
      {links.map(([slug, label]) => <a key={slug} className="rounded-xl border p-4" href={`/${locale}/tools/${slug}`}>{label} →</a>)}
    </div>
  </main>;
}
