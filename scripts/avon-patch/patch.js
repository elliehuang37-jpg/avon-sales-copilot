// 把通用版 index.html 改成雅芳版：node patch.js <index.html>
const fs = require('fs');
const path = require('path');
const dir = __dirname;
const file = process.argv[2];
let s = fs.readFileSync(file, 'utf8');
const part = n => fs.readFileSync(path.join(dir, n), 'utf8');

function rep(a, b, all) {
  if (!s.includes(a)) throw new Error('missing: ' + a.slice(0, 80));
  s = all ? s.split(a).join(b) : s.replace(a, () => b);
}
function between(start, end, content) {
  const i = s.indexOf(start); if (i < 0) throw new Error('missing start: ' + start);
  const j = s.indexOf(end, i + start.length); if (j < 0) throw new Error('missing end: ' + end);
  s = s.slice(0, i) + content + s.slice(j);
}

// 版面與品牌
between('<style>\n:root{', '*{box-sizing:border-box}', part('tokens.css'));
rep('font-family:"PingFang TC","Noto Sans TC"', 'font-family:"Lato","PingFang TC","Noto Sans TC"');
rep('<title>銷售小幫手 Sales Partner Copilot</title>', '<title>雅芳銷售小幫手 AVON Sales Partner Copilot</title>');
rep('content="AI 銷售者智慧行動助手：每天整理該關心的顧客、建議溝通內容、追蹤結果。資料只存在你的手機。"', 'content="雅芳銷售小幫手：每天整理該關心的顧客、跟著型錄檔期提醒、建議話術並追蹤結果。資料只存在你的手機。"');
rep('<meta name="theme-color" content="#a31d5a">', '<meta name="theme-color" content="#e5004b">');
rep('<meta name="apple-mobile-web-app-title" content="銷售小幫手">', '<meta name="apple-mobile-web-app-title" content="雅芳小幫手">');
rep('<link rel="manifest" href="manifest.webmanifest">', '<link rel="manifest" href="manifest.webmanifest">\n<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap">');
rep('<img src="icons/icon-192.png" alt="">\n    <div class="t"><b>銷售小幫手</b>', '<img src="icons/logo-64.png" alt="AVON">\n    <div class="t"><b>雅芳銷售小幫手</b>');
rep('.top-in img{width:34px;height:34px;border-radius:9px}', '.top-in img{width:36px;height:36px;border-radius:4px}');
rep('<span class="e">📈</span>成果</a>', '<span class="e">📈</span>業績</a>');

// 資料
rep("const KEY = 'spc-data-v1';", "const KEY = 'spca-data-v1';");
rep("big: false, daily: 5, onboarded: false, practice: false, theme: 'auto' }", "big: true, daily: 5, onboarded: false, practice: false, theme: 'auto', campaign: null }");
rep("'spc-hide-install'", "'spca-hide-install'", true);
rep('桌面就會出現「銷售小幫手」', '桌面就會出現「雅芳小幫手」');

// 程式區塊
between('/* ---------- 關懷原因 ---------- */', '/* ---------- 資料 ---------- */', part('reasons.js'));
between('function sampleCustomers() {', '/* ---------- 規則：誰今天該被關心 ---------- */', part('sample.js'));
between('function signal(c, t = today()) {', 'function plan() {', part('rules.js'));
between('function buildMessage(', '/* ---------- 版面 ---------- */', part('message.js'));
between('/* ---------- 今天 ---------- */', '/* ---------- 關心流程（三步驟） ---------- */', part('today.js'));
between('/* ---------- 關心流程（三步驟） ---------- */', '/* ---------- 顧客 ---------- */', part('care.js'));
between('/* ---------- 顧客 ---------- */', '/* CSV 匯入 */', part('customers.js'));

// CSV 加上品類
rep("const CSV_HEAD = '姓名,稱呼,手機,生日(月/日),產品,購買日期,金額,幾天用完,備註,VIP';", "const CSV_HEAD = '姓名,稱呼,手機,生日(月/日),品類,產品,購買日期,金額,幾天用完,備註,VIP';");
rep("product: find('產品', '商品'),", "cat: find('品類', '類別'), product: find('產品', '商品'),");
rep("    const product = get(r, 'product');\n    if (product) {", "    const product = get(r, 'product'), catText = get(r, 'cat');\n    if (product || catText) {");
{
  const a = 'c.purchases.push({ id: uid(), date, product,';
  const i = s.indexOf(a); if (i < 0) throw new Error('missing csv push');
  const j = s.indexOf('});', i) + 3;
  s = s.slice(0, i) + part('csvpush.js').trim() + s.slice(j);
}
rep("followUp: '', purchases: [], contacts: [] }; state.customers.push(c); added++;", "followUp: '', purchases: [], contacts: [], samples: [] }; state.customers.push(c); added++;");

// 成果 → 業績用語
{
  const a = s.indexOf('/* ---------- 成果 ---------- */'), b = s.indexOf('/* ---------- 更多 ---------- */');
  let seg = s.slice(a, b).split('成交').join('訂貨');
  seg = seg.replace("關心成果】", "關心與業績】").replace('由「銷售小幫手」整理', '由「雅芳銷售小幫手」整理');
  s = s.slice(0, a) + seg + s.slice(b);
}

between('function renderMore() {', 'function reminderICS() {', part('more.js'));
rep('SUMMARY:💗 打開銷售小幫手，關心今天的顧客', 'SUMMARY:💗 打開雅芳銷售小幫手，關心今天的顧客');
rep("'DESCRIPTION:打開銷售小幫手'", "'DESCRIPTION:打開雅芳銷售小幫手'");
rep('`UID:spc-daily-', '`UID:spca-daily-');
between('function openGuide() {', '/* ---------- 底部面板 ---------- */', part('sheets.js'));
between('/* ---------- 事件 ---------- */', "$('#helpBtn')", part('events.js'));
between('state = load();', 'route();', part('startup.js'));

fs.writeFileSync(file, s);
console.log('patched', s.length, 'chars');
