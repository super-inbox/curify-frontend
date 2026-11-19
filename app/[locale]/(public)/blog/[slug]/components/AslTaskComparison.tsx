// This guide serves selection/how-to intent; the existing tool owns video-to-English queries.
export default function AslTaskComparison({ locale }: { locale: string }) {
  const zh = locale === 'zh';
  const prefix = zh ? '/zh' : '';
  const rows = zh ? [
    ['ASL 视频 → 英文草稿','上传手语视频，读取手、脸与身体的视觉信息。','Curify 现有工具支持这一方向；输出仍需人工核对。'],
    ['英文 → ASL / gloss','把英文转成手语表达或书面标注。','与视频识别不同；本工具不提供这一功能。'],
    ['查一个单词的手语','查看词典中的手势与用法示例。','单词查询不能代替整段视频翻译。'],
    ['实时人工口译','让合格口译员参与双向交流。','与异步 AI 草稿不同；重要交流应选择合适的人工支持。'],
  ] : [
    ['ASL video → English draft','Upload signed footage to interpret visual information from hands, face and body.','This is the direction supported by Curify; check the draft against the signing.'],
    ['English → ASL or gloss','Turn English into signing or a written notation of signs.','A different task from video recognition; this tool does not generate ASL or gloss.'],
    ['Look up an individual sign','Find a word and examples in a sign-language dictionary.','Word lookup does not translate a continuous signed video.'],
    ['Live human interpreting','Work with a qualified interpreter for two-way communication.','Different from an asynchronous AI draft; choose appropriate human support for consequential communication.'],
  ];
  return <section lang={zh ? 'zh' : 'en'} id="choose-asl-workflow" className="my-8">
    <h2 className="mb-4 text-2xl font-bold">{zh ? '你需要哪一种 ASL 翻译？' : 'Which ASL translation workflow do you need?'}</h2>
    <p className="mb-4 leading-7">{zh ? '搜索 ASL translator 时会遇到多种产品。先确认输入是手语视频还是英文，再看希望得到文字、手语或人工协助。' : 'An “ASL translator” can mean several different products. Start with your input—signed video or English—and the result you need: text, signing or human assistance.'}</p>
    <div className="overflow-x-auto"><table className="w-full border-collapse text-left text-sm"><thead><tr>{(zh ? ['任务','输入与用途','如何选择'] : ['Task','Input and purpose','What to choose']).map(h=><th scope="col" key={h} className="border-b p-3 font-semibold">{h}</th>)}</tr></thead><tbody>{rows.map(row=><tr key={row[0]}>{row.map((cell,i)=>i===0 ? <th scope="row" key={i} className="border-b p-3 align-top font-medium">{cell}</th> : <td key={i} className="border-b p-3 align-top leading-6">{cell}</td>)}</tr>)}</tbody></table></div>
    <h3 className="mt-6 text-xl font-semibold">{zh ? '把 ASL 视频转成英文文字' : 'Translate ASL video to English text'}</h3>
    <p className="mt-3 leading-7">{zh ? '已有手语视频时，可使用 ' : 'If you already have signed footage, use the '}<a className="text-indigo-700 underline" href={`${prefix}/tools/asl-video-translator`}>{zh ? 'ASL 视频翻译工具' : 'ASL video-to-English translator'}</a>{zh ? ' 生成草稿，再对照原片检查。文字与字幕只是呈现方式，流畅的英文并不证明手语识别准确。' : ' to produce a draft, then compare it with the source. Text and subtitles are output formats; fluent English does not prove accurate sign recognition.'}</p>
    <p className="mt-3 leading-7">{zh ? '想了解方法与实验局限，可阅读 ' : 'For methods and evaluation limits, read our '}<a href="/blog/building-asl-video-translator" className="text-indigo-700 underline">{zh ? 'ASL 工程实验记录（英文）' : 'ASL engineering experiments'}</a>{zh ? '。' : '.'}</p>
  </section>;
}
