function openGuide() {
  openSheet(`
    <div class="sheet-head"><h2 id="sheetTitle">📖 3 分鐘學會</h2><button class="icon-btn" data-act="close" aria-label="關閉">✕</button></div>
    <p>每天只要做一件事：<b>打開「今天」，把名單上的顧客一位一位關心完。</b></p>
    <ol class="steps-guide">
      <li><div><b>先設定本期型錄</b><br><span class="muted small">填上期別和訂貨截止日，小幫手會在上架時提醒你分享、截止前提醒熟客訂貨。</span></div></li>
      <li><div><b>看今天要關心誰</b><br><span class="muted small">生日、該回購、訂貨截止、試用回訪、新顧客、太久沒聯絡的，都會自動挑出來。</span></div></li>
      <li><div><b>點「關心」→ 選一句話</b><br><span class="muted small">訊息已經寫好，不喜歡就按「換一句」或換語氣，也可以直接改字。</span></div></li>
      <li><div><b>按「用 LINE 傳送」</b><br><span class="muted small">選好顧客就送出。訊息裡如果有不適合的用詞，小幫手會先提醒你。</span></div></li>
      <li><div><b>記下對方怎麼回應</b><br><span class="muted small">有回覆、有訂貨、還沒回、改天再聯絡。小幫手會照結果安排下一次提醒。</span></div></li>
    </ol>
    <div class="tip">💡 送試用品時，到顧客資料按「🎁 送試用」記一下，過兩天小幫手就會提醒你回訪。</div>
    <button class="btn primary block" style="margin-top:16px" data-act="close">知道了，開始吧</button>`);
}
function openWords() {
  openSheet(`
    <div class="sheet-head"><h2 id="sheetTitle">⚖️ 話術用詞小提醒</h2><button class="icon-btn" data-act="close" aria-label="關閉">✕</button></div>
    <p class="small muted">傳訊息時如果出現下面這些字，小幫手會跳出提醒。這是提醒，不是法律意見；有疑問請洽公司。</p>
    ${RISK.map(r => `<div class="card" style="margin-top:12px"><b>${esc(r.why)}</b>
      <p class="small" style="margin:8px 0 0">❌ 例如：${esc(r.ex)}</p>
      <p class="small" style="margin:6px 0 0">✅ ${esc(r.fix)}</p></div>`).join('')}
    <div class="tip" style="margin-top:14px">💡 最安全的說法：分享<b>自己的使用感受</b>，邀請對方<b>先試用看看</b>。</div>`);
}
function openLeader() {
  openSheet(`
    <div class="sheet-head"><h2 id="sheetTitle">🧭 給領導人：帶夥伴用起來</h2><button class="icon-btn" data-act="close" aria-label="關閉">✕</button></div>
    <h3>第 1 週：陪伴安裝</h3>
    <ol class="steps-guide">
      <li><div>在聚會或線上會議，請夥伴用手機打開連結，當場一起按「安裝」，並開好<b>大字模式</b>。</div></li>
      <li><div>一起設定<b>本期型錄與截止日</b>，再載入練習資料，帶大家走完一位顧客的三步驟。</div></li>
      <li><div>回家作業：清除練習資料，輸入自己最常聯絡的 5 位顧客。</div></li>
    </ol>
    <h3>第 2～4 週：養成習慣</h3>
    <ol class="steps-guide">
      <li><div>每天早上在群組提醒：「打開小幫手，關心今天的 3 位顧客」。</div></li>
      <li><div>型錄上架當天，提醒大家按「分享型錄」；截止前 3 天，提醒大家看「訂貨截止」名單。</div></li>
      <li><div>每週請夥伴在「業績」按「LINE 傳送」回報，表揚<b>連續行動天數</b>和<b>回應率</b>，不只看訂貨金額。</div></li>
    </ol>
    <h3>新人特別照顧</h3>
    <ul>
      <li>新人入會第一週就帶他安裝，第一張訂單從親友開始，用「首購關心」和「試用回訪」練習開口。</li>
      <li>新人的第 2 個月最容易斷掉，這時多看他的成果週報、多鼓勵。</li>
      <li>提醒夥伴：分享使用感受，不談療效、不談收入。可以一起看「話術用詞小提醒」。</li>
    </ul>
    <button class="btn line block" data-act="share-app">💚 把小幫手分享到團隊群組</button>`);
}
function openWelcome() {
  openSheet(`
    <div style="text-align:center;padding:14px 4px 4px"><img src="icons/icon-192.png" alt="AVON" width="84" height="84" style="border-radius:16px"></div>
    <h2 id="sheetTitle" style="text-align:center;margin-top:10px">嗨！我是你的雅芳銷售小幫手</h2>
    <ol class="steps-guide">
      <li><div><b>每天告訴你該關心誰</b><br><span class="muted small">生日、該回購、型錄上架、訂貨截止，我會自動幫你挑出來。</span></div></li>
      <li><div><b>幫你想好要說的話</b><br><span class="muted small">一鍵用 LINE 傳出去，不適合的用詞會先提醒你。</span></div></li>
      <li><div><b>記下結果，看見成果</b><br><span class="muted small">每週一鍵回報給領導人。</span></div></li>
    </ol>
    <label class="field"><span>你希望訊息怎麼署名？</span><input id="wName" placeholder="例如：小芳" value="${esc(state.profile.me)}"></label>
    <button class="btn primary block" style="margin-top:16px" data-act="welcome-practice">先用練習資料試試看</button>
    <button class="btn block" style="margin-top:10px" data-act="welcome-blank">直接輸入我的顧客</button>
    <p class="small muted" style="text-align:center">🔒 資料只存在你的手機，不會上傳</p>`, { locked: true });
}
function openCampaign() {
  const cur = campaign() || state.profile.campaign || { no: '', start: today(), deadline: addDays(today(), 13), cycle: 14, highlight: '', link: '' };
  openSheet(`
    <div class="sheet-head"><h2 id="sheetTitle">📖 本期型錄與訂貨截止</h2><button class="icon-btn" data-act="close" aria-label="關閉">✕</button></div>
    <p class="small muted">設定一次就好。選了「每幾天一期」，期別和截止日會自動跳到下一期。</p>
    <form id="campForm">
      <div class="field-row">
        <label class="field"><span>期別</span><input name="no" type="number" inputmode="numeric" min="1" required value="${esc(cur.no)}" placeholder="例如 22"></label>
        <label class="field"><span>每幾天一期</span><select name="cycle">${[[0, '不自動換期'], [14, '14 天'], [21, '21 天'], [28, '28 天']].map(([v, l]) => `<option value="${v}" ${+cur.cycle === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
      </div>
      <div class="field-row">
        <label class="field"><span>本期開始</span><input name="start" type="date" required value="${esc(cur.start)}"></label>
        <label class="field"><span>訂貨截止</span><input name="deadline" type="date" required value="${esc(cur.deadline)}"></label>
      </div>
      <label class="field"><span>本期主打（一句話，可不填）</span><input name="highlight" value="${esc(cur.highlight || '')}" placeholder="例如：保濕系列有組合優惠"></label>
      <div id="campRisk"></div>
      <label class="field"><span>電子型錄連結（可不填）</span><input name="link" type="url" inputmode="url" value="${esc(cur.link || '')}" placeholder="https://"></label>
      <button class="btn primary block" style="margin-top:18px" type="submit">儲存</button>
      ${state.profile.campaign ? '<button type="button" class="btn ghost block" style="margin-top:8px" data-act="campaign-clear">清除型錄設定</button>' : ''}
    </form>`);
  const form = $('#campForm');
  form.highlight.addEventListener('input', e => { $('#campRisk').innerHTML = riskHTML(riskCheck(e.target.value)); });
  form.addEventListener('submit', e => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    if (f.deadline < f.start) { toast('截止日要在開始日之後'); return; }
    state.profile.campaign = { no: +f.no || 1, start: f.start, deadline: f.deadline, cycle: +f.cycle || 0, highlight: f.highlight.trim(), link: f.link.trim() };
    save(); closeSheet(); render(); toast(`已設定第 ${state.profile.campaign.no} 期`);
  });
}
function catalogText() {
  const k = campaign();
  return `雅芳第 ${k.no} 期型錄來囉！${k.highlight ? `本期主打：${k.highlight}。` : ''}有喜歡的跟我說，${md(k.deadline)} 前都可以幫你訂😊${k.link ? '\n' + k.link : ''}${state.profile.me ? `\n— ${state.profile.me}` : ''}`;
}

