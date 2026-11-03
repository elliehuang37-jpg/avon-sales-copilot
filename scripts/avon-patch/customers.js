/* ---------- 顧客 ---------- */
let custFilter = 'all', custQuery = '';
function lastInfo(c) {
  const lp = sortDate(c.purchases).pop();
  if (!lp) return '還沒有訂貨紀錄';
  const k = diff(lp.date, today());
  return `${catOf(lp.cat).emoji} 上次買${pLabel(lp)}・${k === 0 ? '今天' : k + ' 天前'}`;
}
function renderCustomers() {
  const t = today();
  const q = custQuery.trim();
  let list = state.customers.map(c => ({ c, s: signal(c, t) }));
  if (q) list = list.filter(({ c }) => (c.name + c.nick + c.phone + c.note + c.purchases.map(pLabel).join('')).includes(q));
  if (custFilter === 'vip') list = list.filter(({ c }) => c.vip);
  if (custFilter === 'care') list = list.filter(({ s }) => s);
  if (custFilter === 'new') list = list.filter(({ c }) => c.purchases.length <= 1);
  if (CATS.some(k => k.k === custFilter)) list = list.filter(({ c }) => c.purchases.some(p => p.cat === custFilter));
  list.sort((a, b) => (b.s ? b.s.s : 0) - (a.s ? a.s.s : 0) || a.c.name.localeCompare(b.c.name, 'zh-Hant'));
  const prev = document.activeElement && document.activeElement.id === 'q';
  const filters = [['all', `全部 ${state.customers.length}`], ['care', '需要關心'], ['vip', '★ VIP'], ['new', '新客'], ...CATS.slice(0, 7).map(k => [k.k, `${k.emoji} ${k.label}`])];
  $('#v-customers').innerHTML = `
    <div class="row" style="margin-top:8px"><button class="btn primary" data-act="add">＋ 新增顧客</button><button class="btn" data-act="import" style="flex:0 0 auto">📥 匯入名單</button></div>
    <input class="search" id="q" type="search" placeholder="🔍 搜尋姓名、電話、產品" value="${esc(custQuery)}" style="margin-top:12px" aria-label="搜尋顧客">
    <div class="chips" role="group" aria-label="篩選">${filters.map(([k, l]) => `<button data-filter="${k}" class="${custFilter === k ? 'on' : ''}">${l}</button>`).join('')}</div>
    <div class="card" style="padding:4px 14px;margin-top:8px">
      ${list.length ? list.map(({ c, s }) => `<button class="list-item" data-cust="${c.id}">${avatar(c)}
        <span class="mid"><b>${esc(c.name)}</b> ${c.vip ? '<span class="vip">★</span>' : ''}<br><span class="small muted">${esc(lastInfo(c))}</span></span>
        ${s ? chip(s.r) : ''}</button>`).join('') : `<div class="empty"><div class="big">🔍</div><p class="muted">${state.customers.length ? '找不到符合的顧客' : '還沒有顧客，按上面的「新增顧客」開始'}</p></div>`}
    </div>`;
  const qi = $('#q');
  qi.addEventListener('input', e => { custQuery = e.target.value; renderCustomers(); });
  if (prev) { qi.focus(); qi.setSelectionRange(qi.value.length, qi.value.length); }
}

function productDatalist() {
  const set = new Set(); state.customers.forEach(c => c.purchases.forEach(p => p.product && set.add(p.product)));
  return `<datalist id="productList">${[...set].map(p => `<option value="${esc(p)}">`).join('')}</datalist>`;
}
function openCustomer(id) {
  const c = byId(id); if (!c) return;
  const s = signal(c);
  const events = [
    ...c.purchases.map(p => ({ date: p.date, html: `🛍️ 訂了 <b>${esc(pLabel(p))}</b>${p.product ? ` <span class="muted small">${catOf(p.cat).label}</span>` : ''}${p.amount ? ' ' + money(p.amount) : ''}`, cls: 'buy' })),
    ...(c.samples || []).map(x => ({ date: x.date, html: `🎁 送試用：${esc(x.item)}`, cls: '' })),
    ...c.contacts.map(x => ({ date: x.date, html: `${REASONS[x.reason] ? REASONS[x.reason].emoji + ' ' + REASONS[x.reason].label : '聯絡'} → ${RESULTS[x.result] ? RESULTS[x.result].label : ''}`, cls: '' })),
  ].sort((a, b) => (a.date < b.date ? 1 : -1));
  const total = c.purchases.reduce((a, p) => a + (+p.amount || 0), 0);
  const cats = [...new Set(c.purchases.map(p => p.cat))].map(k => `${catOf(k).emoji} ${catOf(k).label}`).join('、');
  openSheet(`
    <div class="sheet-head">${avatar(c)}<h2 id="sheetTitle">${esc(c.name)} ${c.vip ? '<span class="vip">★</span>' : ''}</h2><button class="icon-btn" data-act="close" aria-label="關閉">✕</button></div>
    ${s ? `<div class="tip" style="margin-top:8px">${chip(s.r)} ${esc(s.why)}</div>` : ''}
    <button class="btn primary block" style="margin-top:12px" data-care="${c.id}">💗 立即關心</button>
    <div class="row" style="margin-top:10px">
      <button class="btn" data-act="add-purchase" data-id="${c.id}">＋ 訂貨紀錄</button>
      <button class="btn" data-act="add-sample" data-id="${c.id}">🎁 送試用</button>
    </div>
    <div class="card" style="margin-top:14px"><dl class="kv">
      ${c.nick ? `<dt>稱呼</dt><dd>${esc(c.nick)}</dd>` : ''}
      <dt>電話</dt><dd>${c.phone ? `<a href="tel:${esc(c.phone.replace(/[^\d+]/g, ''))}">${esc(c.phone)}</a>` : '<span class="muted">未填</span>'}</dd>
      <dt>生日</dt><dd>${c.birthday ? c.birthday.replace('-', ' 月 ') + ' 日' : '<span class="muted">未填</span>'}</dd>
      <dt>累計訂貨</dt><dd>${c.purchases.length} 筆・${money(total)}</dd>
      ${cats ? `<dt>常買品類</dt><dd>${cats}</dd>` : ''}
      ${c.followUp ? `<dt>約好聯絡</dt><dd>${md(c.followUp)}</dd>` : ''}
      ${c.note ? `<dt>備註</dt><dd>${esc(c.note)}</dd>` : ''}
    </dl></div>
    <h3>往來紀錄</h3>
    ${events.length ? `<div class="timeline">${events.map(e => `<div class="ev ${e.cls}"><span class="muted small">${md(e.date)}</span>　${e.html}</div>`).join('')}</div>` : '<p class="muted">還沒有紀錄</p>'}
    <div class="row" style="margin-top:18px"><button class="btn" data-act="edit" data-id="${c.id}">✏️ 編輯資料</button><button class="btn ghost" data-act="delete" data-id="${c.id}" style="color:var(--brand)">🗑️ 刪除</button></div>
  `);
}
function bindCatCycle(form) {
  form.querySelector('[name=cat]').addEventListener('change', e => { form.querySelector('[name=cycle]').value = catOf(e.target.value).cycle; });
}
function purchaseFields(lp) {
  const cat = lp ? lp.cat : 'skin';
  return `<label class="field"><span>品類</span>${catSelect('name="cat"', cat)}</label>
      <label class="field"><span>產品名稱（可不填）</span><input name="product" list="productList" value="${esc(lp ? lp.product : '')}" placeholder="例如：保濕精華液"></label>
      <div class="field-row">
        <label class="field"><span>日期</span><input name="date" type="date" value="${today()}" max="${today()}"></label>
        <label class="field"><span>金額</span><input name="amount" type="number" inputmode="numeric" min="0" placeholder="1680"></label>
      </div>
      <label class="field"><span>大約多久用完</span><select name="cycle">${CYCLES.map(([v, l]) => `<option value="${v}" ${v === (lp ? lp.cycle : catOf(cat).cycle) ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
      ${productDatalist()}`;
}
const purchaseFrom = f => ({ id: uid(), date: f.date || today(), cat: f.cat || guessCat(f.product), product: (f.product || '').trim(), amount: +f.amount || 0, cycle: +f.cycle || 0 });
function openCustomerForm(id) {
  const c = id ? byId(id) : null;
  const [bm, bd] = c && c.birthday ? c.birthday.split('-') : ['', ''];
  openSheet(`
    <div class="sheet-head"><h2 id="sheetTitle">${c ? '編輯顧客' : '新增顧客'}</h2><button class="icon-btn" data-act="close" aria-label="關閉">✕</button></div>
    <form id="custForm" autocomplete="off">
      <label class="field"><span>姓名 *</span><input name="name" required value="${esc(c ? c.name : '')}" placeholder="例如：林美惠"></label>
      <div class="field-row">
        <label class="field"><span>平常怎麼稱呼</span><input name="nick" value="${esc(c ? c.nick : '')}" placeholder="例如：美惠姐"></label>
        <label class="field"><span>手機</span><input name="phone" type="tel" inputmode="tel" value="${esc(c ? c.phone : '')}" placeholder="0912-345-678"></label>
      </div>
      <div class="field-row">
        <label class="field"><span>生日（月）</span><select name="bm"><option value="">—</option>${Array.from({ length: 12 }, (_, i) => `<option ${+bm === i + 1 ? 'selected' : ''}>${i + 1}</option>`).join('')}</select></label>
        <label class="field"><span>生日（日）</span><select name="bd"><option value="">—</option>${Array.from({ length: 31 }, (_, i) => `<option ${+bd === i + 1 ? 'selected' : ''}>${i + 1}</option>`).join('')}</select></label>
      </div>
      ${c ? '' : `<h3>最近一次訂貨（可以先不填）</h3><label class="check" style="margin-top:0"><input type="checkbox" name="hasP" checked> 有訂過貨</label>${purchaseFields(null)}`}
      <label class="field"><span>備註（膚質、喜好、家人）</span><textarea name="note" placeholder="例如：敏感肌、喜歡玫瑰香">${esc(c ? c.note : '')}</textarea></label>
      <label class="check"><input type="checkbox" name="vip" ${c && c.vip ? 'checked' : ''}> ★ 重要顧客（VIP）</label>
      <button class="btn primary block" style="margin-top:18px" type="submit">${c ? '儲存' : '加入顧客'}</button>
    </form>
  `);
  const form = $('#custForm');
  if (!c) bindCatCycle(form);
  form.addEventListener('submit', e => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    const name = f.name.trim(); if (!name) return;
    const birthday = f.bm && f.bd ? `${pad(f.bm)}-${pad(f.bd)}` : '';
    if (c) {
      Object.assign(c, { name, nick: f.nick.trim(), phone: f.phone.trim(), birthday, note: f.note.trim(), vip: !!f.vip });
      save(); render(); openCustomer(c.id); toast('已儲存');
    } else {
      const nc = { id: uid(), name, nick: f.nick.trim(), phone: f.phone.trim(), birthday, note: f.note.trim(), vip: !!f.vip, followUp: '', purchases: [], contacts: [], samples: [] };
      if (f.hasP) nc.purchases.push(purchaseFrom(f));
      state.customers.push(nc); save(); closeSheet(); render();
      toast(`已加入 ${name}`, '再新增一位', () => openCustomerForm());
    }
  });
  if (!c) setTimeout(() => $('#custForm [name=name]').focus(), 250);
}
function openPurchaseForm(id) {
  const c = byId(id);
  openSheet(`
    <div class="sheet-head"><h2 id="sheetTitle">${esc(c.name)} 的訂貨紀錄</h2><button class="icon-btn" data-act="back-cust" data-id="${c.id}" aria-label="返回">←</button></div>
    <form id="pForm">${purchaseFields(sortDate(c.purchases).pop())}
      <button class="btn primary block" style="margin-top:18px" type="submit">儲存</button>
    </form>`);
  const form = $('#pForm');
  bindCatCycle(form);
  form.addEventListener('submit', e => {
    e.preventDefault();
    c.purchases.push(purchaseFrom(Object.fromEntries(new FormData(e.target))));
    save(); render(); openCustomer(c.id); toast('已記下訂貨紀錄');
  });
}
function openSampleForm(id) {
  const c = byId(id);
  openSheet(`
    <div class="sheet-head"><h2 id="sheetTitle">🎁 送 ${esc(c.name)} 試用品</h2><button class="icon-btn" data-act="back-cust" data-id="${c.id}" aria-label="返回">←</button></div>
    <form id="sForm">
      <label class="field"><span>試用品 *</span><input name="item" required list="sampleList" placeholder="例如：保濕精華試用包"></label>
      <datalist id="sampleList">${CATS.slice(0, 7).map(k => `<option value="${k.label.split('／')[0]}試用包">`).join('')}</datalist>
      <label class="field"><span>哪一天送的</span><input name="date" type="date" value="${today()}" max="${today()}"></label>
      <p class="small muted">送出後第 2～7 天，小幫手會提醒你問問試用感受。</p>
      <button class="btn primary block" style="margin-top:12px" type="submit">記下來</button>
    </form>`);
  $('#sForm').addEventListener('submit', e => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    (c.samples = c.samples || []).push({ id: uid(), date: f.date || today(), item: f.item.trim() });
    save(); render(); openCustomer(c.id); toast('記下了，過兩天會提醒你回訪');
  });
}

