function initMarket() {
  const items = getItems(); G.mktPrices = [];
  for (let i = -1; i < Math.min(items.length, G.lines); i++) {
    const baseVal = i < 0 ? 0.5 : (items[i].val * 0.9);
    G.mktPrices.push({ base: baseVal, cur: baseVal, trend: 0, vol: 0.15 + Math.random() * .1 });
  }
}

function tickMarket() {
  if (!G.mktNext) G.mktNext = 300 + Math.random() * 300;
  G.mktTimer += 1;
  const isTick = G.mktTimer >= G.mktNext;

  if (isTick) {
    G.mktTick++;
    G.mktTimer = 0;
    G.mktNext = 300 + Math.random() * 300;
    G.mktPrices.forEach((p, i) => {
      p.trend += (Math.random() - .5) * .06;
      p.trend *= .88;
      p.cur = p.base * (1 + p.trend + (Math.random() - .5) * p.vol);
      if (Math.random() < 0.05) {
        const mul = [0.5, 2, 3][Math.floor(Math.random() * 3)];
        p.cur *= mul;
      }
      p.cur = Math.max(p.base * .2, Math.min(p.base * 10, p.cur));
    });
  }

  // LÓGICA DE EVENTOS (BOOM/CRASH) FOI REMOVIDA DAQUI! 
  // Agora o letreiro "newsticker.js" gerencia isso sozinho para evitar diálogos duplicados.
}

function buyRaw(qty, unitPrice) {
  const price = unitPrice * qty;
  if (G.money < price) return; G.money -= price; G.raw += qty; sndBuy(); renderMarket(); updateHUD()
}
function buyRawMax(unitPrice) {
  const qty = Math.floor(G.money / unitPrice);
  if (qty <= 0) return; G.money -= qty * unitPrice; G.raw += qty; sndBuy(); renderMarket(); updateHUD()
}
function mktSell(tier, qty) {
  const actual = Math.min(qty, G.inv[tier] || 0); if (actual <= 0) return;
  const pi = tier + 1;
  const price = (G.mktPrices[pi]?.cur || 0) * getValMult() * actual;

  G.money += price; G.tMon += price; G.inv[tier] -= actual;
  if (typeof G.valAcc !== 'number') G.valAcc = 0; G.valAcc += price;

  if (G.mktPrices[pi]) G.mktPrices[pi].trend -= (actual * 0.005);
  sndSell();
  floatText(`+${fmt(price)}`, window.innerWidth / 2, window.innerHeight / 2);
  checkEra(); renderMarket(); renderProd(); updateHUD()
}
function mktBuy(tier, qty, unitPrice) {
  const price = unitPrice * qty;
  if (G.money < price) return; G.money -= price; G.inv[tier] = (G.inv[tier] || 0) + qty; sndBuy(); renderMarket(); renderProd(); updateHUD()
}
function mktBuyMax(tier, unitPrice) {
  const qty = Math.floor(G.money / unitPrice);
  if (qty <= 0) return; G.money -= qty * unitPrice; G.inv[tier] = (G.inv[tier] || 0) + qty; sndBuy(); renderMarket(); renderProd(); updateHUD()
}