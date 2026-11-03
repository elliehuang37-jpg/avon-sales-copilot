/* ---------- 今天 ---------- */
let showAll = false;
function greeting() { const h = new Date().getHours(); return h < 11 ? '早安' : h < 18 ? '午安' : '晚安'; }
function campaignBar() {
  const k = campaign();
  if (!k) return `<div class="camp"><span class="e">📖</span><span class="grow"><b>設定本期型錄與訂貨截止日</b><br><span class="small muted">小幫手就會提醒你推新型錄、截止前提醒熟客訂貨</span></span><button class="btn sm primary" data-act="campaign">設定</button></div>`;
  if (k.expired) return `<div class="camp urgent"><span class="e">📖</span><span class="grow"><b>第 ${esc(k.no)} 期已經截止</b><br><span class="small muted">設定下一期，提醒才會繼續</span></span><button class="btn sm primary" data-act="campaign">設定</button></div>`;
  return `<div class="camp ${k.daysLeft <= 1 ? 'urgent' : ''}"><span class="e">📖</span><span class="grow"><b>第 ${esc(k.no)} 期型錄</b><br>${k.daysLeft === 0 ? '<b>今天訂貨截止</b>' : `訂貨截止 ${md(k.deadline)}（${WEEK[parse(k.deadline).getDay()]}），還有 <b>${k.daysLeft}</b> 天`}
    ${k.highlight ? `<br><span class="small muted">本期主打：${esc(k.highlight)}</span>` : ''}</span>
    <span class="col"><button class="btn sm line" data-act="share-catalog">分享型錄</button><button class="btn sm ghost" data-act="campaign">修改</button></span></div>`;
}
function renderToday() {
  const { done, todo } = plan();
  const daily = state.profile.daily;
  const shown = showAll ? todo : todo.slice(0, Math.max(0, daily - done.length));
  const total = shown.length + done.length;
  const pct = total ? done.length / total : 0;
  const C = 2 * Math.PI * 32;
  const me = state.profile.me ? `，${esc(state.profile.me)}` : '';
  let html = `<div class="stack">`;
  if (state.profile.practice && !demo) html += `<div class="banner"><span>🧪</span><span class="grow">目前是<b>練習資料</b>，可以放心按按看。</span><button class="btn sm" data-act="clear-practice">開始用真的</button></div>`;
  html += installBanner();
  html += `<div class="card hero">
    <div class="ring" role="img" aria-label="今天完成 ${done.length} 位，共 ${total} 位">
      <svg viewBox="0 0 76 76"><circle cx="38" cy="38" r="32" fill="none" stroke="rgba(255,255,255,.3)" stroke-width="8"/>
      <circle cx="38" cy="38" r="32" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - pct)}"/></svg>
      <b>${done.length}/${total}</b></div>
    <div><h1>${greeting()}${me}！</h1>
    <p>${!state.customers.length ? '先加入幾位顧客，我就能幫你安排每天要關心誰。' : shown.length ? `今天有 <b>${shown.length}</b> 位顧客等你關心，一位只要 1 分鐘。` : done.length ? '今天的關心都完成了，你真的很棒！' : '今天沒有需要特別關心的顧客，可以休息一下 ☕'}</p></div>
  </div>`;
  html += campaignBar();

  if (!state.customers.length) {
    html += `<div class="card empty"><div class="big">👥</div><p>還沒有顧客資料</p>
      <div class="stack"><button class="btn primary block" data-act="add">＋ 新增第一位顧客</button>
      <button class="btn block" data-act="practice">用練習資料試試看</button></div></div>`;
  } else {
    if (shown.length) {
      html += `<h2>今天要關心</h2><div>`;
      html += shown.map(x => `<button class="task" data-care="${x.c.id}">
        ${avatar(x.c)}<span class="mid"><span class="name">${esc(x.c.name)} ${x.c.vip ? '<span class="vip" title="VIP">★</span>' : ''}</span>
        <span class="why">${chip(x.r)} ${esc(x.why)}</span></span><span class="go">關心</span></button>`).join('');
      html += `</div>`;
    }
    const rest = todo.length - shown.length;
    if (rest > 0) html += `<button class="btn ghost more-toggle" data-act="show-all">還有 ${rest} 位可以關心，看全部</button>`;
    else if (showAll && todo.length > daily) html += `<button class="btn ghost more-toggle" data-act="show-all">只看今天推薦的</button>`;
    if (!shown.length && done.length) html += `<div class="card celebrate"><div class="big">🎉</div><b>今天的關心任務完成！</b><p class="muted small">每天一點點，顧客會記得你的用心。</p></div>`;
    if (done.length) {
      html += `<h2>今天已關心 ${done.length} 位</h2><div>`;
      html += done.map(({ c, x }) => `<button class="task done" data-care="${c.id}" data-reason="${x.reason}">
        ${avatar(c)}<span class="mid"><span class="name">${esc(c.name)}</span><span class="why">${RESULTS[x.result].emoji} ${RESULTS[x.result].label}${x.amount ? '・' + money(x.amount) : ''}</span></span>
        <span class="go">${x.result === 'sent' ? '記結果' : '✓'}</span></button>`).join('');
      html += `</div>`;
    }
    html += `<p class="muted small" style="margin-top:18px">💡 推薦順序：生日 → 約好再聯絡 → 該回購 → 訂貨截止 → 試用回訪 → 首購關心 → 新型錄 → 再問一次 → 久沒聯絡的老顧客。</p>`;
  }
  html += `</div>`;
  $('#v-today').innerHTML = html;
}

