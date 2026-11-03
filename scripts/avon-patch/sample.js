function sampleCustomers() {
  const t = today(), d = n => addDays(t, n);
  const bd = n => { const x = parse(d(n)); return `${pad(x.getMonth() + 1)}-${pad(x.getDate())}`; };
  const mk = (name, o = {}) => ({
    id: uid(), name, nick: o.nick || '', phone: o.phone || '', birthday: o.bd || '', vip: !!o.vip, note: o.note || '', followUp: o.fu != null ? d(o.fu) : '',
    purchases: (o.p || []).map(([dd, cat, product, amount, cycle]) => ({ id: uid(), date: d(dd), cat, product, amount, cycle: cycle ?? catOf(cat).cycle })),
    contacts: (o.c || []).map(([dd, reason, result, amount, channel]) => ({ id: uid(), date: d(dd), reason, result, amount: amount || 0, channel: channel || 'line' })),
    samples: (o.s || []).map(([dd, item]) => ({ id: uid(), date: d(dd), item })),
  });
  return [
    mk('林美惠', { nick: '美惠姐', bd: bd(0), vip: true, phone: '0912-000-101', note: '喜歡保養，常幫同事一起訂', p: [[-80, 'skin', '保濕精華液', 1680], [-40, 'skin', '保濕精華液', 1680]], c: [[-41, 'refill', 'ordered', 1680]] }),
    mk('王小玲', { fu: 0, phone: '0912-000-102', p: [[-50, 'makeup', '口紅禮盒', 1250]], c: [[-6, 'dormant', 'later']] }),
    mk('陳淑芬', { phone: '0912-000-103', p: [[-87, 'hair', '洗髮精', 590], [-42, 'hair', '洗髮精', 590]] }),
    mk('李佩君', { vip: true, phone: '0912-000-104', p: [[-62, 'skin', '保濕乳霜', 980]], c: [[-55, 'newbie', 'replied']] }),
    mk('吳家瑜', { bd: bd(4), phone: '0912-000-105', p: [[-100, 'fragrance', '淡香水', 1500]], c: [[-30, 'general', 'replied']] }),
    mk('林雅芬', { phone: '0912-000-117', p: [[-65, 'deo', '制汗劑', 320], [-35, 'deo', '制汗劑', 320]] }),
    mk('張雅婷', { nick: '雅婷', phone: '0912-000-109', p: [[-9, 'deo', '體香滾珠', 350]], c: [[-8, 'newbie', 'replied']], s: [[-3, '私密潔浴試用包']] }),
    mk('黃怡君', { phone: '0912-000-106', p: [[-15, 'health', '保健膠囊', 1200]], c: [[-5, 'newbie', 'noreply']] }),
    mk('蔡宜蓁', { phone: '0912-000-107', p: [[-4, 'skin', '洗面乳', 450]] }),
    mk('周佳蓉', { phone: '0912-000-115', vip: true, p: [[-90, 'fragrance', '香水', 1500], [-25, 'makeup', '口紅', 650]], c: [[-60, 'general', 'replied']] }),
    mk('劉素珍', { phone: '0912-000-108', p: [[-260, 'skin', '保濕精華液', 1680], [-200, 'skin', '眼霜', 1350]], c: [[-150, 'winback', 'replied']] }),
    mk('楊惠雯', { phone: '0912-000-110', p: [[-63, 'health', '保健膠囊', 1200], [-33, 'health', '保健膠囊', 1200], [-2, 'health', '保健膠囊', 1200]], c: [[-2, 'refill', 'ordered', 1200]] }),
    mk('許文華', { phone: '0912-000-111', p: [[-20, 'intimate', '私密潔浴露', 420]], c: [[-16, 'newbie', 'replied'], [-1, 'catalog', 'replied']] }),
    mk('鄭安琪', { nick: '安琪', phone: '0912-000-112', p: [[-31, 'hair', '洗髮精', 590], [0, 'hair', '洗髮精', 1180]], c: [[0, 'refill', 'ordered', 1180]] }),
    mk('謝秀英', { phone: '0912-000-113', p: [[-70, 'skin', '保濕精華液', 1680], [-4, 'skin', '保濕精華液', 1680]], c: [[-11, 'refill', 'noreply'], [-4, 'refill', 'ordered', 1680]] }),
    mk('郭芳如', { phone: '0912-000-114', p: [[-120, 'skin', '洗面乳', 450]], c: [[-48, 'general', 'noreply'], [-3, 'dormant', 'replied']] }),
    mk('蘇怡萱', { phone: '0912-000-116', p: [[-6, 'health', '保健膠囊', 1200]], c: [[-5, 'newbie', 'replied']] }),
  ];
}
const practiceCampaign = () => ({ no: 22, start: addDays(today(), -1), deadline: addDays(today(), 3), cycle: 14, highlight: '保濕系列與髮品有組合優惠', link: '' });

