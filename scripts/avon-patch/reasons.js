/* ---------- 雅芳品類 ---------- */
// 週期是預設的「大約多久用完」，使用者每筆都可以改
const CATS = [
  { k: 'hair', label: '髮品', emoji: '💆‍♀️', cycle: 45, re: /洗髮|潤髮|護髮|髮|頭皮/ },
  { k: 'intimate', label: '私密潔浴', emoji: '🌸', cycle: 30, re: /私密|潔浴|沐浴|浴/ },
  { k: 'deo', label: '體香／制汗', emoji: '🌿', cycle: 30, re: /體香|止汗|制汗|滾珠|爽身/ },
  { k: 'skin', label: '臉部保養', emoji: '✨', cycle: 60, re: /精華|乳液|乳霜|面霜|化妝水|洗面|洗顏|眼霜|面膜|防曬|保養|卸妝/ },
  { k: 'fragrance', label: '香水香氛', emoji: '🌹', cycle: 90, re: /香水|香氛|淡香|古龍/ },
  { k: 'makeup', label: '彩妝', emoji: '💄', cycle: 90, re: /口紅|唇|粉底|粉餅|眼影|睫毛|眼線|腮紅|眉|彩妝|遮瑕/ },
  { k: 'health', label: '保健食品', emoji: '🌾', cycle: 30, re: /膠囊|錠|保健|益生菌|維他命|維生素|魚油|膠原/ },
  { k: 'other', label: '其他', emoji: '🛍️', cycle: 0, re: /$^/ },
];
const catOf = k => CATS.find(c => c.k === k) || CATS[CATS.length - 1];
const guessCat = name => (CATS.find(c => c.re.test(name || '')) || CATS[CATS.length - 1]).k;
const matchCat = text => { text = (text || '').trim(); if (!text) return ''; const c = CATS.find(x => x.label.includes(text) || text.includes(x.label.split('／')[0])); return c ? c.k : guessCat(text); };
const pLabel = p => p.product || catOf(p.cat).label;
const catSelect = (attrs, sel) => `<select ${attrs}>${CATS.map(k => `<option value="${k.k}" ${k.k === sel ? 'selected' : ''}>${k.emoji} ${k.label}</option>`).join('')}</select>`;
// 回購話術裡的一句品類貼心話（避免療效用語）
const CAT_TIP = {
  hair: '換季了頭髮也要好好照顧，', intimate: '天氣變化，日常清潔更要溫和，', deo: '天氣悶熱出門要清爽，',
  skin: '保養最怕中斷，', fragrance: '換個季節也可以換個香味心情，', makeup: '', health: '日常保養別中斷，', other: '',
};

/* ---------- 關懷原因 ---------- */
const REASONS = {
  birthday: { label: '生日祝福', emoji: '🎂' },
  followup: { label: '約好再聯絡', emoji: '📅' },
  deadline: { label: '訂貨截止', emoji: '⏰' },
  refill:   { label: '該回購囉', emoji: '🧴' },
  sample:   { label: '試用回訪', emoji: '🎁' },
  newbie:   { label: '首購關心', emoji: '🌱' },
  catalog:  { label: '新型錄上架', emoji: '🆕' },
  noreply:  { label: '再問一次', emoji: '🔁' },
  festival: { label: '節慶送禮', emoji: '💐' },
  winback:  { label: '喚回老顧客', emoji: '💌' },
  dormant:  { label: '好久不見', emoji: '👋' },
  general:  { label: '日常問候', emoji: '😊' },
};
const RESULTS = {
  sent:    { label: '已傳送，待記結果', emoji: '📤' },
  replied: { label: '有回覆', emoji: '💬' },
  ordered: { label: '有訂貨', emoji: '🛍️' },
  noreply: { label: '還沒回', emoji: '😶' },
  later:   { label: '改天再聯絡', emoji: '📅' },
};
const CYCLES = [[0, '不固定'], [14, '約 2 週'], [30, '約 1 個月'], [45, '約 1 個半月'], [60, '約 2 個月'], [90, '約 3 個月']];
const TONES = { warm: '姐妹聊天', pro: '正式有禮', short: '一句就好' };

/* 話術：{c}稱呼 {p}產品 {me}署名 {no}期別 {dl}截止日 {hl}本期主打 {s}試用品 {fest}節日 {tip}品類貼心話 */
const TEMPLATES = {
  birthday: {
    warm: ['{c}生日快樂🎂！祝你新的一歲越來越美、天天開心～謝謝你一直以來的支持，我準備了一份小心意，方便的時候跟我說喔！',
           '{c}～今天是你的生日對吧🎉 祝你生日快樂、健康美麗！有空一起喝杯咖啡吧😊'],
    pro:   ['{c}您好，祝您生日快樂！感謝您長期的支持，祝您新的一年平安順心、美麗自信。'],
    short: ['{c}生日快樂🎂 天天美麗開心！'],
  },
  followup: {
    warm: ['{c}～上次說好再跟你聯絡，最近方便嗎？想跟你分享這期的好東西，看看你需不需要😊',
           '{c}你好～我是{me}，之前你說這陣子比較忙，現在有空聊一下嗎？不急，方便再回我就好～'],
    pro:   ['{c}您好，依照上次的約定與您聯繫。本期有幾項商品想為您介紹，請問您什麼時間方便呢？'],
    short: ['{c}～上次約好再聯絡，現在方便嗎？😊'],
  },
  deadline: {
    warm: ['{c}～提醒你一下，這期訂貨到 {dl} 截止喔！要補什麼跟我說，我一起幫你訂，省得之後又要等😊',
           '{c}～{no}快截止囉（{dl}），上次的{p}還夠用嗎？需要的話我幫你一起訂～'],
    pro:   ['{c}您好，提醒您{no}訂貨將於 {dl} 截止，若有需要補充的商品，歡迎告訴我，我為您一併處理。'],
    short: ['{c}～這期 {dl} 截止，要幫你訂什麼嗎？'],
  },
  catalog: {
    warm: ['{c}～雅芳{no}型錄出來囉！這期{hl}，我覺得很適合你，先傳給你看看😊 有喜歡的跟我說～',
           '{c}早安～新一期型錄剛上架，我先幫你挑了幾樣你可能會喜歡的，有空翻翻看，有問題隨時問我喔！'],
    pro:   ['{c}您好，雅芳{no}型錄已上架，本期{hl}，提供給您參考，如有需要歡迎與我聯繫。'],
    short: ['{c}～{no}新型錄來了！這期{hl}，要看看嗎？'],
  },
  refill: {
    warm: ['{c}～算算時間，上次的{p}應該快用完了吧？{tip}要不要我這期先幫你訂一份？😊',
           '{c}早安～{p}用得還順手嗎？差不多到回購的時間了，需要的話跟我說，我幫你準備好～'],
    pro:   ['{c}您好，您先前購買的{p}預計近期使用完畢，若需要回購，我可以在本期為您一併訂購。'],
    short: ['{c}～{p}快用完了嗎？這期幫你訂一份？'],
  },
  sample: {
    warm: ['{c}～上次給你的{s}用得怎麼樣？喜歡嗎？有什麼感覺都可以跟我說喔😊',
           '{c}～{s}用了幾天，覺得適合嗎？如果喜歡，這期剛好可以幫你訂正貨～'],
    pro:   ['{c}您好，想請教您{s}試用後的感受，若有任何問題或需要正貨，歡迎與我聯繫。'],
    short: ['{c}～{s}試用還喜歡嗎？😊'],
  },
  newbie: {
    warm: ['{c}～謝謝你上次的支持！{p}用了幾天感覺怎麼樣？有沒有哪裡不習慣？我教你一些使用小撇步～',
           '{c}你好～{p}用起來還喜歡嗎？使用上有任何問題都可以問我喔😊'],
    pro:   ['{c}您好，感謝您選購{p}，想了解您這幾天的使用感受，若有任何問題歡迎隨時詢問我。'],
    short: ['{c}～{p}用起來還喜歡嗎？'],
  },
  noreply: {
    warm: ['{c}～不好意思再打擾一下，前幾天傳的訊息不知道有沒有看到？不急喔，有空再回我就好😊',
           '{c}～最近應該很忙吧！上次的訊息你有空再看就好，祝你這週順順利利～'],
    pro:   ['{c}您好，前幾天傳給您的訊息不知道是否方便查看？不急，您有空時再回覆即可，謝謝。'],
    short: ['{c}～前幾天的訊息有看到嗎？有空再回我就好😊'],
  },
  festival: {
    warm: ['{c}～{fest}快到了！今年要送禮的話，我這邊有幾款禮盒很受歡迎，包裝也漂亮，要不要先幫你看看？🎁',
           '{c}～{fest}要到囉，有沒有想寵愛自己或送給重要的人？我幫你挑幾樣適合的😊'],
    pro:   ['{c}您好，{fest}將至，本期有多款適合送禮的組合，若有需要，我很樂意為您推薦。'],
    short: ['{c}～{fest}快到了，要看看送禮組合嗎？🎁'],
  },
  winback: {
    warm: ['{c}～好久不見！最近雅芳有新的組合，想到你之前很喜歡{p}，特別跟你說一聲，有興趣我再傳給你看～',
           '{c}～好久沒跟你聊了，最近好嗎？這期有幾樣新品很適合你，想先聽聽你最近的需要😊'],
    pro:   ['{c}您好，好久不見。雅芳近期推出新的商品組合，想到您之前使用{p}的經驗，特別與您分享。'],
    short: ['{c}～好久不見！這期有新組合，要看看嗎？'],
  },
  dormant: {
    warm: ['{c}～好久沒聊了，最近還好嗎？天氣變化大要多保重喔！有需要什麼隨時跟我說～',
           '{c}～突然想到你，來打聲招呼😊 最近過得好嗎？'],
    pro:   ['{c}您好，好久沒有與您聯繫，近來一切都好嗎？若有任何需要，歡迎隨時與我聯絡。'],
    short: ['{c}～好久不見，最近好嗎？😊'],
  },
  general: {
    warm: ['{c}～最近好嗎？想到你就來打個招呼😊 有什麼需要隨時跟我說喔！'],
    pro:   ['{c}您好，近來一切都好嗎？若有任何需要，歡迎隨時與我聯繫。'],
    short: ['{c}～最近好嗎？😊'],
  },
};

/* ---------- 合規用詞提醒（提醒性質，正式上線前請法務確認詞庫） ---------- */
const RISK = [
  { re: /治療|治癒|根治|療效|醫治|消炎|抗發炎|預防.{0,4}(疾病|癌)|抗癌|防癌|降(血壓|血糖|血脂|膽固醇)|改善.{0,3}(體質|疾病|失眠|便秘)|排毒|殺菌|處方/g,
    ex: '治療、根治、消炎、抗癌、降血糖、排毒', why: '醫療效能用語：化粧品和一般食品都不能宣稱療效', fix: '改說使用感受，例如「用起來很舒服」「很多姐妹回購」' },
  { re: /減肥|瘦身|燃脂|消脂|甩肉|增高|豐胸|生髮|長頭髮|防止掉髮|除皺|消除皺紋|永久|根除/g,
    ex: '減肥、瘦身、豐胸、生髮、除皺、永久', why: '誇大或涉及改變身體機能的用語', fix: '改說「日常保養」「清爽」「滋潤」這類感受' },
  { re: /保證|百分之百|100%|絕對|最有效|第一名|無副作用|零風險|立即見效|馬上見效/g,
    ex: '保證、百分之百、絕對、最有效、無副作用', why: '保證或絕對性用語，容易被認定誇大不實', fix: '改說「我自己用很喜歡」「可以先試用看看」' },
  { re: /月入|輕鬆賺|穩賺|躺著賺|被動收入|保證收入|財富自由|日領|高收入/g,
    ex: '月入、輕鬆賺、穩賺、被動收入、財富自由', why: '招募時暗示收入，違反多層次傳銷相關規範', fix: '分享「認識新朋友、學美容知識」，不談收入' },
];
function riskCheck(text) {
  const hits = [];
  for (const r of RISK) { const m = [...new Set(String(text || '').match(r.re) || [])]; if (m.length) hits.push({ words: m, why: r.why, fix: r.fix }); }
  return hits;
}
const riskHTML = hits => hits.length ? `<div class="risk"><b>⚠️ 用詞提醒</b>${hits.map(h => `<p>「${h.words.map(esc).join('、')}」：${esc(h.why)}<br><span class="muted">建議：${esc(h.fix)}</span></p>`).join('')}</div>` : '';

/* ---------- 節慶（農曆節日先寫好 2026–2028） ---------- */
const nthSunday = (y, m, n) => { const d = new Date(y, m - 1, 1); return ymd(new Date(y, m - 1, 1 + (7 - d.getDay()) % 7 + (n - 1) * 7)); };
const LUNAR = { 2026: { cny: '2026-02-17', qixi: '2026-08-19', moon: '2026-09-25' }, 2027: { cny: '2027-02-06', qixi: '2027-08-08', moon: '2027-09-15' }, 2028: { cny: '2028-01-26', qixi: '2028-08-26', moon: '2028-10-03' } };
function festivals(y) {
  const L = LUNAR[y] || {};
  return [['情人節', `${y}-02-14`], ['婦女節', `${y}-03-08`], ['母親節', nthSunday(y, 5, 2)], ['父親節', `${y}-08-08`], ['聖誕節', `${y}-12-25`],
    ...(L.cny ? [['農曆新年', L.cny]] : []), ...(L.qixi ? [['七夕情人節', L.qixi]] : []), ...(L.moon ? [['中秋節', L.moon]] : [])];
}
function upcomingFestival(t) {
  const y = parse(t).getFullYear();
  return [...festivals(y), ...festivals(y + 1)].map(([n, d]) => ({ n, d, k: diff(t, d) })).filter(f => f.k >= 3 && f.k <= 14).sort((a, b) => a.k - b.k)[0] || null;
}

