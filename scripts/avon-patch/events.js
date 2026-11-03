/* ---------- 事件 ---------- */
function startPractice() {
  state.customers = sampleCustomers(); state.profile.practice = true; state.profile.onboarded = true;
  state.profile.campaign = practiceCampaign();
  save(); closeSheet(); showAll = false; location.hash = '#today'; render();
  toast('已載入練習顧客和第 22 期型錄，點第一位「關心」試試看');
}
document.addEventListener('click', async e => {
  const el = e.target.closest('[data-act],[data-care],[data-cust],[data-send],[data-result],[data-tone],[data-filter],[data-period],[data-later],[data-deftone],[data-daily],[data-theme-set]');
  if (!el) return;
  const d = el.dataset;
  if (d.care) { openCare(d.care, d.reason); return; }
  if (d.cust) { openCustomer(d.cust); return; }
  if (d.send) { send(d.send); return; }
  if (d.result) { pickResult(d.result); return; }
  if (d.later) { finishResult('later', { followUp: addDays(today(), +d.later) }); return; }
  if (d.tone) { flow.tone = d.tone; flow.idx = 0; flow.msg = buildMessage(byId(flow.id), flow); renderCare(); return; }
  if (d.filter) { custFilter = d.filter; renderCustomers(); return; }
  if (d.period) { period = +d.period; renderResults(); return; }
  if (d.deftone) { state.profile.tone = d.deftone; save(); renderMore(); return; }
  if (d.daily) { state.profile.daily = +d.daily; save(); render(); return; }
  if (d.themeSet) { state.profile.theme = d.themeSet; save(); render(); return; }
  switch (d.act) {
    case 'close': closeSheet(); break;
    case 'add': openCustomerForm(); break;
    case 'import': openImport(); break;
    case 'edit': openCustomerForm(d.id); break;
    case 'add-purchase': openPurchaseForm(d.id); break;
    case 'add-sample': openSampleForm(d.id); break;
    case 'back-cust': openCustomer(d.id); break;
    case 'back-care': renderCare(); break;
    case 'delete': {
      const c = byId(d.id);
      if (confirm(`確定要刪除 ${c.name} 和所有紀錄嗎？`)) { state.customers = state.customers.filter(x => x.id !== d.id); save(); closeSheet(); render(); toast('已刪除'); }
      break;
    }
    case 'show-all': showAll = !showAll; renderToday(); break;
    case 'next-variant': flow.idx++; flow.msg = buildMessage(byId(flow.id), flow); $('#msg').value = flow.msg; updateRisk(); break;
    case 'ai-help': openAIHelp(); break;
    case 'copy-prompt': toast((await copy($('#aiPrompt').value)) ? '已複製，打開 AI 貼上就可以' : '請長按指令複製'); break;
    case 'use-ai': { const v = $('#aiBack').value.trim(); if (!v) { toast('請先貼上 AI 寫好的訊息'); break; } flow.msg = v; renderCare(); toast('已放進訊息框，記得把「〇〇」換成本名'); break; }
    case 'save-order':
      finishResult('ordered', { cat: $('#oCat').value, product: $('#oProduct').value.trim(), amount: +$('#oAmount').value || 0, cycle: +$('#oCycle').value || 0 });
      break;
    case 'campaign': openCampaign(); break;
    case 'campaign-clear': if (confirm('要清除本期型錄設定嗎？')) { state.profile.campaign = null; save(); closeSheet(); render(); } break;
    case 'share-catalog': {
      const text = catalogText();
      const hits = riskCheck(text);
      if (hits.length && !confirm(`本期主打裡有「${hits.flatMap(h => h.words).join('、')}」，可能不符合規範。確定還是要分享嗎？`)) break;
      window.open('https://line.me/R/share?text=' + encodeURIComponent(text), '_blank');
      break;
    }
    case 'words': openWords(); break;
    case 'csv-template': download('雅芳顧客名單範本.csv', '﻿' + CSV_HEAD + '\r\n林美惠,美惠姐,0912-345-678,3/15,臉部保養,保濕精華液,2026/10/20,1680,60,敏感肌,V\r\n陳淑芬,,0922-111-222,,髮品,洗髮精,2026/10/05,590,45,,\r\n', 'text/csv;charset=utf-8'); break;
    case 'report-copy': toast((await copy(reportText())) ? '已複製週報' : '請長按文字複製'); break;
    case 'report-line': window.open('https://line.me/R/share?text=' + encodeURIComponent(reportText()), '_blank'); break;
    case 'install': install(); break;
    case 'hide-install': try { localStorage.setItem('spca-hide-install', today()); } catch (err) { /* 無法儲存 */ } render(); break;
    case 'reminder': download('雅芳銷售小幫手每日提醒.ics', reminderICS(), 'text/calendar;charset=utf-8'); toast('打開下載的檔案，按「加入行事曆」就完成了'); break;
    case 'share-app': {
      const url = location.origin + location.pathname;
      const text = '推薦你用「雅芳銷售小幫手」：每天告訴你該關心哪些顧客、訊息幫你寫好、一鍵 LINE 傳送。打開後按「安裝」就能放到手機桌面👇';
      if (navigator.share) { try { await navigator.share({ title: '雅芳銷售小幫手', text, url }); } catch (err) { /* 使用者取消 */ } }
      else window.open('https://line.me/R/share?text=' + encodeURIComponent(text + '\n' + url), '_blank');
      break;
    }
    case 'guide': openGuide(); break;
    case 'leader': openLeader(); break;
    case 'practice':
      if (state.customers.length && !state.profile.practice && !confirm('練習資料會取代目前的顧客資料，建議先備份。確定要載入嗎？')) break;
      startPractice(); break;
    case 'clear-practice':
      if (confirm('要清除練習資料，開始輸入自己的顧客嗎？')) { state.customers = []; state.profile.practice = false; state.profile.campaign = null; save(); render(); openCustomerForm(); }
      break;
    case 'backup': download(`雅芳銷售小幫手備份-${today()}.json`, JSON.stringify(state, null, 1), 'application/json'); toast('已下載備份檔，請存到雲端硬碟或傳給自己'); break;
    case 'wipe':
      if (confirm('確定要清除所有顧客與紀錄嗎？這個動作無法復原，建議先備份。')) { state = blank(); state.profile.onboarded = true; save(); render(); toast('已清除'); }
      break;
    case 'welcome-practice': state.profile.me = $('#wName').value.trim(); startPractice(); break;
    case 'welcome-blank': state.profile.me = $('#wName').value.trim(); state.profile.onboarded = true; save(); closeSheet(); go('customers'); openCustomerForm(); break;
  }
});
