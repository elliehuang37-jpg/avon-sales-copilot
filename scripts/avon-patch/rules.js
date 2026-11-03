/* 本期型錄：設定了「每幾天一期」就自動往下一期跳 */
function campaign(t = today()) {
  const p = state.profile.campaign;
  if (!p || !p.deadline) return null;
  const c = { ...p };
  let rolled = false;
  while (c.cycle > 0 && t > c.deadline) { c.start = addDays(c.deadline, 1); c.deadline = addDays(c.deadline, c.cycle); c.no = (+c.no || 0) + 1; rolled = true; }
  if (rolled) { c.highlight = ''; state.profile.campaign = c; save(); } // 換期後舊的主打不再適用
  return { ...c, expired: t > c.deadline, daysLeft: diff(t, c.deadline), dayIn: diff(c.start, t) };
}
let ctxCache = {};
function ctx(t) {
  if (ctxCache.t !== t || ctxCache.v !== state.profile.campaign) { const camp = campaign(t); ctxCache = { t, v: state.profile.campaign, camp, fest: upcomingFestival(t) }; }
  return ctxCache;
}

function signal(c, t = today()) {
  const { camp, fest } = ctx(t);
  const P = sortDate(c.purchases), C = sortDate(c.contacts), S = sortDate(c.samples || []);
  const lastP = P[P.length - 1], lastC = C[C.length - 1];
  const sinceC = lastC ? diff(lastC.date, t) : 999;
  const sinceP = lastP ? diff(lastP.date, t) : 999;
  const contactedSince = day => C.some(x => x.date >= day);
  const out = [];

  if (c.followUp && c.followUp <= t)
    out.push({ r: 'followup', s: 95, why: c.followUp === t ? '你約好今天再聯絡' : `約好 ${md(c.followUp)} 再聯絡，已經過了 ${diff(c.followUp, t)} 天` });
  if (c.birthday && /^\d{2}-\d{2}$/.test(c.birthday)) {
    const n = daysToBirthday(c.birthday, t);
    if (n <= 7 && !C.some(x => x.reason === 'birthday' && diff(x.date, t) <= 10))
      out.push({ r: 'birthday', s: n === 0 ? 100 : 88 - n * 2, why: n === 0 ? '今天生日 🎂 送上祝福' : `${n} 天後生日（${c.birthday.replace('-', '/')}），先預約祝福` });
  }
  // 型錄節奏：截止前提醒熟客、上架時分享給近半年有買的顧客
  if (camp && !camp.expired && sinceC >= 2 && sinceP <= 180) {
    const orderedThis = P.some(p => p.date >= camp.start) || C.some(x => x.date >= camp.start && x.result === 'ordered');
    if (!orderedThis && camp.daysLeft <= 3 && (P.length >= 2 || c.vip) && !C.some(x => x.date >= camp.start && x.reason === 'deadline'))
      out.push({ r: 'deadline', s: 76 + (3 - camp.daysLeft) * 3, why: camp.daysLeft === 0 ? `第 ${camp.no} 期今天截止，問問要不要一起訂` : `第 ${camp.no} 期 ${md(camp.deadline)} 截止，還有 ${camp.daysLeft} 天` });
    if (camp.dayIn >= 0 && camp.dayIn <= 3 && !contactedSince(camp.start))
      out.push({ r: 'catalog', s: 70 + (c.vip ? 6 : 0), why: `第 ${camp.no} 期型錄剛上架，分享給顧客看看` });
  }
  if (sinceC >= 3) {
    if (lastC && lastC.result === 'noreply' && sinceC <= 14) {
      let k = 0; for (let i = C.length - 1; i >= 0 && C[i].result === 'noreply'; i--) k++;
      if (k < 3) out.push({ r: 'noreply', s: 60, why: `${sinceC} 天前的訊息還沒回覆，輕輕再問一次` });
    }
    const ls = S[S.length - 1];
    if (ls) {
      const k = diff(ls.date, t);
      if (k >= 2 && k <= 7 && !contactedSince(ls.date)) out.push({ r: 'sample', s: 74, why: `${k} 天前送了${ls.item}，問問試用感受`, item: ls.item });
    }
    if (P.length === 1) {
      const k = diff(P[0].date, t);
      if (k >= 3 && k <= 14 && !contactedSince(P[0].date))
        out.push({ r: 'newbie', s: 72, why: `${k} 天前第一次買${pLabel(P[0])}，問問使用感受`, p: pLabel(P[0]), cat: P[0].cat });
    }
    // 每個品類看最近一次購買，挑最接近用完的那一樣
    const latest = {};
    P.forEach(p => { latest[p.cat || 'other'] = p; });
    let best = null;
    Object.values(latest).forEach(p => {
      if (!(p.cycle > 0)) return;
      const due = addDays(p.date, p.cycle), dd = diff(t, due);
      if (dd <= 7 && dd >= -21 && !contactedSince(addDays(due, -10)) && (!best || Math.abs(dd) < Math.abs(best.dd))) best = { p, dd };
    });
    if (best) {
      const n = pLabel(best.p), dd = best.dd;
      out.push({ r: 'refill', s: 84 - Math.abs(dd), why: dd > 0 ? `${n}大約 ${dd} 天後用完` : dd === 0 ? `${n}差不多今天用完` : `${n}應該已經用完 ${-dd} 天了`, p: n, cat: best.p.cat });
    }
    if (lastP) {
      const lim = Math.max((lastP.cycle || 45) * 2, 90);
      if (sinceP >= lim && sinceC >= 30) out.push({ r: 'winback', s: 55 + (c.vip ? 10 : 0), why: `已經 ${sinceP} 天沒有訂貨了`, p: pLabel(lastP), cat: lastP.cat });
    }
    const base = lastC ? lastC.date : lastP ? lastP.date : null;
    if (base && diff(base, t) >= 45 && sinceC >= 45) out.push({ r: 'dormant', s: 45 + (c.vip ? 15 : 0), why: `已經 ${diff(base, t)} 天沒有聯絡了` });
    if (fest && sinceP <= 365 && sinceC >= 7 && !C.some(x => x.reason === 'festival' && diff(x.date, t) <= 20))
      out.push({ r: 'festival', s: 48 + (c.vip ? 12 : 0), why: `${fest.n}（${md(fest.d)}）快到了，推薦送禮組合`, fest: fest.n });
  }
  if (!out.length) return null;
  out.sort((a, b) => b.s - a.s);
  return out[0];
}

