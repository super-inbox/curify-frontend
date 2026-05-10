// Inline traditional → simplified Chinese character mapping for search.
// Covers ~150 high-frequency single-char differences across our content
// domain (food, fashion, animals, vocabulary, education, travel, MBTI).
// Intentionally ignores context-sensitive cases (e.g. 干 ↔ 幹/乾) — for
// those we'd want opencc-js. This table handles the long-tail of
// traditional-Chinese search queries from Hong Kong / Taiwan users.
//
// Update: append new pairs as queries surface in GSC. Don't reorder —
// the build is just a Map literal.

const TS_TO_SC_PAIRS: Array<[string, string]> = [
  // Common verbs / nouns / particles
  ["書", "书"], ["學", "学"], ["習", "习"], ["時", "时"], ["國", "国"],
  ["個", "个"], ["設", "设"], ["計", "计"], ["動", "动"], ["詞", "词"],
  ["彙", "汇"], ["飾", "饰"], ["裝", "装"], ["髮", "发"], ["妝", "妆"],
  ["顏", "颜"], ["燈", "灯"], ["讀", "读"], ["寫", "写"], ["說", "说"],
  ["話", "话"], ["語", "语"], ["漢", "汉"], ["詩", "诗"], ["樂", "乐"],
  ["畫", "画"], ["藝", "艺"], ["術", "术"], ["創", "创"], ["圖", "图"],
  ["標", "标"], ["籤", "签"], ["遊", "游"], ["際", "际"], ["鄉", "乡"],
  ["區", "区"], ["場", "场"], ["點", "点"], ["號", "号"], ["樓", "楼"],
  ["廳", "厅"], ["員", "员"], ["體", "体"], ["醫", "医"], ["診", "诊"],
  ["療", "疗"], ["藥", "药"], ["處", "处"], ["發", "发"], ["燒", "烧"],
  ["熱", "热"], ["溫", "温"], ["氣", "气"], ["變", "变"], ["環", "环"],
  ["護", "护"], ["風", "风"],
  // Animals
  ["鳥", "鸟"], ["魚", "鱼"], ["蝦", "虾"], ["龜", "龟"], ["馬", "马"],
  ["豬", "猪"], ["貓", "猫"], ["鴨", "鸭"], ["雞", "鸡"], ["鵝", "鹅"],
  ["蟲", "虫"], ["蟻", "蚁"], ["鯊", "鲨"], ["鯨", "鲸"], ["烏", "乌"],
  ["獸", "兽"], ["驢", "驴"], ["馬", "马"],
  // Colors
  ["紅", "红"], ["綠", "绿"], ["藍", "蓝"], ["黃", "黄"], ["銀", "银"],
  ["銅", "铜"], ["鐵", "铁"], ["寶", "宝"], ["鑽", "钻"], ["鏈", "链"],
  ["鐲", "镯"],
  // Body / face
  ["齒", "齿"], ["鬚", "须"], ["臉", "脸"], ["額", "额"], ["腎", "肾"],
  ["腦", "脑"], ["細", "细"], ["經", "经"], ["統", "统"],
  // Common high-frequency chars
  ["義", "义"], ["樣", "样"], ["邊", "边"], ["線", "线"], ["開", "开"],
  ["閉", "闭"], ["關", "关"], ["門", "门"], ["機", "机"], ["電", "电"],
  ["視", "视"], ["聽", "听"], ["數", "数"], ["億", "亿"], ["萬", "万"],
  ["縣", "县"], ["鎮", "镇"], ["進", "进"], ["過", "过"], ["現", "现"],
  ["業", "业"], ["種", "种"], ["構", "构"], ["應", "应"], ["該", "该"],
  ["給", "给"], ["們", "们"], ["從", "从"], ["頭", "头"], ["還", "还"],
  ["對", "对"], ["後", "后"], ["麼", "么"], ["與", "与"], ["為", "为"],
  ["戀", "恋"], ["愛", "爱"], ["麗", "丽"], ["嗎", "吗"], ["戰", "战"],
  ["飛", "飞"], ["車", "车"], ["廠", "厂"],
  // Domain: food / cuisine / menu — addresses 菜單 query
  ["單", "单"], ["麵", "面"], ["飯", "饭"], ["麥", "麦"], ["糧", "粮"],
  ["雞", "鸡"], ["鴨", "鸭"], ["鯉", "鲤"], ["醬", "酱"], ["醋", "醋"],
  ["麪", "面"], ["糖", "糖"],
  // Domain: travel / countries / regions
  ["臺", "台"], ["灣", "湾"], ["島", "岛"], ["華", "华"], ["國", "国"],
  ["澳", "澳"], ["港", "港"], ["陸", "陆"], ["亞", "亚"], ["歐", "欧"],
  ["濱", "滨"], ["塢", "坞"], ["渡", "渡"],
  // Numbers / measurements
  ["週", "周"], ["雙", "双"], ["條", "条"], ["塊", "块"],
  // Common verbs
  ["買", "买"], ["賣", "卖"], ["賺", "赚"], ["賣", "卖"], ["賠", "赔"],
  ["賽", "赛"], ["參", "参"], ["數", "数"], ["離", "离"], ["別", "别"],
  ["請", "请"], ["謝", "谢"], ["驗", "验"], ["試", "试"], ["輸", "输"],
  ["贏", "赢"], ["獲", "获"], ["執", "执"], ["將", "将"], ["團", "团"],
  ["遲", "迟"], ["訪", "访"], ["評", "评"], ["論", "论"], ["講", "讲"],
  ["題", "题"], ["問", "问"], ["題", "题"], ["練", "练"], ["習", "习"],
  // Education / vocabulary terms (covers 詞彙 / 學習)
  ["課", "课"], ["筆", "笔"], ["紙", "纸"], ["獨", "独"], ["優", "优"],
  ["劣", "劣"], ["經", "经"], ["驗", "验"], ["體", "体"], ["驗", "验"],
];

const TS_TO_SC_MAP = new Map<string, string>(TS_TO_SC_PAIRS);

/**
 * Convert a string from Traditional Chinese to Simplified Chinese on a
 * char-by-char basis. Non-Chinese characters (Latin, digits, etc.) pass
 * through unchanged. Ambiguous characters (e.g. 干) are not converted —
 * if/when we need that level, swap to opencc-js.
 */
export function tsToSc(input: string): string {
  if (!input) return input;
  let out = "";
  for (const ch of input) {
    out += TS_TO_SC_MAP.get(ch) ?? ch;
  }
  return out;
}
