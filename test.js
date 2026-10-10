'use strict';
const e = require('./engine.js');
const cases = require('./expected.json');
let checks = 0, fails = 0;
function eq(a, b, label) {
  checks++;
  if (a !== b) { fails++; console.log('FAIL', label, 'engine:', a, 'oracle:', b); }
}
for (const c of cases) {
  let r, text;
  if (c.tool === 'batch') { r = e.batchScale(...c.args); text = e.renderBatch(r); }
  else if (c.tool === 'ice') { r = e.iceMelt(...c.args); text = e.renderIce(r); }
  else { r = e.ratioSplit(...c.args); text = e.renderRatio(r); }
  const keys = new Set([...Object.keys(r), ...Object.keys(c.expect)]);
  for (const k of keys) eq(JSON.stringify(r[k]), JSON.stringify(c.expect[k]), c.tool + ' ' + JSON.stringify(c.args) + ' .' + k);
  checks++;
  if (r.error) { if (text !== r.error) { fails++; console.log('FAIL render error passthrough', text); } }
  else if (typeof text !== 'string' || text.length < 5 || /error|undefined|NaN/.test(text)) { fails++; console.log('FAIL render text', text); }
}
eq(e.renderBatch(e.batchScale(120,30,90,2,10)), 'Juice 600 ml, syrup 150 ml, soda 450 ml - 1200 ml total (1.2 L).', 'render batch default');
eq(e.renderIce(e.iceMelt(240,120,50)), '60 ml of melt takes the glass to 300 ml - 20% water: classic chill.', 'render ice default');
eq(e.renderRatio(e.ratioSplit(300,4,1,1)), 'Base 200 ml, syrup 50 ml, citrus 50 ml.', 'render ratio default');
console.log(checks + ' checks, ' + fails + ' failures over ' + cases.length + ' cases');
process.exit(fails ? 1 : 0);
