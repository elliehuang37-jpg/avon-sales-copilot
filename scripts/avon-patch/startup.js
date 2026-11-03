// 舊資料補上品類與試用欄位
function migrate(s) {
  s.customers.forEach(c => {
    c.samples = c.samples || [];
    c.purchases.forEach(p => { if (!p.cat) p.cat = guessCat(p.product); });
  });
  return s;
}
state = migrate(load());
if (demo) {
  document.documentElement.classList.add('demo');
  state = blank();
  state.profile = { ...state.profile, me: '小芳', onboarded: true, practice: true, campaign: practiceCampaign() };
  state.customers = sampleCustomers();
}
