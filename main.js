let scene;
let phaserGame = null;

let _tabHiddenAt = null;

function applyOfflineProduction(diffSecs, efficiency = 0.25) {
  if (!G.branch || !G.lineRates) return;
  const items = getItems();
  const cap = getItemCap();
  let msgs = [];

  for (let li = 0; li < G.lines; li++) {
    const rate = G.lineRates[li] || 0;
    if (rate <= 0) continue;
    const produced = Math.floor(rate * diffSecs * efficiency);
    if (produced <= 0) continue;
    G.inv[li] = Math.min((G.inv[li] || 0) + produced, cap);
    G.tProd += produced;

    if (!G.prodAcc) G.prodAcc = new Array(8).fill(0);
    G.prodAcc[li] += produced;

    msgs.push(`+${fmt(produced)} ${T(items[li]?.n)}`);
  }

  if (msgs.length > 0) {
    const timeLabel = diffSecs >= 3600
      ? `${(diffSecs / 3600).toFixed(1)}h`
      : `${Math.round(diffSecs)}s`;
    const msg = `${T('Sistemas reativados. Ausência:')} ${timeLabel}. ${T('Produção offline')} (${Math.round(efficiency * 100)}%): ${msgs.join(', ')}.`;
    setTimeout(() => showTypewriterDlg(MENTOR, msg, true), 500);
  }

  checkEra();
  renderProd();
  updateHUD();
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    _tabHiddenAt = Date.now();
    saveGame();
  } else {
    if (_tabHiddenAt !== null) {
      const diffSecs = Math.min((Date.now() - _tabHiddenAt) / 1000, 12 * 3600);
      _tabHiddenAt = null;
      if (diffSecs >= 10) {
        applyOfflineProduction(diffSecs, 0.25);
      }
    }
  }
});

function startPhaserIfNeeded() {
  if (phaserGame) {
    if (scene) scene.rebuildFactory();
    return;
  }
  phaserGame = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game-wrap',
    backgroundColor: '#0b0e18',
    scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.NO_CENTER },
    scene: Factory,
    banner: false,
    render: { antialias: true },
    pauseOnBlur: false
  });
}

function pickBranch(b) {
  G.branch = b;
  initMarket();
  if (typeof initTabs === 'function') initTabs();
  document.getElementById('branch-popup').innerHTML = '';
  recalc();
  saveGame();
  startPhaserIfNeeded();
  renderAll();
  showTypewriterDlg(MENTOR, T('Linha de montagem centralizada. Operação autorizada.'));
}

function doClick(e) {
  initAudio();
  if (G.overheated) { sndFail(); return; }

  if (G.era > 0) {
    const heatReduction = 1 - 0.1 * (G.ups.ck4 || 0);
    G.heat += 6 * heatReduction;
  }

  if (G.heat >= 100) {
    G.overheated = true;
    G.cBoost = 0;
    sndFail(); haptic(50);
    const cb = document.getElementById('cbtn');
    if (cb) cb.classList.add('overheat');
    setTimeout(() => {
      G.overheated = false; G.heat = 0;
      const cb = document.getElementById('cbtn');
      if (cb) cb.classList.remove('overheat');
    }, 4000);
    return;
  }

  G.cBoost = Math.min(G.cBoost + G.cPow, getBoostMax());
  G.tClk++; sndClick(); haptic(10);

  const cBtn = document.getElementById('cbtn');
  if (cBtn) {
    const rect = cBtn.getBoundingClientRect();
    floatText(`+${G.cPow.toFixed(2)}x`,
      rect.left + rect.width / 2 + (Math.random() - 0.5) * 20,
      rect.top + rect.height / 2 + (Math.random() - 0.5) * 20,
      '#ffb850');
  }
}

function buyLine() {
  const cost = LINE_COSTS[G.lines];
  if (G.money < cost || G.lines >= 8) return;
  G.money -= cost; G.lines++;
  G.lineUps.push({ spd: 0, qual: 0, mach: 0, eff: 0, over: 0 });
  G.invKeep.push(0);
  const items = getItems();
  if (G.lines <= items.length) {
    const it = items[G.lines - 1];
    G.mktPrices.push({ base: it.val * .9, cur: it.val * .9, trend: 0, vol: .15 + Math.random() * .1 });
  }
  sndBuy();
  if (scene) scene.rebuildFactory();
  renderProd(); updateHUD();
}

function buyLU(li, id) {
  const lu = G.lineUps[li] || {};
  const lv = lu[id] || 0;
  const ud = LINE_UPS.find(u => u.id === id);
  const co = uCo(ud.co * (1 + li * .5), ud.cm, lv);
  if (G.money < co) return;

  let maxL = ud.mx;
  if (ud.id === 'spd') {
    const cLvl = (G.bm_comp && G.bm_comp[li]) || 0;
    maxL = ud.mx + (cLvl * 25);
  }
  if (lv >= maxL) return;

  G.money -= co;
  if (!G.lineUps[li]) G.lineUps[li] = {};
  G.lineUps[li][id] = lv + 1;
  sndBuy(); recalc(); renderProd(); updateHUD();

  if (id === 'mach' && scene && typeof scene.updateMachines === 'function') {
    scene.updateMachines(li);
  }
}

function buyGU(id) {
  let ud = null;
  for (let k in GLOBAL_UPS) { const f = GLOBAL_UPS[k].ups.find(u => u.id === id); if (f) { ud = f; break; } }
  if (!ud) return;
  const lv = G.ups[id] || 0;
  const co = uCo(ud.co, ud.cm, lv);
  if (G.money < co || lv >= ud.mx) return;
  G.money -= co; G.ups[id] = lv + 1;
  sndBuy(); recalc(); renderUpgrades(); updateHUD();
}

function getEffectiveReserve(li) {
  const contract = (G.contractReserve && G.contractReserve[li]) || 0;
  const manual = (G.invReserve && G.invReserve[li]) || 0;
  const auto = (G.autoReserve && G.autoReserve[li]) || 0;
  return contract + Math.max(0, manual + auto - contract);
}

function sellItem(li) {
  const reserved = getEffectiveReserve(li);
  const qty = Math.max(0, (G.inv[li] || 0) - reserved);
  if (qty <= 0) return;
  const val = (G.mktPrices[li + 1]?.cur || getItems()[li].val) * getValMult();

  G.money += val * qty; G.tMon += val * qty; G.inv[li] -= qty;
  if (typeof G.valAcc !== 'number') G.valAcc = 0; G.valAcc += val * qty;

  if (G.inv[li] < 0) G.inv[li] = 0;
  if (G.evtActive === 'crash') G.crashSales = (G.crashSales || 0) + 1;
  if (G.mktPrices[li + 1]) G.mktPrices[li + 1].trend -= (qty * 0.005);
  sndSell(); floatText(`+💰${fmt(val * qty)}`, window.innerWidth / 2, window.innerHeight / 2, '#ffd740');
  checkEra(); renderProd(); updateHUD();
}

function sellAll() {
  let totalVal = 0;
  getItems().forEach((x, i) => {
    const reserved = getEffectiveReserve(i);
    const s = Math.max(0, (G.inv[i] || 0) - reserved);
    if (s <= 0) return;
    const val = (G.mktPrices[i + 1]?.cur || x.val) * getValMult();

    G.money += s * val; G.tMon += s * val; G.inv[i] -= s;
    if (typeof G.valAcc !== 'number') G.valAcc = 0; G.valAcc += s * val;

    if (G.inv[i] < 0) G.inv[i] = 0;
    if (G.mktPrices[i + 1]) G.mktPrices[i + 1].trend -= (s * 0.005);
    totalVal += s * val;
  });
  if (totalVal <= 0) return;
  if (G.evtActive === 'crash') G.crashSales = (G.crashSales || 0) + 1;
  sndSell(); floatText(T('Vendido!'), window.innerWidth / 2, window.innerHeight / 2, '#ffd740');
  checkEra(); renderProd(); updateHUD();
}

function setKeep(li, v) { if (!G.invKeep) G.invKeep = []; G.invKeep[li] = v; }
function setReserve(li, v) { if (!G.invReserve) G.invReserve = []; G.invReserve[li] = Math.max(0, Math.floor(v)); }
function toggleAutoSell(li, state) { if (!G.asStatus) G.asStatus = []; G.asStatus[li] = state; }

function autoSellCheck(t) {
  if ((G.ups.w_ven || 0) < 1) return;
  if (G.asStatus && G.asStatus[t] === false) return;

  const keep = G.invKeep[t] || 0;
  const autoRes = (G.autoReserve && G.autoReserve[t]) || 0;
  const qty = G.inv[t] || 0;
  const floor = Math.max(keep, autoRes);

  const s = Math.max(0, qty - floor);
  if (s <= 0) return;

  const valPerUnit = (G.mktPrices[t + 1]?.cur || getItems()[t].val) * getValMult();
  const totalGain = s * valPerUnit;

  G.money += totalGain; G.tMon += totalGain; G.inv[t] -= s;
  if (typeof G.valAcc !== 'number') G.valAcc = 0; G.valAcc += totalGain;

  if (G.mktPrices[t + 1]) G.mktPrices[t + 1].trend -= (s * 0.005);

  floatText(`+💰${fmt(totalGain)}`, window.innerWidth / 2, window.innerHeight / 2 + 50, '#ffd740');
}

function recalc() {
  G.cPow = .1 + .05 * (G.ups.ck1 || 0) + .1 * (G.ups.ck2 || 0);
  if (G.pUps.pc) G.cPow *= (1 + .15 * G.pUps.pc);
  G.cDecay = .012 * Math.pow(.85, G.ups.ck4 || 0);
  G.invCap = 100;
}

function checkEra() {
  if (G.era >= 7) return;
  const b = G.pUps.pa ? (1 + .1 * G.pUps.pa) : 1;
  if (G.tMon * b >= ERAS[G.era].th) {
    G.era++; G.eraProg = 0;
    ntf(`🌟 ${T(ERAS[G.era].n)}!`); sndAch();
    if (scene) scene.rebuildFactory();
  } else G.eraProg = G.tMon * b;
}

function showPM() {
  const dmGain = (G.pCnt + 1) * 2; // Preview do ganho exato (vezes 2)
  document.getElementById('p-pr').innerHTML = `<div style="text-align:center">
    <p style="color:#ff5050;font-weight:bold">${T('ALERTA: CRITICAL RESET')}</p>
    <p>${T('Isso aniquilará a fábrica atual. Você começará da Era 0.')}</p>
    <p style="font-size:24px;margin:20px 0">${T('Você absorverá')} ⭐${calcStars()}<br>
    <span style="font-size:16px; color:#a080cc">${T('E receberá')} 🟣${dmGain} ${T('Matéria Escura')}</span></p>
    <button class="mkt-btn mkt-sell-btn" style="padding:15px 30px" onclick="doPrestige()">${T('INICIAR COLAPSO')}</button>
  </div>`;
  document.getElementById('tree-info').innerHTML = '';
  document.getElementById('tree-modal').classList.add('show');
}

function doPrestige() {
  if (calcStars() < 1) return;
  G.pCnt++; G.tpStars += calcStars(); G.pStars += calcStars();
  G.dm += (G.pCnt * 2); // MATÉRIA ESCURA MULTIPLICADA POR 2

  const pu = G.pUps;
  const ps = G.pStars, tps = G.tpStars, pcnt = G.pCnt, achs = G.achs, sd = G.sDlg;
  const oldBranch = G.pUps.pr ? G.branch : null;
  const startMoney = 15 + 150 * (pu.pm || 0);
  const oldDm = G.dm;

  // RETENÇÃO DE CONFIGURAÇÕES DE USUÁRIO E IDIOMA
  const lang = G.lang || 'pt';
  const musicOn = G.musicOn !== undefined ? G.musicOn : true;
  const musicVol = G.musicVol !== undefined ? G.musicVol : 0.3;
  const autoBuyLimit = G.autoBuyLimit || 10;
  const autoBuyQty = G.autoBuyQty || 10;

  localStorage.removeItem('factory-empire-save');
  for (let k in G) G[k] = null;
  Object.assign(G, {
    money: startMoney, pStars: ps, tpStars: tps, pCnt: pcnt,
    branch: oldBranch, era: 0, eraProg: 0, lines: 1,
    inv: [], invCap: 100, invKeep: new Array(8).fill(0),
    lineUps: [], ups: {}, pUps: pu,
    raw: 30, cBoost: 0, cDecay: .012, cPow: .1,
    heat: 0, overheated: false,
    tMon: 0, tProd: 0, tClk: 0, totalLost: 0,
    lastSave: Date.now(), sDlg: sd,
    lineRates: [], lineStatus: [], achs: achs,
    mktPrices: [], mktTick: 0, evtActive: null,
    mktTimer: 0, mktNext: 0, dm: oldDm,
    activeContracts: [], completedContracts: 0,
    bm_bmax: false, bm_freeze: false, bm_freezeTimer: 0,
    bm_super: false, bm_superTimer: 0, bm_comp: false,
    expeditions: [], rivalShare: 0, badges: 0, fragments: 0,
    archGrid: new Array(16).fill(false), archMap: new Array(64).fill('empty'),
    architectLoss: 0, architectCap: 0,
    grid: {}, fuel: 1000, directors: G.directors || [], assignedDirs: {},
    singularities: G.singularities || 0, genesisPts: G.genesisPts || 0,
    unlockedTabs: ['prod'],
    statHistory: [], prodAcc: new Array(8).fill(0), lossAcc: new Array(8).fill(0), valAcc: 0,
    // Devolvemos as configs para não resetar pro PT-BR
    lang: lang, musicOn: musicOn, musicVol: musicVol, autoBuyLimit: autoBuyLimit, autoBuyQty: autoBuyQty
  });

  if (pu.pi) G.era = 1;
  if (pu.pl) { G.lines = 2; G.lineUps.push({ spd: 0, qual: 0, mach: 0, eff: 0, over: 0 }); }

  sndPrestige(); recalc();

  if (oldBranch) {
    initMarket();
    if (typeof initTabs === 'function') initTabs();
    if (scene) scene.rebuildFactory();
    renderAll();
  } else {
    introStep = INTRO_LORE.length - 1;
    showBranchPopup();
  }

  showPrestigeTree();
}

function buyPU(id) {
  const d = PRESTIGE_TREE.find(u => u.id === id);
  const l = G.pUps[id] || 0;
  const co = uCo(d.co, d.cm, l);
  if (G.pStars < co || l >= d.mx) return;
  G.pStars -= co; G.pUps[id] = l + 1;
  sndPrestige(); recalc(); showPrestigeTree();
}