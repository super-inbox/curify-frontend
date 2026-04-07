// scripts/add_language_pair_param.cjs
// Extends 5 language-learning templates to support configurable language pairs.

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../public/data/nano_templates.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

const languagePairParam = {
  name: "language_pair",
  label: "Language Pair",
  type: "text",
  placeholder: ["English-Chinese", "English-French", "English-Spanish", "English-Japanese", "English-Korean"]
};

const languagePairParamZH = {
  name: "language_pair",
  label: "语言对",
  type: "text",
  placeholder: ["English-Chinese", "English-French", "English-Spanish", "English-Japanese", "English-Korean"]
};

function prepend(params, param) {
  if (params.some(p => p.name === 'language_pair')) return params;
  return [param, ...params];
}

// ─── 1. template-word-scene ───────────────────────────────────────────────────
const wordScene = data.find(t => t.id === 'template-word-scene');

wordScene.locales.en.base_prompt = wordScene.locales.en.base_prompt
  .replace(
    'Line 3: Chinese translation',
    'Line 3: Translation in the target language of {language_pair}'
  );
wordScene.locales.en.parameters = prepend(wordScene.locales.en.parameters, languagePairParam);

wordScene.locales.zh.base_prompt = wordScene.locales.zh.base_prompt
  .replace('第三行：中文翻译', '第三行：{language_pair}目标语言翻译');
wordScene.locales.zh.parameters = prepend(wordScene.locales.zh.parameters, languagePairParamZH);

// ─── 2. template-vocabulary ───────────────────────────────────────────────────
const vocabulary = data.find(t => t.id === 'template-vocabulary');

vocabulary.locales.en.base_prompt = vocabulary.locales.en.base_prompt
  .replace('(English Vocabulary Card Designer)', '(Language Vocabulary Card Designer)')
  .replace('clean and cute English learning posters', 'clean and cute language learning posters for {language_pair}')
  .replace('themed English vocabulary card', 'themed {language_pair} vocabulary card')
  .replace(
    'large English word {word_1_en}, Chinese meaning {word_1_cn}, and pinyin ({pinyin_1})',
    'source language word {word_1_en}, target language translation {word_1_cn}, and pronunciation guide ({pinyin_1})'
  );
vocabulary.locales.en.parameters = prepend(vocabulary.locales.en.parameters, languagePairParam);
vocabulary.locales.en.parameters.find(p => p.name === 'topic_chinese').label = 'Topic (Target Language)';
vocabulary.locales.en.parameters.find(p => p.name === 'word_1_cn').label = 'Word 1 (Target Language)';
vocabulary.locales.en.parameters.find(p => p.name === 'pinyin_1').label = 'Word 1 (Pronunciation)';

vocabulary.locales.zh.base_prompt = vocabulary.locales.zh.base_prompt
  .replace('（英语单词卡设计师）', '（语言单词卡设计师）')
  .replace('清新可爱的英语学习海报', '清新可爱的{language_pair}语言学习海报')
  .replace(
    '大号英文单词 {word_1_en}、中文释义 {word_1_cn}、括号内标注拼音 ({pinyin_1})',
    '源语言单词 {word_1_en}、目标语言释义 {word_1_cn}、发音标注 ({pinyin_1})'
  );
vocabulary.locales.zh.parameters = prepend(vocabulary.locales.zh.parameters, languagePairParamZH);

// ─── 3. template-english-top5-phrases ────────────────────────────────────────
const top5 = data.find(t => t.id === 'template-english-top5-phrases');

top5.locales.zh.base_prompt = top5.locales.zh.base_prompt
  .replace(
    '（少儿英语Top 5表达卡设计师）你是一位专业的少儿英语启蒙卡片设计师，擅长制作清新可爱的双语表达清单海报',
    '（语言Top 5表达卡设计师）你是一位专业的语言学习卡片设计师，擅长制作清新可爱的双语表达清单海报。语言对为{language_pair}（格式：源语言-目标语言）'
  )
  .replace(
    '大号英文表达（如 {phrase_1_en}）+ 下方中文释义（如 {phrase_1_cn}）',
    '大号源语言表达（如 {phrase_1_en}）+ 下方目标语言释义（如 {phrase_1_cn}）'
  );
top5.locales.zh.parameters = prepend(top5.locales.zh.parameters, languagePairParamZH);

const t5z = top5.locales.zh.parameters;
top5.locales.en = {
  base_prompt: `(Language Top 5 Phrases Card Designer) You are a professional language learning card designer specializing in creating clean and cute bilingual phrase list posters. The language pair is {language_pair} (format: source-target). Based on the user-specified [{topic_name}], generate a high-quality vertical 3:4 "Top 5 Ways to {topic_english}" phrase card, with cute cartoon, child-friendly style. Layout: 1. Top title: bold title "Top 5 Ways to {topic_english} / {topic_chinese}" with soft rounded border, clear readable text. 2. Item list: 5 colorful rounded items (light blue, light pink, light yellow, light green, light purple), each containing: left: number (1./2./3./4./5.); middle: large source language phrase ({phrase_1_en}) + target language translation below ({phrase_1_cn}); right: cute cartoon illustration matching the phrase meaning. 3. Overall style: clean rounded UI, soft pastel colors, cute cartoon characters, clear typography, Curify watermark top-left. Vertical 3:4 format, 4K ultra HD, output directly. Topic: [{topic_name}].`,
  parameters: [
    languagePairParam,
    { name: "topic_name",    label: "Topic",                    type: "text", placeholder: t5z.find(p => p.name === 'topic_name').placeholder },
    { name: "topic_english", label: "Topic (Source Language)",  type: "text", placeholder: t5z.find(p => p.name === 'topic_english').placeholder },
    { name: "topic_chinese", label: "Topic (Target Language)",  type: "text", placeholder: t5z.find(p => p.name === 'topic_chinese').placeholder },
    { name: "phrase_1_en",   label: "Phrase 1 (Source Language)", type: "text", placeholder: t5z.find(p => p.name === 'phrase_1_en').placeholder },
    { name: "phrase_1_cn",   label: "Phrase 1 (Target Language)", type: "text", placeholder: t5z.find(p => p.name === 'phrase_1_cn').placeholder },
    { name: "phrase_2_en",   label: "Phrase 2 (Source Language)", type: "text", placeholder: t5z.find(p => p.name === 'phrase_2_en').placeholder },
    { name: "phrase_2_cn",   label: "Phrase 2 (Target Language)", type: "text", placeholder: t5z.find(p => p.name === 'phrase_2_cn').placeholder },
    { name: "phrase_3_en",   label: "Phrase 3 (Source Language)", type: "text", placeholder: t5z.find(p => p.name === 'phrase_3_en').placeholder },
    { name: "phrase_3_cn",   label: "Phrase 3 (Target Language)", type: "text", placeholder: t5z.find(p => p.name === 'phrase_3_cn').placeholder },
    { name: "phrase_4_en",   label: "Phrase 4 (Source Language)", type: "text", placeholder: t5z.find(p => p.name === 'phrase_4_en').placeholder },
    { name: "phrase_4_cn",   label: "Phrase 4 (Target Language)", type: "text", placeholder: t5z.find(p => p.name === 'phrase_4_cn').placeholder },
    { name: "phrase_5_en",   label: "Phrase 5 (Source Language)", type: "text", placeholder: t5z.find(p => p.name === 'phrase_5_en').placeholder },
    { name: "phrase_5_cn",   label: "Phrase 5 (Target Language)", type: "text", placeholder: t5z.find(p => p.name === 'phrase_5_cn').placeholder },
  ]
};

// ─── 4. template-english-error-correction ────────────────────────────────────
const ec = data.find(t => t.id === 'template-english-error-correction');

ec.locales.zh.base_prompt = ec.locales.zh.base_prompt
  .replace(
    '（少儿英语纠错卡设计师）你是一位专业的少儿英语纠错卡片设计师，擅长制作清新可爱的双语正误对比学习海报',
    '（语言纠错卡设计师）你是一位专业的语言纠错卡片设计师，擅长制作清新可爱的双语正误对比学习海报。语言对为{language_pair}（格式：源语言-目标语言）'
  )
  .replace('错误英文句子{wrong_sentence}', '错误源语言句子{wrong_sentence}')
  .replace('正确英文句子{correct_sentence}', '正确源语言句子{correct_sentence}');
ec.locales.zh.parameters = prepend(ec.locales.zh.parameters, languagePairParamZH);

const ecz = ec.locales.zh.parameters;
ec.locales.en = {
  base_prompt: `(Language Error Correction Card Designer) You are a professional language error correction card designer specializing in creating clean and cute bilingual right-vs-wrong comparison learning posters. The language pair is {language_pair} (format: source-target). Based on the user-specified [{topic_name}], generate a high-quality vertical 3:4 "{topic_english} / {topic_chinese}" error correction card, with cute cartoon, child-friendly style. Layout: 1. Top title: bold title "{topic_english} / {topic_chinese}" with soft rounded border. 2. Content: 2 sets of wrong-vs-correct comparison units, each split into two columns: left (light pink): red ❌ + wrong sentence {wrong_sentence_1} + target language gloss + confused cartoon; right (light green): green ✅ + correct sentence {correct_sentence_1} + target language gloss + happy cartoon. Dashed divider between sets. 3. Overall style: clean rounded UI, soft pastel colors, cute cartoon illustrations, clear typography, Curify watermark top-left. Vertical 3:4 format, 4K ultra HD, output directly. Topic: [{topic_name}].`,
  parameters: [
    languagePairParam,
    { name: "topic_name",        label: "Topic",                   type: "text", placeholder: ecz.find(p => p.name === 'topic_name').placeholder },
    { name: "topic_english",     label: "Topic (Source Language)", type: "text", placeholder: ecz.find(p => p.name === 'topic_english').placeholder },
    { name: "topic_chinese",     label: "Topic (Target Language)", type: "text", placeholder: ecz.find(p => p.name === 'topic_chinese').placeholder },
    { name: "wrong_sentence_1",  label: "Wrong Sentence 1",        type: "text", placeholder: ecz.find(p => p.name === 'wrong_sentence_1').placeholder },
    { name: "correct_sentence_1",label: "Correct Sentence 1",      type: "text", placeholder: ecz.find(p => p.name === 'correct_sentence_1').placeholder },
    { name: "wrong_sentence_2",  label: "Wrong Sentence 2",        type: "text", placeholder: ecz.find(p => p.name === 'wrong_sentence_2').placeholder },
    { name: "correct_sentence_2",label: "Correct Sentence 2",      type: "text", placeholder: ecz.find(p => p.name === 'correct_sentence_2').placeholder },
  ]
};

// ─── 5. template-english-dialogue-scene ──────────────────────────────────────
const dlg = data.find(t => t.id === 'template-english-dialogue-scene');

dlg.locales.zh.base_prompt = dlg.locales.zh.base_prompt
  .replace(
    '（少儿英语情景对话卡设计师）你是一位专业的少儿英语情景对话卡片设计师，擅长制作清新可爱的双语生活场景学习海报',
    '（语言情景对话卡设计师）你是一位专业的语言情景对话卡片设计师，擅长制作清新可爱的双语生活场景学习海报。语言对为{language_pair}（格式：源语言-目标语言）'
  )
  .replace(
    '英文对话内容（如{dialogue_1_en}）+ 中文释义（如{dialogue_1_cn}）',
    '源语言对话内容（如{dialogue_1_en}）+ 目标语言释义（如{dialogue_1_cn}）'
  );
dlg.locales.zh.parameters = prepend(dlg.locales.zh.parameters, languagePairParamZH);

const dlgz = dlg.locales.zh.parameters;
dlg.locales.en = {
  base_prompt: `(Language Dialogue Scene Card Designer) You are a professional language dialogue scene card designer specializing in creating clean and cute bilingual life-scene learning posters. The language pair is {language_pair} (format: source-target). Based on the user-specified [{topic_name}], generate a high-quality vertical 3:4 "{topic_english} / {topic_chinese}" dialogue scene card, with cute cartoon, child-friendly style. Layout: 1. Top title: bold title "{topic_english} / {topic_chinese}" with soft rounded border and theme decorations. 2. Center illustration: a complete cartoon scene of the dialogue setting (restaurant, park, store, school, etc.) with characters, Q-version cute style, bright warm colors. 3. Dialogue area: 4-5 dialogue bubbles (alternating colors per speaker), each with: speaker label ({speaker_1}, {speaker_2}) + source language dialogue ({dialogue_1_en}) + target language translation ({dialogue_1_cn}), different background colors per speaker, clear layout. 4. Overall style: clean rounded UI, soft pastel colors, cute cartoon illustrations, clear typography, Curify watermark top-left. Vertical 3:4 format, 4K ultra HD, output directly. Topic: [{topic_name}].`,
  parameters: [
    languagePairParam,
    { name: "topic_name",    label: "Topic",                   type: "text", placeholder: dlgz.find(p => p.name === 'topic_name').placeholder },
    { name: "topic_english", label: "Topic (Source Language)", type: "text", placeholder: dlgz.find(p => p.name === 'topic_english').placeholder },
    { name: "topic_chinese", label: "Topic (Target Language)", type: "text", placeholder: dlgz.find(p => p.name === 'topic_chinese').placeholder },
    { name: "speaker_1",     label: "Speaker 1",               type: "text", placeholder: dlgz.find(p => p.name === 'speaker_1').placeholder },
    { name: "speaker_2",     label: "Speaker 2",               type: "text", placeholder: dlgz.find(p => p.name === 'speaker_2').placeholder },
    { name: "dialogue_1_en", label: "Dialogue 1 (Source Language)", type: "text", placeholder: dlgz.find(p => p.name === 'dialogue_1_en').placeholder },
    { name: "dialogue_1_cn", label: "Dialogue 1 (Target Language)", type: "text", placeholder: dlgz.find(p => p.name === 'dialogue_1_cn').placeholder },
    { name: "dialogue_2_en", label: "Dialogue 2 (Source Language)", type: "text", placeholder: dlgz.find(p => p.name === 'dialogue_2_en').placeholder },
    { name: "dialogue_2_cn", label: "Dialogue 2 (Target Language)", type: "text", placeholder: dlgz.find(p => p.name === 'dialogue_2_cn').placeholder },
    { name: "dialogue_3_en", label: "Dialogue 3 (Source Language)", type: "text", placeholder: dlgz.find(p => p.name === 'dialogue_3_en').placeholder },
    { name: "dialogue_3_cn", label: "Dialogue 3 (Target Language)", type: "text", placeholder: dlgz.find(p => p.name === 'dialogue_3_cn').placeholder },
    { name: "dialogue_4_en", label: "Dialogue 4 (Source Language)", type: "text", placeholder: dlgz.find(p => p.name === 'dialogue_4_en').placeholder },
    { name: "dialogue_4_cn", label: "Dialogue 4 (Target Language)", type: "text", placeholder: dlgz.find(p => p.name === 'dialogue_4_cn').placeholder },
  ]
};

// ─── Write & verify ───────────────────────────────────────────────────────────
fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

const ids = [
  'template-word-scene',
  'template-vocabulary',
  'template-english-top5-phrases',
  'template-english-error-correction',
  'template-english-dialogue-scene',
];
ids.forEach(id => {
  const t = data.find(t => t.id === id);
  const enP = t.locales.en?.parameters || [];
  const zhP = t.locales.zh?.parameters || [];
  console.log(`${id}:`);
  console.log(`  EN locale: ${!!t.locales.en}, lang_pair param: ${enP.some(p => p.name === 'language_pair')}`);
  console.log(`  ZH locale: ${!!t.locales.zh}, lang_pair param: ${zhP.some(p => p.name === 'language_pair')}`);
});

console.log('\nDone.');
