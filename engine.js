// Mocktail math engine - zero-alcohol party drink planning arithmetic.
// Pure functions, no DOM. All borrowed norms are labeled in the UI, not buried here.
'use strict';

function round1(x) { return Math.round(x * 10) / 10; }

// --- Batch scale -------------------------------------------------------------
// A recipe written for `servings` glasses, scaled to `guests` glasses.
function batchScale(juiceMl, syrupMl, sodaMl, servings, guests) {
  if (!(juiceMl >= 0) || !(syrupMl >= 0) || !(sodaMl >= 0)) return { error: 'amounts must not be negative' };
  if (!(juiceMl + syrupMl + sodaMl > 0)) return { error: 'the recipe is empty' };
  if (!(servings > 0)) return { error: 'servings must be positive' };
  if (!(guests > 0)) return { error: 'guests must be positive' };
  var f = guests / servings;
  var juice = round1(juiceMl * f), syrup = round1(syrupMl * f), soda = round1(sodaMl * f);
  var total = round1(juice + syrup + soda);
  var liters = round1(total / 10) / 100; // total ml -> liters, 2 decimals, exact round steps
  return { juice: juice, syrup: syrup, soda: soda, total: total, liters: liters };
}

// --- Ice melt dilution -------------------------------------------------------
// Labeled norm: 1 g of ice melts to about 1 ml of water. Melt percent depends
// on room, glass and time - it is an estimate, not a promise.
function iceMelt(drinkMl, iceG, meltPct) {
  if (!(drinkMl > 0)) return { error: 'drink must be positive' };
  if (!(iceG >= 0)) return { error: 'ice must not be negative' };
  if (!(meltPct >= 0)) return { error: 'melt must not be negative' };
  if (meltPct > 100) return { error: 'melt cannot exceed 100%' };
  var meltMl = round1(iceG * meltPct / 100);
  var final = round1(drinkMl + meltMl);
  var pct = round1(100 * meltMl / final);
  var band = pct < 10 ? 'barely softened' : pct <= 20 ? 'classic chill' : 'watery - serve colder or use bigger cubes';
  return { meltMl: meltMl, finalMl: final, pct: pct, band: band };
}

// --- Ratio splitter ----------------------------------------------------------
// Build a glass by parts: base juice, syrup, citrus. Given the total pour,
// split it by the ratio.
function ratioSplit(totalMl, baseParts, syrupParts, citrusParts) {
  if (!(totalMl > 0)) return { error: 'total must be positive' };
  if (!(baseParts > 0) || !(syrupParts >= 0) || !(citrusParts >= 0)) return { error: 'parts must be positive (syrup and citrus may be 0)' };
  if (syrupParts + citrusParts === 0) return { error: 'add some syrup or citrus' };
  var sum = baseParts + syrupParts + citrusParts;
  var base = round1(totalMl * baseParts / sum);
  var syrup = round1(totalMl * syrupParts / sum);
  var citrus = round1(totalMl * citrusParts / sum);
  return { base: base, syrup: syrup, citrus: citrus };
}

// --- Text rendering (shared by UI and tests) ---------------------------------
function renderBatch(r) {
  if (r.error) return r.error;
  return 'Juice ' + r.juice + ' ml, syrup ' + r.syrup + ' ml, soda ' + r.soda + ' ml - ' + r.total + ' ml total (' + r.liters + ' L).';
}
function renderIce(r) {
  if (r.error) return r.error;
  return r.meltMl + ' ml of melt takes the glass to ' + r.finalMl + ' ml - ' + r.pct + '% water: ' + r.band + '.';
}
function renderRatio(r) {
  if (r.error) return r.error;
  return 'Base ' + r.base + ' ml, syrup ' + r.syrup + ' ml, citrus ' + r.citrus + ' ml.';
}

var api = {
  round1: round1,
  batchScale: batchScale,
  iceMelt: iceMelt,
  ratioSplit: ratioSplit,
  renderBatch: renderBatch,
  renderIce: renderIce,
  renderRatio: renderRatio
};
if (typeof module !== 'undefined' && module.exports) module.exports = api;
if (typeof window !== 'undefined') window.MocktailMath = api;
