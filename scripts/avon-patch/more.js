function renderMore() {
  const p = state.profile;
  const k = campaign();
  $('#v-more').innerHTML = `
    <h2>本期型錄</h2>
    <div class="card menu">
      <button data-act="campaign"><span class="ic">📖</span><span class="grow">${k && !k.expired ? `第 ${esc(k.no)} 期・${md(k.deadline)} 截止` : '設定本期型錄與訂貨截止日'}<br><span class="small muted">${k && k.cycle ? `每 ${k.cycle} 天自動換下一期` : '設定一次，之後自動換期'}</span></span>›</button>
    </div>

    <h2>我的設定</h2>
    <div class="card menu">
      <label style="display:block;padding:8px 4px 14px;border-bottom:1px solid var(--line)"><span class="small" style="font-weight:700">訊息署名（我的名字）</span>
        <input class="search" id="meInput" value="${esc(p.me)}" placeholder="例如：小芳" style="margin-top:6px"></label>
      <div style="padding:14px 4px;border-bottom:1px solid var(--line)"><div class="small" style="font-weight:700;margin-bottom:6px">預設語氣</div>
        <div class="seg" role="group" aria-label="預設語氣">${Object.entries(TONES).map(([t, v]) => `<button data-deftone="${t}" class="${p.tone === t ? 'on' : ''}">${v}</button>`).join('')}</div></div>
      <div style="padding:14px 4px;border-bottom:1px solid var(--line)"><div class="small" style="font-weight:700;margin-bottom:6px">每天推薦關心幾位</div>
        <div class="seg" role="group" aria-label="每天推薦人數">${[3, 5, 8, 12].map(n => `<button data-daily="${n}" class="${p.daily === n ? 'on' : ''}">${n} 位</button>`).join('')}</div></div>
      <label style="display:flex;align-items:center;gap:12px;padding:14px 4px;border-bottom:1px solid var(--line)"><span class="ic">🔠</span><span class="grow">大字模式</span><span class="switch"><input type="checkbox" id="bigSw" ${p.big ? 'checked' : ''}><span></span></span></label>
      <div style="padding:14px 4px"><div class="small" style="font-weight:700;margin-bottom:6px">外觀</div>
        <div class="seg" role="group" aria-label="外觀">${[['auto', '跟著手機'], ['light', '淺色'], ['dark', '深色']].map(([t, v]) => `<button data-theme-set="${t}" class="${p.theme === t ? 'on' : ''}">${v}</button>`).join('')}</div></div>
    </div>

    <h2>APP 與提醒</h2>
    <div class="card menu">
      ${standalone() ? `<div style="display:flex;gap:12px;align-items:center;padding:14px 4px;border-bottom:1px solid var(--line)"><span class="ic">✅</span><span class="grow">已安裝成 APP</span></div>` : `<button data-act="install"><span class="ic">📲</span><span class="grow">安裝到手機桌面</span>›</button>`}
      <button data-act="reminder"><span class="ic">⏰</span><span class="grow">加入每天提醒（行事曆）<br><span class="small muted">每天早上 9 點提醒你打開小幫手</span></span>›</button>
      <button data-act="share-app"><span class="ic">🔗</span><span class="grow">分享給夥伴</span>›</button>
    </div>

    <h2>教學與帶領</h2>
    <div class="card menu">
      <button data-act="guide"><span class="ic">📖</span><span class="grow">3 分鐘學會怎麼用</span>›</button>
      <button data-act="words"><span class="ic">⚖️</span><span class="grow">話術用詞小提醒<br><span class="small muted">哪些話不能說、可以怎麼說</span></span>›</button>
      <button data-act="practice"><span class="ic">🧪</span><span class="grow">載入練習資料<br><span class="small muted">教育訓練、第一次使用時練習</span></span>›</button>
      <button data-act="leader"><span class="ic">🧭</span><span class="grow">給領導人：如何帶夥伴用起來</span>›</button>
    </div>

    <h2>資料</h2>
    <div class="card menu">
      <button data-act="import"><span class="ic">📥</span><span class="grow">匯入顧客名單（CSV）</span>›</button>
      <button data-act="backup"><span class="ic">💾</span><span class="grow">備份資料<br><span class="small muted">換手機前先備份</span></span>›</button>
      <label style="display:flex;gap:12px;align-items:center;padding:14px 4px;border-bottom:1px solid var(--line);cursor:pointer"><span class="ic">♻️</span><span class="grow">從備份還原</span>›<input type="file" id="restoreFile" accept=".json,application/json" class="sr"></label>
      <button data-act="wipe" style="color:var(--brand)"><span class="ic">🗑️</span><span class="grow">清除所有資料</span>›</button>
    </div>
    <p class="small muted" style="margin:16px 4px">🔒 所有顧客資料只存在這支手機的瀏覽器裡，不會上傳到任何伺服器。換手機或清除瀏覽器資料前，記得先備份。</p>
    <p class="small muted" style="margin:0 4px 16px">共 ${state.customers.length} 位顧客・雅芳試點版 1.0</p>`;
  $('#meInput').addEventListener('change', e => { p.me = e.target.value.trim(); save(); toast('已更新署名'); });
  $('#bigSw').addEventListener('change', e => { p.big = e.target.checked; save(); render(); });
  $('#restoreFile').addEventListener('change', async e => {
    const f = e.target.files[0]; if (!f) return;
    try {
      const data = JSON.parse(await f.text());
      if (!Array.isArray(data.customers)) throw new Error('格式不符');
      if (!confirm(`要用備份裡的 ${data.customers.length} 位顧客取代目前的資料嗎？`)) return;
      state = migrate({ ...blank(), ...data, profile: { ...blank().profile, ...data.profile } }); save(); render(); toast('已還原備份');
    } catch (err) { toast('這個檔案不是小幫手的備份檔'); }
  });
}
