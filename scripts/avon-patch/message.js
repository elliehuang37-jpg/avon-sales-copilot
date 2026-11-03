function buildMessage(c, f) {
  const set = (TEMPLATES[f.reason] || TEMPLATES.general)[f.tone] || TEMPLATES.general.warm;
  const camp = campaign();
  const vars = {
    c: callName(c), p: f.p, me: state.profile.me || '我', s: f.s, fest: f.fest, tip: CAT_TIP[f.cat] || '',
    no: camp ? `第 ${camp.no} 期` : '新一期', dl: camp ? md(camp.deadline) : '本期截止日', hl: camp && camp.highlight ? camp.highlight : '有不少好物',
  };
  let msg = set[f.idx % set.length].replace(/\{(\w+)\}/g, (m, k) => vars[k] ?? '');
  if (f.tone !== 'short' && state.profile.me && !msg.includes(state.profile.me)) msg += `\n— ${state.profile.me}`;
  return msg;
}
const variants = (reason, tone) => ((TEMPLATES[reason] || TEMPLATES.general)[tone] || []).length;

