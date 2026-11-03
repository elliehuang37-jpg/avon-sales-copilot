/* ---------- 關心流程（三步驟） ---------- */
let flow = null;
const lastSample = c => { const s = sortDate(c.samples || []).pop(); return s ? s.item : ''; };
function openCare(id, forceReason) {
  const c = byId(id); if (!c) return;
  const t = today();
  const todayContact = sortDate(c.contacts).filter(x => x.date === t).pop();
  const s = signal(c, t);
  const reason = forceReason || (todayContact && todayContact.reason) || (s && s.r) || 'general';
  flow = { id, reason, tone: state.profile.tone, idx: 0, contactId: todayContact ? todayContact.id : null, pick: todayContact ? todayContact.result : null };
  applySignal(c, s);
  renderCare();
}
// 依關心理由帶入產品、試用品、節日等話術變數
function applySignal(c, s) {
  const lastP = sortDate(c.purchases).pop();
  const match = s && s.r === flow.reason;
  flow.why = match ? s.why : flow.reason === 'general' ? '找個理由打聲招呼，維繫關係' : REASONS[flow.reason].label;
  flow.p = match && s.p ? s.p : lastP ? pLabel(lastP) : '雅芳的產品';
  flow.cat = match && s.cat ? s.cat : lastP ? lastP.cat : 'other';
  flow.s = match && s.item ? s.item : lastSample(c) || '試用品';
  flow.fest = match && s.fest ? s.fest : (upcomingFestival(today()) || {}).n || '節日';
  flow.msg = buildMessage(c, flow);
}
function updateRisk() { const el = $('#risk'); if (el) el.innerHTML = riskHTML(riskCheck(flow.msg)); }
function renderCare() {
  const c = byId(flow.id);
  const contact = flow.contactId && c.contacts.find(x => x.id === flow.contactId);
  const n = variants(flow.reason, flow.tone);
  openSheet(`
    <div class="sheet-head">${avatar(c)}<h2 id="sheetTitle">關心 ${esc(c.name)} ${c.vip ? '<span class="vip">★</span>' : ''}</h2><button class="icon-btn" data-act="close" aria-label="關閉">✕</button></div>
    <p style="margin:6px 0 0">${chip(flow.reason)} <span class="muted">${esc(flow.why)}</span></p>
    ${c.note ? `<p class="small muted" style="margin:6px 0 0">📝 ${esc(c.note)}</p>` : ''}

    <div class="step"><span class="n">1</span>選一句話（可以直接改）</div>
    <div class="seg" role="group" aria-label="語氣">${Object.entries(TONES).map(([k, v]) => `<button data-tone="${k}" class="${flow.tone === k ? 'on' : ''}">${v}</button>`).join('')}</div>
    <textarea class="msg" id="msg" aria-label="訊息內容" style="margin-top:10px">${esc(flow.msg)}</textarea>
    <div id="risk"></div>
    <div class="row" style="margin-top:8px">
      <button class="btn sm" data-act="next-variant" ${n < 2 ? 'disabled' : ''}>🔄 換一句</button>
      <button class="btn sm" data-act="ai-help">✨ 請 AI 寫得更好</button>
    </div>
    <label class="field" style="margin-top:8px"><span class="muted">換個關心理由</span><select id="reasonSel">
        ${Object.entries(REASONS).map(([k, v]) => `<option value="${k}" ${k === flow.reason ? 'selected' : ''}>${v.emoji} ${v.label}</option>`).join('')}
      </select></label>

    <div class="step"><span class="n">2</span>傳給顧客</div>
    <button class="btn line block" data-send="line">💚 用 LINE 傳送</button>
    <div class="row" style="margin-top:10px">
      <button class="btn" data-send="copy">📋 複製</button>
      ${c.phone ? `<button class="btn" data-send="call">📞 打電話</button><button class="btn" data-send="sms">✉️ 簡訊</button>` : ''}
    </div>
    ${contact ? `<p class="small" style="color:var(--ok);margin:8px 0 0">✓ 今天已用${{ line: ' LINE ', copy: '複製', call: '電話', sms: '簡訊' }[contact.channel] || ''}聯絡</p>` : ''}

    <div class="step"><span class="n">3</span>對方怎麼回應？</div>
    <div class="result-grid">
      ${['replied', 'ordered', 'noreply', 'later'].map(r => `<button data-result="${r}" class="${flow.pick === r ? 'on' : ''}"><span>${RESULTS[r].emoji}</span>${RESULTS[r].label}</button>`).join('')}
    </div>
    <div id="subForm"></div>
    <p class="small muted" style="margin-top:14px">還沒有結果也沒關係，傳完就算完成；之後在「今天已關心」點「記結果」補上。</p>
  `);
  updateRisk();
  $('#msg').addEventListener('input', e => { flow.msg = e.target.value; updateRisk(); });
  $('#reasonSel').addEventListener('change', e => { flow.reason = e.target.value; flow.idx = 0; applySignal(c, signal(c)); renderCare(); });
  if (flow.pick === 'ordered' || flow.pick === 'later') showSub(flow.pick);
}
function ensureContact(channel) {
  const c = byId(flow.id);
  let x = flow.contactId && c.contacts.find(k => k.id === flow.contactId);
  if (!x) { x = { id: uid(), date: today(), reason: flow.reason, channel: channel || 'copy', result: 'sent', amount: 0 }; c.contacts.push(x); flow.contactId = x.id; }
  else { if (channel) x.channel = channel; x.reason = flow.reason; }
  return x;
}
async function send(channel) {
  const f = flow, c = byId(f.id), msg = f.msg;
  const hits = channel === 'call' ? [] : riskCheck(msg);
  if (hits.length && !confirm(`訊息裡有「${hits.flatMap(h => h.words).join('、')}」，可能違反廣告或傳銷相關規範。\n\n建議先修改。確定還是要送出嗎？`)) return;
  const tel = (c.phone || '').replace(/[^\d+]/g, '');
  if (channel === 'line') { await copy(msg); window.open('https://line.me/R/share?text=' + encodeURIComponent(msg), '_blank'); }
  else if (channel === 'copy') { toast((await copy(msg)) ? '已複製，貼到 LINE 或簡訊就可以了' : '無法自動複製，請長按訊息複製'); }
  else if (channel === 'call') location.href = 'tel:' + tel;
  else if (channel === 'sms') location.href = 'sms:' + tel + '?&body=' + encodeURIComponent(msg);
  if (flow !== f) return;
  ensureContact(channel); save(); render();
  if ($('#sheet').classList.contains('on')) renderCare();
  if (channel === 'line') toast('已開啟 LINE，選好對象就能送出（訊息也已複製）');
}
function pickResult(r) {
  flow.pick = r;
  document.querySelectorAll('[data-result]').forEach(b => b.classList.toggle('on', b.dataset.result === r));
  if (r === 'ordered' || r === 'later') { showSub(r); return; }
  finishResult(r);
}
function showSub(r) {
  const c = byId(flow.id);
  const lastP = sortDate(c.purchases).pop();
  const box = $('#subForm');
  if (r === 'later') {
    box.innerHTML = `<div class="card" style="margin-top:12px"><b>什麼時候再聯絡？</b>
      <div class="row" style="margin-top:10px">${[[1, '明天'], [3, '3 天後'], [7, '下週']].map(([n, l]) => `<button class="btn sm" data-later="${n}">${l}</button>`).join('')}</div>
      <label class="field"><span>或選日期</span><input type="date" id="laterDate" min="${addDays(today(), 1)}"></label></div>`;
    $('#laterDate').addEventListener('change', e => e.target.value && finishResult('later', { followUp: e.target.value }));
  } else {
    const cat = flow.cat || (lastP ? lastP.cat : 'skin');
    box.innerHTML = `<div class="card" style="margin-top:12px"><b>太好了 🎉 記一下訂了什麼</b>
      <label class="field"><span>品類</span>${catSelect('id="oCat"', cat)}</label>
      <label class="field"><span>產品名稱（可不填）</span><input id="oProduct" list="productList" value="${esc(lastP && lastP.cat === cat ? lastP.product : '')}" placeholder="例如：保濕精華液"></label>
      <div class="field-row"><label class="field"><span>金額</span><input id="oAmount" type="number" inputmode="numeric" min="0" placeholder="例如 1680" value="${lastP && lastP.cat === cat ? lastP.amount || '' : ''}"></label>
      <label class="field"><span>大約多久用完</span><select id="oCycle">${CYCLES.map(([v, l]) => `<option value="${v}" ${catOf(cat).cycle === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label></div>
      ${productDatalist()}
      <button class="btn primary block" style="margin-top:14px" data-act="save-order">記下這筆訂貨</button></div>`;
    $('#oCat').addEventListener('change', e => { $('#oCycle').value = catOf(e.target.value).cycle; $('#oProduct').value = ''; $('#oAmount').value = ''; });
    $('#oAmount').focus();
  }
  box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
function finishResult(r, extra = {}) {
  if (!flow) return;
  const c = byId(flow.id);
  const x = ensureContact();
  x.result = r;
  c.followUp = r === 'later' ? extra.followUp : '';
  if (r === 'ordered') {
    x.amount = extra.amount || 0;
    c.purchases.push({ id: uid(), date: today(), cat: extra.cat || 'other', product: extra.product || '', amount: extra.amount || 0, cycle: extra.cycle || 0 });
  }
  flow = null; save(); closeSheet(); render();
  const p = plan();
  const left = p.todo.slice(0, Math.max(0, state.profile.daily - p.done.length)).length;
  const msg = r === 'replied' ? '記下了！有回覆就是好的開始 💬' : r === 'ordered' ? `太棒了，訂貨 ${money(extra.amount)} 🎉`
    : r === 'noreply' ? '沒關係，過幾天我會提醒你再問一次' : `好的，${md(extra.followUp)} 會提醒你`;
  toast(left ? `${msg}　還有 ${left} 位` : `${msg}　今天的關心完成了！`);
}

/* AI 協助：產生去識別的提示詞，複製後打開常用 AI 工具 */
function openAIHelp() {
  const c = byId(flow.id);
  const lastP = sortDate(c.purchases).pop();
  const camp = campaign();
  const prompt = `你是一位熟悉台灣雅芳產品、說話親切的美容顧問助理。請幫我寫一則要用 LINE 傳給顧客的訊息。
・顧客稱呼：${callName(c).slice(0, 1)}〇〇（送出前我會自己換成本名）
・關心原因：${REASONS[flow.reason].label}——${flow.why}
・上次購買：${lastP ? `${pLabel(lastP)}（${catOf(lastP.cat).label}，${diff(lastP.date, today())} 天前）` : '尚未購買'}
${camp && !camp.expired ? `・本期型錄：第 ${camp.no} 期，${md(camp.deadline)} 截止${camp.highlight ? `，主打「${camp.highlight}」` : ''}\n` : ''}・顧客特性：${c.vip ? '長期支持的 VIP，' : ''}${c.note ? c.note.replace(/\d{6,}/g, '***') : '無特別備註'}
・語氣：${TONES[flow.tone]}，像姐妹聊天，不要硬推銷
・長度：60 字以內，可以用 1～2 個表情符號
・結尾：用一個容易回答的問題收尾
・規範：遵守台灣化粧品與食品廣告規定，不提療效、不寫「保證、最有效、100%」等絕對用語
請給我 3 個不同版本，並各用一句話說明適合什麼情況。`;
  openSheet(`
    <div class="sheet-head"><h2 id="sheetTitle">✨ 請 AI 幫忙寫</h2><button class="icon-btn" data-act="back-care" aria-label="返回">←</button></div>
    <ol class="steps-guide">
      <li><div>按「複製指令」，我已經把情境整理好，<b>不含電話與全名</b>。</div></li>
      <li><div>打開你常用的 AI，貼上指令送出。</div></li>
      <li><div>挑一個喜歡的版本，複製回來貼到下面。</div></li>
    </ol>
    <textarea class="msg" id="aiPrompt" aria-label="給 AI 的指令" style="min-height:220px">${esc(prompt)}</textarea>
    <button class="btn primary block" style="margin-top:10px" data-act="copy-prompt">📋 複製指令</button>
    <div class="row" style="margin-top:10px">
      <a class="btn sm" href="https://chatgpt.com/" target="_blank" rel="noopener">ChatGPT</a>
      <a class="btn sm" href="https://gemini.google.com/app" target="_blank" rel="noopener">Gemini</a>
      <a class="btn sm" href="https://claude.ai/new" target="_blank" rel="noopener">Claude</a>
    </div>
    <label class="field"><span>把 AI 寫好的訊息貼在這裡</span><textarea id="aiBack" placeholder="貼上後按「用這句」"></textarea></label>
    <button class="btn block" style="margin-top:10px" data-act="use-ai">用這句</button>
  `);
}

