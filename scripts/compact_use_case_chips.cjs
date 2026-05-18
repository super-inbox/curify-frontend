// Strips the "For ..." prefix from every use-case chip label across all
// locales for compactness when the row carries 8 chips, and rewrites the
// EntryBar lead-in to "Explore by use cases for:" so the prefix carries
// the "for" semantics once instead of repeating it per chip.
//
// Touches `entryBar.useCases.*` (8 labels) and `entryBar.useCasesQuestion`
// in every locale. Run once: `node scripts/compact_use_case_chips.cjs`

const fs = require('fs');
const path = require('path');

const LABELS = {
  en: {
    useCasesQuestion: 'Explore by use cases for:',
    useCases: {
      'for-marketers': 'Growth Agencies',
      'for-parents': 'Parents',
      'for-esl-learners': 'ESL Learners',
      'for-creators': 'Creators',
      'for-designers': 'Designers',
      'for-publishers': 'EdTech & Publishers',
      'for-dtc-brands': 'DTC Brands',
      'for-programmatic-seo': 'Programmatic SEO',
    },
  },
  zh: {
    useCasesQuestion: '按使用场景探索：',
    useCases: {
      'for-marketers': '营销与代运营',
      'for-parents': '家长',
      'for-esl-learners': 'ESL 学习者',
      'for-creators': '创作者',
      'for-designers': '设计师',
      'for-publishers': '教育科技与出版',
      'for-dtc-brands': 'DTC 出海品牌',
      'for-programmatic-seo': '程序化 SEO',
    },
  },
  de: {
    useCasesQuestion: 'Anwendungsfälle erkunden für:',
    useCases: {
      'for-marketers': 'Wachstumsagenturen',
      'for-parents': 'Eltern',
      'for-esl-learners': 'ESL-Lernende',
      'for-creators': 'Creators',
      'for-designers': 'Designer',
      'for-publishers': 'EdTech & Verleger',
      'for-dtc-brands': 'DTC-Marken',
      'for-programmatic-seo': 'Programmatic SEO',
    },
  },
  es: {
    useCasesQuestion: 'Explora por casos de uso para:',
    useCases: {
      'for-marketers': 'Agencias de Growth',
      'for-parents': 'Padres',
      'for-esl-learners': 'Estudiantes ESL',
      'for-creators': 'Creadores',
      'for-designers': 'Diseñadores',
      'for-publishers': 'EdTech y Editores',
      'for-dtc-brands': 'Marcas DTC',
      'for-programmatic-seo': 'SEO Programático',
    },
  },
  fr: {
    useCasesQuestion: "Explorez par cas d'usage pour :",
    useCases: {
      'for-marketers': 'Agences Growth',
      'for-parents': 'Parents',
      'for-esl-learners': 'Apprenants ESL',
      'for-creators': 'Créateurs',
      'for-designers': 'Designers',
      'for-publishers': 'EdTech & Éditeurs',
      'for-dtc-brands': 'Marques DTC',
      'for-programmatic-seo': 'SEO Programmatique',
    },
  },
  hi: {
    useCasesQuestion: 'इन उपयोग मामलों के लिए खोजें:',
    useCases: {
      'for-marketers': 'ग्रोथ एजेंसियां',
      'for-parents': 'माता-पिता',
      'for-esl-learners': 'ESL शिक्षार्थी',
      'for-creators': 'क्रिएटर्स',
      'for-designers': 'डिज़ाइनर',
      'for-publishers': 'EdTech और प्रकाशक',
      'for-dtc-brands': 'DTC ब्रांड',
      'for-programmatic-seo': 'प्रोग्रामैटिक SEO',
    },
  },
  ja: {
    useCasesQuestion: 'ユースケースから探す:',
    useCases: {
      'for-marketers': 'グロースエージェンシー',
      'for-parents': '保護者',
      'for-esl-learners': 'ESL 学習者',
      'for-creators': 'クリエイター',
      'for-designers': 'デザイナー',
      'for-publishers': 'EdTech・出版社',
      'for-dtc-brands': 'DTC ブランド',
      'for-programmatic-seo': 'プログラマティック SEO',
    },
  },
  ko: {
    useCasesQuestion: '사용 사례별로 둘러보기:',
    useCases: {
      'for-marketers': '그로스 에이전시',
      'for-parents': '부모',
      'for-esl-learners': 'ESL 학습자',
      'for-creators': '크리에이터',
      'for-designers': '디자이너',
      'for-publishers': 'EdTech & 출판사',
      'for-dtc-brands': 'DTC 브랜드',
      'for-programmatic-seo': '프로그래매틱 SEO',
    },
  },
  ru: {
    useCasesQuestion: 'Изучите по сценариям использования:',
    useCases: {
      'for-marketers': 'Growth-агентства',
      'for-parents': 'Родители',
      'for-esl-learners': 'Изучающие ESL',
      'for-creators': 'Авторы',
      'for-designers': 'Дизайнеры',
      'for-publishers': 'EdTech и издатели',
      'for-dtc-brands': 'DTC-бренды',
      'for-programmatic-seo': 'Программатик SEO',
    },
  },
  tr: {
    useCasesQuestion: 'Kullanım senaryolarına göre keşfet:',
    useCases: {
      'for-marketers': 'Growth Ajansları',
      'for-parents': 'Ebeveynler',
      'for-esl-learners': 'ESL Öğrencileri',
      'for-creators': 'İçerik Üreticileri',
      'for-designers': 'Tasarımcılar',
      'for-publishers': 'EdTech ve Yayıncılar',
      'for-dtc-brands': 'DTC Markaları',
      'for-programmatic-seo': 'Programatik SEO',
    },
  },
};

for (const [locale, payload] of Object.entries(LABELS)) {
  const filePath = path.join(__dirname, '..', 'messages', locale, 'common.json');
  const json = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  json.entryBar = json.entryBar ?? {};
  json.entryBar.useCasesQuestion = payload.useCasesQuestion;
  json.entryBar.useCases = { ...(json.entryBar.useCases ?? {}), ...payload.useCases };
  fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n');
  console.log('Updated', locale);
}
