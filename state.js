const G = {
  money: 15, pStars: 0, tpStars: 0, pCnt: 0, branch: null, era: 0, eraProg: 0, lines: 1,
  inv: [], invCap: 100, invKeep: [], invReserve: [], autoReserve: [], contractReserve: [], lineUps: [], ups: {}, pUps: {},
  raw: 30, cBoost: 0, cDecay: .012, cPow: .1, heat: 0, overheated: false,
  tMon: 0, tProd: 0, tClk: 0, totalLost: 0, lastSave: Date.now(),
  sDlg: new Set(), lineRates: [], lineStatus: [], achs: new Set(),
  mktPrices: [], mktTick: 0, evtActive: null, mktTimer: 0, mktNext: 0,
  dm: 0,
  activeContracts: [],
  completedContracts: 0,
  bm_bmax: false,
  bm_freeze: false, bm_freezeTimer: 0,
  bm_super: false, bm_superTimer: 0,
  bm_comp: false,
  rivalShare: 0,
  expeditions: [],
  badges: 0,
  fragments: 0,
  archGrid: new Array(16).fill(false),
  archMap: new Array(64).fill('empty'),
  architectLoss: 0,
  architectCap: 0,
  grid: {},
  fuel: 1000,
  directors: [],
  assignedDirs: {},
  singularities: 0,
  genesisPts: 0,
  rawFromExtractor: 0,
  crashSales: 0,
  unlockedTabs: ['prod'],

  statHistory: [],
  prodAcc: new Array(8).fill(0),
  lossAcc: new Array(8).fill(0),
  valAcc: 0,

  autoBuyLimit: 10,
  autoBuyQty: 10,
  lang: 'pt',
  musicOn: true,
  musicVol: 0.3
};

function fmt(n) { if (n == null || isNaN(n)) return '0'; if (Math.abs(n) < 1000) return n < 10 && n >= 0 ? n.toFixed(1) : Math.floor(n).toString(); const u = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi']; const t = Math.floor(Math.log10(Math.abs(n)) / 3); if (t >= u.length) return n.toExponential(2); return (n / Math.pow(10, t * 3)).toFixed(1) + u[t] }
function uCo(co, cm, l) { let c = Math.floor(co * Math.pow(cm, l)); const d = G.pUps.pd || 0; if (d) c = Math.floor(c * (1 - .05 * d)); return Math.max(1, c) }
function getItems() { return G.branch ? BRANCHES[G.branch].items : [] }

function getItemCap() {
  let cap = G.invCap + 50 * (G.ups.gcap || 0) + 200 * (G.ups.gcap2 || 0) + 100 * (G.pUps.pk || 0);
  if (G.architectCap) cap += G.architectCap;
  return cap;
}

function getLineLoss(li) {
  let baseLoss = Math.max(.01, .20 - .03 * (G.lineUps[li]?.qual || 0) - .02 * (G.pUps.pq || 0) - .005 * (G.ups.w_mec || 0));
  baseLoss += 0.02 * (G.lineUps[li]?.over || 0);

  if (G.architectLoss) baseLoss -= G.architectLoss;

  const dirId = G.assignedDirs[li];
  if (dirId && typeof getDirectorBuff === 'function') {
    const buff = getDirectorBuff(dirId);
    if (buff.lossReduction) baseLoss *= (1 - buff.lossReduction);
  }
  return Math.max(0.01, baseLoss);
}

function getEffYield(li) { let g = 1; for (let i = 0; i <= li; i++)g *= (1 - getLineLoss(i)); return g }

function getLineSpeed(li) {
  let s = 1 + .12 * (G.lineUps[li]?.spd || 0);
  s *= 1 + .03 * (G.ups.gspd || 0);
  s *= 1 + .10 * (G.pUps.ps || 0);
  s *= 1 + .02 * (G.pUps.pz || 0);
  s *= 1 + 0.25 * (G.lineUps[li]?.over || 0);
  if (li === 0) s *= 1 + 0.50 * (G.ups.gl1 || 0);
  if (G.bm_super) s *= 2;

  const dirId = G.assignedDirs[li];
  if (dirId && typeof getDirectorBuff === 'function') {
    const buff = getDirectorBuff(dirId);
    if (buff.spdMult) s *= buff.spdMult;
  }

  if (G.fuel <= 0) s *= 0.2;

  if (G.archGrid) {
    let artifactSpeed = 0;
    G.archGrid.forEach(v => { if (v) artifactSpeed += 0.02; });
    s *= (1 + artifactSpeed);
  }

  return s;
}

function getTotalSpeed(li) { return getLineSpeed(li) + G.cBoost }
function getMC(li) { return 2 + (G.lineUps[li]?.mach || 0) }
function getEff(li) { return Math.max(.1, 1 - .08 * (G.lineUps[li]?.eff || 0)) }
function getValMult() {
  let m = 1 + .03 * (G.ups.gval || 0);
  m *= 1 + .08 * (G.pUps.pv || 0);
  m *= 1 + .03 * (G.pUps.pp || 0);
  m *= 1 + .02 * (G.pUps.pz || 0);
  if (G.genesisPts > 0) m *= Math.pow(5, G.genesisPts);

  if (G.archGrid) {
    let completedRows = 0;
    for (let r = 0; r < 4; r++) {
      if (G.archGrid[r * 4] && G.archGrid[r * 4 + 1] && G.archGrid[r * 4 + 2] && G.archGrid[r * 4 + 3]) completedRows++;
    }
    if (completedRows > 0) m *= Math.pow(2, completedRows);
  }

  if (G.evtActive === 'boom') m *= 2;
  const rivalScale = Math.min(1, (G.era || 0) / 5);
  let rivalImpact = (G.rivalShare || 0) * 0.005 * rivalScale;
  m *= Math.max(0.5, 1 - rivalImpact);
  return m * 2.25;
}

function calcStars() { return Math.max(0, Math.floor((Math.sqrt(G.tMon / 50) * (1 + .5 * (G.pUps.px || 0))) / 5)) }

function getBoostMax() { let m = 3 + (G.pUps.pb || 0); if (G.bm_bmax) m += 3; return m; }

// Removido o 🔩 para evitar confusão com o Ferro novo
function getItemEmoji(t) { return ['🧱', '⚙️', '🔧', '🏗️', '📦', '🚀', '🛸', '✨'][t] || '📦' }

function getRawName() { return G.branch ? BRANCHES[G.branch].raw : 'Recurso' }

function getRawEmoji() { return G.branch ? BRANCHES[G.branch].rawEmoji : '<img src="assets/img/iron/iron.png" style="width:1.2em; height:1.2em; vertical-align:-0.2em; object-fit:contain;">' }

function saveGame() {
  if (window._factoryResetPending) return;
  G.lastSave = Date.now();
  try {
    const data = JSON.stringify({
      money: G.money, pStars: G.pStars, tpStars: G.tpStars, pCnt: G.pCnt, branch: G.branch,
      era: G.era, eraProg: G.eraProg, lines: G.lines, inv: G.inv, invKeep: G.invKeep,
      lineUps: G.lineUps, ups: G.ups, pUps: G.pUps, raw: G.raw, cBoost: G.cBoost,
      tMon: G.tMon, tProd: G.tProd, tClk: G.tClk, totalLost: G.totalLost,
      achs: [...G.achs], sDlg: [...G.sDlg], lastSave: G.lastSave,
      mktTimer: G.mktTimer, mktNext: G.mktNext, dm: G.dm,
      activeContracts: G.activeContracts, completedContracts: G.completedContracts,
      bm_bmax: G.bm_bmax, bm_super: G.bm_super, bm_comp: G.bm_comp,
      bm_freezeTimer: G.bm_freezeTimer, bm_superTimer: G.bm_superTimer,
      rivalShare: G.rivalShare, expeditions: G.expeditions, asStatus: G.asStatus,
      invKeep: G.invKeep, invReserve: G.invReserve,
      badges: G.badges, directors: G.directors, assignedDirs: G.assignedDirs,
      singularities: G.singularities, genesisPts: G.genesisPts, fuel: G.fuel,
      fragments: G.fragments, archGrid: G.archGrid, archMap: G.archMap,
      architectLoss: G.architectLoss, architectCap: G.architectCap,
      lineRates: G.lineRates,
      rawFromExtractor: G.rawFromExtractor, crashSales: G.crashSales,
      unlockedTabs: G.unlockedTabs,
      statHistory: G.statHistory,
      autoBuyLimit: G.autoBuyLimit, autoBuyQty: G.autoBuyQty,
      lang: G.lang, musicOn: G.musicOn, musicVol: G.musicVol
    });
    localStorage.setItem('factory-empire-save', data);
  } catch (e) { }
}

function loadGame() {
  try {
    const rawData = localStorage.getItem('factory-empire-save');
    if (!rawData) return false;

    const d = JSON.parse(rawData);
    Object.assign(G, d);
    G.achs = new Set(d.achs || []); G.sDlg = new Set(d.sDlg || []);
    if (!G.invKeep) G.invKeep = new Array(8).fill(0);
    if (!G.invReserve) G.invReserve = new Array(8).fill(0);
    if (!G.activeContracts) G.activeContracts = [];
    if (!G.completedContracts) G.completedContracts = 0;
    if (!G.unlockedTabs) G.unlockedTabs = ['prod'];

    if (!G.statHistory) G.statHistory = [];
    if (!G.prodAcc) G.prodAcc = new Array(8).fill(0);
    if (!G.lossAcc) G.lossAcc = new Array(8).fill(0);
    if (typeof G.valAcc !== 'number') G.valAcc = 0;

    if (G.bm_comp === true) G.bm_comp = { 0: 1, 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1 };
    if (!G.bm_comp || typeof G.bm_comp !== 'object') G.bm_comp = {};
    for (let key in G.bm_comp) { if (G.bm_comp[key] === true) G.bm_comp[key] = 1; }

    if (typeof G.bm_freezeTimer !== 'number') G.bm_freezeTimer = 0;
    if (typeof G.bm_superTimer !== 'number') G.bm_superTimer = 0;
    if (G.bm_freeze && G.bm_freezeTimer <= 0) G.bm_freeze = false;
    if (G.bm_super && G.bm_superTimer <= 0) G.bm_super = false;

    if (G.autoBuyLimit === undefined) G.autoBuyLimit = 10;
    if (G.autoBuyQty === undefined) G.autoBuyQty = 10;
    if (typeof G.lang === 'undefined') G.lang = 'pt';
    if (typeof G.musicOn === 'undefined') G.musicOn = true;
    if (typeof G.musicVol === 'undefined') G.musicVol = 0.3;

    if (G.branch) { initMarket(); } recalc();
    if (typeof G.rawFromExtractor !== 'number') G.rawFromExtractor = 0;
    if (typeof G.crashSales !== 'number') G.crashSales = 0;

    const now = Date.now();
    if (d.lastSave) {
      let diffSecs = (now - d.lastSave) / 1000;
      if (diffSecs > 60) {
        diffSecs = Math.min(diffSecs, 12 * 3600);
        setTimeout(() => {
          if (typeof applyOfflineProduction === 'function') {
            applyOfflineProduction(diffSecs, 0.20);
          }
        }, 1800);
      }
    }
    G.lastSave = now;
    return true;
  } catch (e) { return false }
}

function recalcAutoReserve() {
  if (!G.branch) return;
  const items = getItems();
  const demand = {};

  for (let li = 0; li < G.lines; li++) {
    const it = items[li];
    if (!it || !it.recipe) continue;
    const rate = Math.max((G.lineRates && G.lineRates[li]) || 0, 0.3);
    const eff = getEff(li);
    for (const [ti, qty] of Object.entries(it.recipe)) {
      const tiIdx = parseInt(ti);
      demand[tiIdx] = (demand[tiIdx] || 0) + Math.ceil(qty * eff) * rate;
    }
  }

  const BUFFER_SECS = 12;
  if (!G.autoReserve) G.autoReserve = [];
  for (let i = 0; i < 8; i++) {
    G.autoReserve[i] = demand[i] ? Math.ceil(demand[i] * BUFFER_SECS) : 0;
  }
}