function swT(el) { document.querySelectorAll('.tab').forEach(e => e.classList.remove('act')); el.classList.add('act'); document.querySelectorAll('.pc').forEach(e => e.classList.remove('act')); document.getElementById('p-' + el.dataset.t).classList.add('act') }

function initTabs() {
  if (!G.unlockedTabs) G.unlockedTabs = ['prod'];

  if (G.raw <= 0 || G.tProd >= 5 || G.tMon > 0) addT('mkt');
  if (G.money >= 300) addT('up');
  if (G.era >= 1) addT('stats');
  if (G.era >= 3) { addT('artifacts'); addT('rivalry'); }
  if (G.era >= 4) addT('personnel');
  if (G.era >= 5) addT('arch');
  if (G.pCnt >= 1) addT('bm');
  addT('cfg');

  function addT(id) { if (!G.unlockedTabs.includes(id)) G.unlockedTabs.push(id); }

  document.querySelectorAll('.tab').forEach(t => {
    if (G.unlockedTabs.includes(t.dataset.t)) {
      t.classList.add('unlocked');
      t.style.setProperty('display', 'flex', 'important');
    } else {
      t.classList.remove('unlocked');
      t.style.setProperty('display', 'none', 'important');
    }
  });
}

function unlockTab(id, npcMsg) {
  if (!G.unlockedTabs) G.unlockedTabs = ['prod'];
  if (!G.unlockedTabs.includes(id)) {
    G.unlockedTabs.push(id);
    const t = document.querySelector(`.tab[data-t="${id}"]`);

    if (t) {
      t.classList.add('unlocked');
      t.style.setProperty('display', 'flex', 'important');
      void t.offsetWidth;
      t.style.animation = "tabPulse 1s 3";
    }

    if (npcMsg) showTypewriterDlg(MENTOR, npcMsg, true);
    if (typeof sndAch === 'function') sndAch();
    if (typeof saveGame === 'function') saveGame();
  }
}

function checkRPGTriggers() {
  if (!G.branch || !G.unlockedTabs) return;

  if ((G.raw <= 0 || G.tProd >= 5) && !G.unlockedTabs.includes('mkt')) {
    unlockTab('mkt', T("ALERTA: Produção validada. O acesso ao 🌍 Mercado Global foi autorizado para negociação de ativos."));
  }
  if (G.money >= 300 && !G.unlockedTabs.includes('up')) {
    unlockTab('up', T("Seu capital alcançou um nível operacional. A aba de ⬆️ Upgrades foi liberada. Otimize os motores."));
  }
  if (G.era >= 1 && !G.unlockedTabs.includes('stats')) {
    unlockTab('stats', T("Evolução detectada. A complexidade da sua operação exige metrificação. O painel de 📊 Estatísticas está online."));
  }
  if (G.era >= 3 && !G.unlockedTabs.includes('artifacts')) {
    unlockTab('artifacts', T("Detectamos anomalias no subsolo durante a expansão. 🏺 Instituto Arqueológico estabelecido."));
  }
  if (G.era >= 3 && !G.unlockedTabs.includes('rivalry')) {
    unlockTab('rivalry', T("Aviso: Nossas rotas comerciais estão sendo interceptadas. O painel de ⚔️ Rivalidade foi ativado."));
  }
  if (G.era >= 4 && !G.unlockedTabs.includes('personnel')) {
    unlockTab('personnel', T("A expansão humana se faz necessária. 👔 Sala da Diretoria aberta para recrutamento de talentos."));
  }
  if (G.era >= 5 && !G.unlockedTabs.includes('arch')) {
    unlockTab('arch', T("Módulos avançados detectados. A engenharia 📐 Ciberfísica está liberada para otimização de matrizes."));
  }
  if (G.pCnt >= 1 && !G.unlockedTabs.includes('bm')) {
    unlockTab('bm', T("Sinais cósmicos não identificados detectados. O 🕳️ Submundo agora reconhece sua existência. Acesso permitido."));
  }
}

const INTRO_LORE = [
  "Iniciando boot do sistema... Conexão neural estabelecida. Saudações, Administrador.",
  "Eu sou ATLAS, sua interface corporativa. O mundo exterior colapsou sob o peso da ineficiência.",
  "Um velho engenheiro, conhecido como 'Seu Zé', resgatou seu núcleo e cedeu nossas últimas economias: 15 créditos e sucata.",
  "Nossa diretriz é clara: reerguer a indústria, dominar o mercado e alcançar a Singularidade Tecnológica.",
  "O primeiro passo determinará nosso futuro. Qual setor industrial vamos dominar inicialmente?"
];
let introStep = 0;
let introTypingTimeout = null;

function showIntroPopup() {
  const popup = document.getElementById('branch-popup');
  const text = T(INTRO_LORE[introStep]);
  const isLast = introStep === INTRO_LORE.length - 1;

  popup.innerHTML = `
    <div class="popup-ov" style="z-index:9999;">
      <div class="popup-box" style="text-align:center; max-width: 450px;">
        <div style="font-size:48px; margin-bottom:15px; text-shadow: 0 0 15px rgba(47, 255, 176, 0.4);">🧠</div>
        <h2 style="color:#2fffb0; margin-bottom: 20px;">SISTEMA ATLAS</h2>
        <p id="intro-text" style="min-height: 80px; font-family:'Share Tech Mono', monospace; font-size:15px; color:#d8e0f8; line-height: 1.5; text-align: left; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 8px; border-left: 3px solid #2fffb0;"></p>
        <button class="mkt-btn mkt-buy" style="font-size:12px; padding:10px 20px; margin-top:20px; width: 100%; border-radius: 8px;" onclick="nextIntro()">
          ${isLast ? T('INICIAR PROTOCOLO') : T('PRÓXIMO ▸')}
        </button>
      </div>
    </div>
  `;

  const textEl = document.getElementById('intro-text');
  textEl.innerHTML = '';
  let i = 0;

  if (introTypingTimeout) clearTimeout(introTypingTimeout);

  function type() {
    if (i < text.length) {
      textEl.innerHTML += text.charAt(i);
      i++;
      introTypingTimeout = setTimeout(type, 20);
    }
  }
  type();
}

function nextIntro() {
  initAudio();
  introStep++;
  if (introStep >= INTRO_LORE.length) {
    showBranchPopup();
  } else {
    showIntroPopup();
  }
}

function showBranchPopup() {
  document.getElementById('branch-popup').innerHTML = `<div class="popup-ov" style="z-index:9999;"><div class="popup-box"><h2>${T('ESCOLHA SEU RAMO')}</h2><p>${T('Diferentes indústrias, diferentes desafios.')}<br>${T('O que você vai construir?')}</p><div class="popup-branches">${Object.entries(BRANCHES).map(([k, b]) => `<div class="popup-bc ${k}" onclick="pickBranch('${k}')"><div class="pb-icon">${b.i}</div><div class="pb-name">${T(b.n)}</div><div class="pb-desc">${T(b.desc)}</div><div class="pb-path">${T(b.items[0].n)} → ${T(b.items[7].n)}</div></div>`).join('')}</div></div></div>`;
}

let _lineCollapsed = [];
function toggleLineCollapse(i) {
  _lineCollapsed[i] = !_lineCollapsed[i];
  renderProd();
}

function renderProd() {
  const c = document.getElementById('p-prod'), items = getItems();
  if (!items.length) { c.innerHTML = `<div style="color:#4a5878;text-align:center;margin-top:20px;font-size:12px">${T("Aguardando...")}</div>`; return }
  let h = `<div class="st">${getRawEmoji()} ${T(getRawName())}: ${G.raw}</div>`;

  const eraRawGen = [1, 1, 1.5, 1.5, 2, 2, 3, 3][Math.min(G.era, 7)];
  h += `<div class="extractor-card">
    <div class="ext-icon">⛏️</div>
    <div class="ext-info">
      <div class="ext-name">${T("EXTRATOR BÁSICO")} <span style="color:#5a7090;font-size:8px;font-family:sans-serif;">${T("FIXO")}</span></div>
      <div class="ext-rate">+${eraRawGen}/s de ${T(getRawName())}</div>
      <div class="ext-tip">${T("Gerador automático. Garante fornecimento mínimo de matéria-prima. Sem upgrades.")}</div>
    </div>
    <div class="ext-badge">AUTO</div>
  </div>`;

  if ((G.ups.w_com || 0) >= 1) {
    if (G.autoBuyLimit === undefined) G.autoBuyLimit = 10;
    if (G.autoBuyQty === undefined) G.autoBuyQty = 10;
    h += `<div style="display:flex; align-items:center; gap:8px; margin-top:8px; font-size:10px; color:#8a98b0; background:rgba(0,0,0,0.2); padding:4px 8px; border-radius:4px; border:1px solid rgba(255,255,255,0.05);">
        🤖 Auto-Comprador: 
        <label style="margin-left:auto;">Pedir se <= <input type="number" min="0" max="9999" value="${G.autoBuyLimit}" onchange="G.autoBuyLimit=Number(this.value);saveGame()" style="width:40px; background:rgba(200,220,255,.05); border:1px solid rgba(200,220,255,.1); border-radius:4px; color:#2fffb0; text-align:center; font-family:'Share Tech Mono',monospace;"></label>
        <label>Qtd: <input type="number" min="1" max="9999" value="${G.autoBuyQty}" onchange="G.autoBuyQty=Number(this.value);saveGame()" style="width:40px; background:rgba(200,220,255,.05); border:1px solid rgba(200,220,255,.1); border-radius:4px; color:#2fffb0; text-align:center; font-family:'Share Tech Mono',monospace;"></label>
    </div>`;
  }

  if (!G.fuel) G.fuel = 0;
  const fuelCost = Math.floor(100 * Math.max(1, Math.pow(4, G.era)) * 0.7);
  const maxFuel = 1000 + 500 * (G.ups.gfuel || 0);
  const colorF = G.fuel <= 0 ? '#ff5050' : '#ffb850';

  // INSERÇÃO DA IMAGEM DO COAL AQUI
  h += `<div class="st" style="display:flex; justify-content:space-between; align-items:center;">
    <div><img src="assets/img/coal/coal.png" style="width:1.2em; height:1.2em; vertical-align:-0.2em; object-fit:contain; margin-right:4px;"> ${T("Gerador Central")}: <span style="color:${colorF}">${Math.floor(G.fuel)}/${maxFuel} Lts</span></div>
    <button class="mkt-btn mkt-buy ${G.money >= fuelCost ? '' : 'dis'}" onclick="if(G.money>=${fuelCost}){G.money-=${fuelCost};G.fuel=${maxFuel};sndBuy();renderProd();updateHUD()}" style="padding:4px 8px;">${T("Completar T.")}<br>💰${fmt(fuelCost)}</button>
  </div>`;
  if (G.fuel <= 0) {
    h += `<div style="text-align:center; color:#ff5050; font-size:10px; font-weight:bold; margin-bottom:10px; animation: pulse 1s infinite;">${T("ALERTA DE BLACKOUT: MOTORES OPERANDO A 20%")}</div>`;
  }

  h += `<div class="st">📦 ${T("Estoque")}</div>`; const cap = getItemCap(); const hasAS = (G.ups.w_ven || 0) >= 1;
  items.forEach((it, i) => {
    if (i >= G.lines) return;
    const qty = G.inv[i] || 0;
    const val = (G.mktPrices[i + 1]?.cur || it.val) * getValMult();
    const keep = G.invKeep[i] || 0;
    const reserve = (G.invReserve && G.invReserve[i]) || 0;
    const autoRes = (G.autoReserve && G.autoReserve[i]) || 0;
    const effectiveRes = Math.max(reserve, autoRes) + Math.min(reserve, autoRes > 0 ? 0 : reserve);
    const surplus = Math.max(0, qty - autoRes - reserve);
    const asOn = G.asStatus ? G.asStatus[i] !== false : true;
    const isIngredient = items.some((it2, j) => j > i && j < G.lines && it2.recipe && it2.recipe[i] !== undefined);
    const reserveColor = reserve > 0 ? '#ffb850' : '#5a6888';

    const autoResBadge = autoRes > 0
      ? `<span style="font-size:8px;background:rgba(255,90,50,.1);border:1px solid rgba(255,90,50,.25);border-radius:3px;padding:1px 4px;color:#ff8050;font-family:'Share Tech Mono',monospace;">🔒${autoRes}</span>`
      : '';

    h += `<div class="inv-item">
      <div class="inv-head">
        <div class="ii-icon">${getItemEmoji(i)}</div>
        <div class="ii-info">
          <div class="ii-name">${T(it.n)} ${autoResBadge}</div>
          <div class="ii-qty">${fmt(qty)} <span class="ii-cap">/ ${cap}</span>${autoRes > 0 && surplus > 0 ? ` <span style="font-size:9px;color:#2fffb0">↑${fmt(surplus)} ${T("livre")}</span>` : ''}</div>
          <div class="ii-val">💰 ${fmt(val)}/un</div>
        </div>
        ${surplus > 0 ? `<div class="inv-sell" onclick="sellItem(${i})">${autoRes > 0 ? T("Vender excedente") : T("Vender")}</div>` : ''}
      </div>
      <div class="inv-foot">
        ${isIngredient ? `<div style="display:flex;align-items:center;gap:4px;font-size:10px;color:${reserveColor}">
          🔒 ${T("Reservar")}:
          <input type="number" min="0" max="9999" value="${reserve}"
            onchange="setReserve(${i},+this.value)"
            style="width:44px;background:rgba(255,180,50,.05);border:1px solid rgba(255,180,50,.2);border-radius:4px;color:#ffb850;text-align:center;font-family:'Share Tech Mono',monospace;">
        </div>` : '<div></div>'}
        ${hasAS ? `<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:2px">
          <label style="display:flex;align-items:center;gap:3px;cursor:pointer;font-size:10px;color:#8a98b0"><input type="checkbox" onchange="toggleAutoSell(${i},this.checked)" ${asOn ? 'checked' : ''}> ${T("AutoVenda")}</label>
          <div style="display:flex;align-items:center;gap:4px;font-size:10px;color:#8a98b0">${T("Manter")}:<input type="number" min="0" max="9999" value="${keep}" onchange="setKeep(${i},+this.value)" style="width:44px;background:rgba(200,220,255,.05);border:1px solid rgba(200,220,255,.1);border-radius:4px;color:#2fffb0;text-align:center;font-family:'Share Tech Mono',monospace;"></div>
        </div>` : ''}
      </div>
    </div>`;
  });
  if (G.inv.some((q, i) => Math.max(0, (q || 0) - ((G.autoReserve && G.autoReserve[i]) || 0) - ((G.invReserve && G.invReserve[i]) || 0)) > 0)) h += `<div class="inv-sell" style="width:100%;text-align:center;margin-top:8px;padding:8px" onclick="sellAll()">${T("VENDER EXCEDENTE")}</div>`;

  h += `<div class="st" style="margin-top:15px">${T("🔄 Linhas de Montagem")}</div>`;
  for (let i = 0; i < G.lines; i++) {
    const it = items[i]; const stat = G.lineStatus[i] || 'on'; const rate = G.lineRates[i] || 0; const loss = getLineLoss(i); const lu = G.lineUps[i] || {};
    const collapsed = !!_lineCollapsed[i];
    const arrow = collapsed ? '▶' : '▼';
    let reqStr = `1× ${T(getRawName())}`;
    if (it.recipe) { const eff = getEff(i); reqStr = Object.entries(it.recipe).map(([ti, qty]) => `${Math.ceil(qty * eff)}× ${T(items[ti].n)}`).join(' + ') }

    h += `<div class="line-sec" style="margin-bottom:${collapsed ? '4px' : '8px'}">
      <div class="ls-head" style="cursor:pointer" onclick="toggleLineCollapse(${i})">
        <span class="ls-title">L${i + 1}: ${T(it.n)}</span>
        <div style="display:flex;align-items:center;gap:6px">
          <span style="font-family:'Share Tech Mono',monospace;font-size:10px;padding:3px 6px;border-radius:4px;${stat === 'on' ? 'color:#2fffb0;background:rgba(0,220,160,.1)' : 'color:#ff5050;background:rgba(255,80,80,.1)'}"
          >${stat === 'on' ? `🟢 ${rate.toFixed(2)}/s` : '🔴'}</span>
          <span style="font-size:10px;color:#5a7090;transition:transform .2s;display:inline-block">${arrow}</span>
        </div>
      </div>`;
    if (!collapsed) {
      h += `<div style="font-size:9px;color:#6878a0;margin-bottom:6px">${T("Req")}: ${reqStr} | ${T("Perda")}: ${(loss * 100).toFixed(0)}% | ${T("Rend")}: ${(getEffYield(i) * 100).toFixed(0)}%</div>
      <div style="display:flex;flex-wrap:wrap;gap:4px">`;
      LINE_UPS.forEach(ud => {
        const lv = lu[ud.id] || 0;
        let maxL = ud.mx;
        if (ud.id === 'spd' && G.bm_comp && G.bm_comp[i]) maxL = 9999;
        const co = uCo(ud.co * (1 + i * .5), ud.cm, lv); const mx = lv >= maxL; const af = G.money >= co && !mx;
        h += `<div class="uc ${af ? '' : 'dis'}" style="flex:1;min-width:145px;padding:6px 8px;margin:0" ${af ? `onclick="buyLU(${i},'${ud.id}')"` : ''}>` +
          `<div class="uh"><span class="un">${ud.ic}${T(ud.n)}</span><span class="ul">${mx ? T('MAX') : lv}</span></div>` +
          `${!mx ? `<div class="uco">💰${fmt(co)}</div>` : ''}` +
          `<div class="utip">${T(ud.tip)}</div></div>`;
      });
      h += '</div>';
    }
    h += '</div>';
  }
  if (G.lines < 8 && G.lines < items.length) {
    const ni = items[G.lines]; const cost = LINE_COSTS[G.lines]; const af = G.money >= cost;
    h += `<div class="line-buy ${af ? '' : 'dis'}" ${af ? 'onclick="buyLine()"' : ''}><div class="lb-name">${T("🔓 Desbloquear L")}${G.lines + 1}: ${T(ni.n)}</div><div class="lb-cost">💰 ${fmt(cost)}</div></div>`
  }
  c.innerHTML = h
}

let upCat = 'global';
function renderUpgrades() {
  const c = document.getElementById('p-up'); let h = '<div class="sub-tabs">';
  Object.entries(GLOBAL_UPS).forEach(([k, cat]) => { h += `<div class="sub-tab ${k === upCat ? 'act' : ''}" onclick="upCat='${k}';renderUpgrades()">${T(cat.n)}</div>` });
  h += '</div>'; GLOBAL_UPS[upCat].ups.forEach(d => {
    const l = G.ups[d.id] || 0; const co = uCo(d.co, d.cm, l); const mx = l >= d.mx; const af = G.money >= co && !mx;
    h += `<div class="uc ${af ? '' : 'dis'}" ${af ? `onclick="buyGU('${d.id}')"` : ''}><div class="uh"><span class="un">${T(d.n)}</span><span class="ul">${mx ? T('MAX') : l}</span></div><div class="ud">${T(d.d)}</div>${!mx ? `<div class="uco">💰${fmt(co)}</div>` : ''}<div class="utip">${T(d.tip)}</div></div>`
  });
  c.innerHTML = h
}

function renderStats() {
  const c = document.getElementById('p-stats'), items = getItems();
  if (!items.length) { c.innerHTML = ''; return }

  let h = `<div class="st">${T("📊 Estatísticas (Últimos 60s)")}</div>`;
  let tr = 0, tv = 0;

  const hist = G.statHistory || [];
  const histLen = Math.max(1, hist.length);

  let sumProd = new Array(8).fill(0);
  let sumLoss = new Array(8).fill(0);
  let sumVal = 0;

  hist.forEach(entry => {
    for (let i = 0; i < 8; i++) {
      sumProd[i] += (entry.prod[i] || 0);
      sumLoss[i] += (entry.loss[i] || 0);
    }
    sumVal += (entry.val || 0);
  });

  for (let i = 0; i < G.lines; i++) {
    const it = items[i];
    const avgProd = sumProd[i] / histLen;
    const totalAttempts = sumProd[i] + sumLoss[i];
    const lossPct = totalAttempts > 0 ? (sumLoss[i] / totalAttempts * 100) : 0;

    tr += avgProd;

    h += `<div class="stat-row"><span class="sr-icon">${getItemEmoji(i)}</span><span class="sr-name">${T(it.n)}</span><span class="sr-rate">${avgProd.toFixed(2)}/s</span><span class="sr-loss">-${lossPct.toFixed(0)}%</span></div>`
  }

  const avgVal = sumVal / histLen;

  h += `<div class="stat-summary">${T("Prod Real")}: ${tr.toFixed(2)}/s | ${T("Val Real")}: 💰${fmt(avgVal)}/s<br>${T("Total ganho")}: 💰${fmt(G.tMon)} | ${T("Perdidos (Total)")}: ${G.totalLost}<br>${T("Clicks")}: ${G.tClk} | ${T("Raw")}: ${G.raw}<br>${T("⭐ Prestígio atual")}: +${calcStars()}${G.genesisPts > 0 ? `<br>${T("🕳️ Pontos Gênesis")}: ${G.genesisPts} (+${(Math.pow(5, G.genesisPts) * 100).toFixed(0)}% ${T("Valor Base")})` : ''}</div>`;
  h += `<div class="st" style="margin-top:12px">${T("🏆 Conquistas do ATLAS")}</div>`;
  ACHS.forEach(a => {
    const done = G.achs.has(a.id);
    h += `<div style="padding:6px 8px;margin-bottom:4px;font-size:10px;border-radius:6px;${done ? 'color:#ffd740;background:rgba(255,200,50,.08)' : 'color:#5a6888;background:rgba(200,220,255,.02)'}">${done ? '✅' : '⬜'} <b>${T(a.n)}</b> — ${T(a.d)}</div>`
  });
  c.innerHTML = h
}

function showPrestigeTree() {
  const c = document.getElementById('p-pr');
  document.getElementById('tree-info').innerHTML = `⭐${G.pStars} ${T("disponíveis")} | +${calcStars()} ${T("na próxima")} | 🔄 ${G.pCnt} ${T("Renascimentos")}<br>🟣 ${T("Matéria Escura")}: ${G.dm}`;
  let h = `<div class="tree-wrap">`;
  const maxLayer = Math.max(...PRESTIGE_TREE.map(p => p.ly));
  for (let i = 1; i <= maxLayer; i++) {
    h += `<div class="tree-ly">`;
    const nodes = PRESTIGE_TREE.filter(p => p.ly === i);
    nodes.forEach(d => {
      const l = G.pUps[d.id] || 0; const co = uCo(d.co, d.cm, l); const mx = l >= d.mx; const af = G.pStars >= co && !mx;
      h += `<div class="pn ${l > 0 ? 'own' : ''} ${af ? '' : 'dis'}" ${af ? `onclick="buyPU('${d.id}')"` : ''} title="${T(d.d)}">
          <div class="pnn">${T(d.n)}</div>
          <div class="pnd">${mx ? T('MÁXIMO') : `${T('Nv')} ${l}/${d.mx}`}</div>
          ${!mx ? `<div class="pnc">⭐${co}</div>` : ''}
          </div>`;
    });
    h += `</div>`;
  }
  h += `</div>`;
  c.innerHTML = h;

  const pmTitle = document.getElementById('pm-title');
  if (pmTitle) pmTitle.textContent = T('ÁRVORE DE PRESTÍGIO');

  document.getElementById('tree-modal').classList.add('show');
}

let currentMarketTab = 'mkt';
function swMarketTab(t) {
  currentMarketTab = t;
  if (t === 'mkt') renderMarket();
  else if (t === 'contracts' && typeof renderContracts === 'function') renderContracts();
  else if (t === 'exped' && typeof renderExped === 'function') renderExped();
}

function getMarketTabsHTML() {
  return `<div class="sub-tabs" style="justify-content: flex-start; gap: 4px; border-bottom: 1px solid rgba(200,220,255,0.05); padding-bottom: 5px; margin-bottom: 10px; flex-wrap: wrap;">
    <div class="sub-tab ${currentMarketTab === 'mkt' ? 'act' : ''}" style="flex:auto; text-align:center;" onclick="swMarketTab('mkt')">${T("Cotações")}</div>
    <div class="sub-tab ${currentMarketTab === 'contracts' ? 'act' : ''}" style="flex:auto; text-align:center;" onclick="swMarketTab('contracts')">${T("Contratos")}</div>
    <div class="sub-tab ${currentMarketTab === 'exped' ? 'act' : ''}" style="flex:auto; text-align:center;" onclick="swMarketTab('exped')">${T("Expedições")}</div>
  </div>`;
}

function renderMarket() {
  if (currentMarketTab !== 'mkt') return;
  const c = document.getElementById('p-mkt'), items = getItems();
  if (!items.length) { c.innerHTML = `<div style="color:#4a5878;text-align:center;margin-top:20px;font-size:12px">${T("Escolha um ramo primeiro")}</div>`; return }
  let h = getMarketTabsHTML() + `<div class="st">${T("🏪 Ações do Mercado")}</div>`;

  const rawPrice = G.mktPrices[0]?.cur || 0.5;
  const rawBuyPrice = rawPrice * (1.05 + Math.random() * 0.05);
  const rawDir = rawPrice > (G.mktPrices[0]?.base || .5) ? 'up' : 'down';

  h += `<div class="mkt-item" style="flex-wrap:wrap;">
      <div style="display:flex; width:100%; align-items:center; gap:8px;">
          <div class="mi-icon">${getRawEmoji()}</div>
          <div class="mi-info">
              <div class="mi-name">${T(getRawName())}</div>
              <div class="mi-price"><span class="${rawDir}">${T("Venda")}: 💰 ${rawPrice.toFixed(2)} ${rawDir === 'up' ? '▲' : '▼'}</span></div>
              <div style="font-size:9px;color:#5a6888;margin-top:2px">${T("Compra")}: 💰 ${rawBuyPrice.toFixed(2)} | ${T("Est")}: ${G.raw}</div>
          </div>
      </div>
      <div style="display:flex; width:100%; justify-content: flex-end; margin-top: 6px; flex-wrap:wrap; gap:4px;">
          <div style="display:flex; gap:4px;">
              <button class="mkt-btn mkt-buy" onclick="buyRaw(1, ${rawBuyPrice})">+1</button>
              <button class="mkt-btn mkt-buy" onclick="buyRaw(10, ${rawBuyPrice})">+10</button>
              <button class="mkt-btn mkt-buy" onclick="buyRaw(100, ${rawBuyPrice})">+100</button>
              <button class="mkt-btn mkt-buy" onclick="buyRawMax(${rawBuyPrice})">${T("MAX")}</button>
          </div>
      </div>
  </div>`;

  for (let i = 0; i < G.lines; i++) {
    const it = items[i]; const qty = G.inv[i] || 0;
    const pi = i + 1; if (pi >= G.mktPrices.length) continue;
    const pr = G.mktPrices[pi]; const dir = pr.cur > pr.base ? 'up' : 'down'; const pct = ((pr.cur / pr.base - 1) * 100).toFixed(0);
    const mktVal = pr.cur * getValMult();
    const buyPrice = mktVal * (1.05 + Math.random() * 0.05);

    h += `<div class="mkt-item" style="flex-wrap:wrap;">
        <div style="display:flex; width:100%; align-items:center; gap:8px;">
            <div class="mi-icon">${getItemEmoji(i)}</div>
            <div class="mi-info">
                <div class="mi-name">${T(it.n)} (${qty} em estoque)</div>
                <div class="mi-price"><span class="${dir}">${T("Venda")}: 💰 ${fmt(mktVal)} ${dir === 'up' ? '▲' : '▼'} ${pct > 0 ? '+' : ''}${pct}%</span></div>
                <div style="font-size:9px;color:#5a6888;margin-top:2px">${T("Compra")}: 💰 ${fmt(buyPrice)}</div>
            </div>
        </div>
        <div style="display:flex; width:100%; justify-content: space-between; margin-top: 6px; flex-wrap:wrap; gap:4px;">
            <div style="display:flex; gap:4px;">
                <button class="mkt-btn mkt-sell-btn ${qty > 0 ? '' : 'dis'}" onclick="mktSell(${i},1)">${T("Vender 1")}</button>
                <button class="mkt-btn mkt-sell-btn ${qty > 0 ? '' : 'dis'}" onclick="mktSell(${i},${qty})">${T("Tudo")}</button>
            </div>
            <div style="display:flex; gap:4px;">
                <button class="mkt-btn mkt-buy" onclick="mktBuy(${i},1, ${buyPrice})">+1</button>
                <button class="mkt-btn mkt-buy" onclick="mktBuy(${i},10, ${buyPrice})">+10</button>
                <button class="mkt-btn mkt-buy" onclick="mktBuy(${i},100, ${buyPrice})">+100</button>
                <button class="mkt-btn mkt-buy" onclick="mktBuyMax(${i}, ${buyPrice})">${T("MAX")}</button>
            </div>
        </div>
    </div>`;
  }
  c.innerHTML = h;
}

function renderConfig() {
  const c = document.getElementById('p-cfg');
  if (!c) return;

  let h = `<div class="st" style="color:#a0c8e0">${T('⚙️ Configurações do Sistema')}</div>`;

  h += `<div class="line-sec">
        <div class="ls-title" style="margin-bottom:10px;">${T('🎧 Áudio')}</div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <span style="font-size:12px; color:#d8e0f8;">${T('Música de Fundo')}:</span>
            <button class="mkt-btn ${G.musicOn ? 'mkt-buy' : 'mkt-sell-btn'}" onclick="toggleMusic()">${G.musicOn ? T('LIGADO') : T('DESLIGADO')}</button>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:12px; color:#d8e0f8;">${T('Volume')}:</span>
            <input type="range" min="0" max="1" step="0.1" value="${G.musicVol}" onchange="changeVolume(this.value)" style="width:100px; accent-color:#2fffb0;">
        </div>
    </div>`;

  h += `<div class="line-sec">
        <div class="ls-title" style="margin-bottom:10px;">${T('🌍 Idioma')}</div>
        <div style="display:flex; flex-wrap:wrap; gap:8px;">
            <button class="mkt-btn ${G.lang === 'pt' ? 'mkt-buy' : 'cc'}" onclick="setLang('pt')">Português</button>
            <button class="mkt-btn ${G.lang === 'en' ? 'mkt-buy' : 'cc'}" onclick="setLang('en')">English</button>
            <button class="mkt-btn ${G.lang === 'es' ? 'mkt-buy' : 'cc'}" onclick="setLang('es')">Español</button>
            <button class="mkt-btn ${G.lang === 'ru' ? 'mkt-buy' : 'cc'}" onclick="setLang('ru')">Русский</button>
        </div>
    </div>`;

  h += `<div class="line-sec" style="text-align:center;">
        <button class="mkt-btn cc" style="width:100%; margin-bottom:8px; padding:10px;" onclick="saveGame(); floatText('${T("Saved!")}', window.innerWidth/2, 50, '#2fffb0');">${T('💾 Salvar Jogo')}</button>
        <button class="mkt-btn mkt-sell-btn" style="width:100%; padding:10px; border-color:#ff2020; color:#ff5050;" onclick="hardResetGame()">${T('⚠️ Apagar Save (Hard Reset)')}</button>
    </div>`;

  c.innerHTML = h;
}

function toggleMusic() {
  G.musicOn = !G.musicOn;
  if (scene && typeof scene.updateMusicState === 'function') scene.updateMusicState();
  saveGame(); renderConfig();
}
function changeVolume(v) {
  G.musicVol = parseFloat(v);
  if (scene && typeof scene.updateMusicState === 'function') scene.updateMusicState();
  saveGame(); renderConfig();
}
function setLang(l) {
  G.lang = l;
  saveGame();
  document.getElementById('r-raw-l').textContent = T('Matéria-prima');
  document.getElementById('r-mon-l').textContent = T('Créditos');
  document.getElementById('r-inv-l').textContent = T('Estoque');
  document.getElementById('pbtn').textContent = T('⟳ PRESTÍGIO');
  renderAll();
}
function hardResetGame() {
  if (confirm("Tem certeza absoluta? Isso apagará TODO O SEU PROGRESSO. A ação não pode ser desfeita.")) {
    localStorage.removeItem('factory-empire-save');
    location.reload();
  }
}

function updateHUD() {
  const $ = id => document.getElementById(id);
  if ($('r-m')) $('r-m').textContent = fmt(G.money);
  if ($('r-raw')) $('r-raw').textContent = G.raw;
  if ($('r-raw-l')) $('r-raw-l').textContent = T(getRawName());
  let ti = 0; G.inv.forEach(q => ti += (q || 0)); if ($('r-inv')) $('r-inv').textContent = fmt(ti);
  if ($('r-s')) $('r-s').textContent = G.pStars;
  if ($('h-spd')) $('h-spd').textContent = (1 + G.cBoost).toFixed(1) + 'x';
  if ($('h-cap')) $('h-cap').textContent = `${T('max')} ${getBoostMax()}x`;

  if ($('era-name')) {
    $('era-name').textContent = T(ERAS[G.era].n);
    $('era-name').parentElement.title = `${T('Nível da Era')}: ${G.era} (${T(ERAS[G.era].n)} — ${T(ERAS[G.era].sub)})`;
    let subEl = $('era-sub');
    if (!subEl) {
      subEl = document.createElement('div');
      subEl.id = 'era-sub';
      subEl.className = 'era-sub';
      $('era-name').parentElement.appendChild(subEl);
    }
    subEl.textContent = T(ERAS[G.era].sub);
  }
  const ep = G.era < 7 ? (G.eraProg / ERAS[G.era].th * 100) : 100;
  if ($('era-bar')) $('era-bar').style.width = Math.min(ep, 100) + '%';
  const canP = calcStars() >= 1; if ($('pbtn')) $('pbtn').classList.toggle('show', canP);
  const hb = $('h-bar'), hs = $('h-state');
  if (hb) hb.style.width = Math.min(100, G.heat || 0) + '%';
  if (hs) {
    hs.textContent = G.overheated ? T('ALERTA') : ((G.heat || 0) > 70 ? T('ALTO') : T('OK'));
    hs.style.color = G.overheated ? '#ff3030' : ((G.heat || 0) > 70 ? '#ffb850' : '#2fffb0');
  }
}

function floatText(txt, x, y, col) {
  const el = document.createElement('div');
  el.className = 'fn'; el.textContent = txt;
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  el.style.color = col || '#2fffb0';
  document.body.appendChild(el); setTimeout(() => el.remove(), 600)
}

function ntf(t) { const e = document.createElement('div'); e.className = 'nt'; e.textContent = t; document.body.appendChild(e); setTimeout(() => e.remove(), 2200) }

function showAchToast(title, desc) {
  const el = document.createElement('div');
  el.className = 'ach-toast';
  el.innerHTML = `🏆 <b>CONQUISTA: ${T(title)}</b><br><span style="color:#d8e0f8;font-size:11px;font-family:'Share Tech Mono',monospace;">${T(desc)}</span>`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

let dlgQueue = []; let isTyping = false;
function showTypewriterDlg(npc, text, isEvt = false) {
  dlgQueue.push({ npc, text, isEvt });
  if (!isTyping) processDlgQueue();
}
function processDlgQueue() {
  if (dlgQueue.length === 0) return;
  isTyping = true;
  const current = dlgQueue.shift();
  const box = document.getElementById('dlg-toast');
  box.innerHTML = '';
  const el = document.createElement('div');
  el.className = `dlg-msg ${current.isEvt ? 'evt' : ''}`;
  el.innerHTML = `<div class="da">${current.npc.a}</div><div class="dt"><b>ATLAS</b><span class="typewriter"></span></div>`;
  box.appendChild(el);

  const textSpan = el.querySelector('.typewriter');
  let i = 0;
  function typeChar() {
    if (i < current.text.length) {
      textSpan.innerHTML = current.text.substring(0, i + 1);
      i++;
      setTimeout(typeChar, 25);
    } else {
      textSpan.classList.remove('typewriter');
      setTimeout(() => {
        el.style.animation = 'do .4s ease-in forwards';
        setTimeout(() => { el.remove(); isTyping = false; processDlgQueue(); }, 400);
      }, 5000);
    }
  }
  typeChar();
}

function _panelInputFocused(panelId) {
  const fe = document.activeElement;
  if (!fe) return false;
  const tag = fe.tagName;
  if (tag !== 'INPUT' && tag !== 'SELECT' && tag !== 'TEXTAREA') return false;
  const panel = document.getElementById(panelId);
  return panel ? panel.contains(fe) : false;
}

function renderAll() {
  if (!_panelInputFocused('p-prod')) renderProd();
  if (typeof renderMarket === 'function' && !_panelInputFocused('p-mkt')) renderMarket();
  if (!_panelInputFocused('p-up')) renderUpgrades();
  if (!_panelInputFocused('p-stats')) renderStats();
  if (!_panelInputFocused('p-cfg')) renderConfig();
  if (typeof renderContracts === 'function' && !_panelInputFocused('p-mkt')) renderContracts();
  if (typeof renderBlackMarket === 'function' && !_panelInputFocused('p-bm')) renderBlackMarket();
  updateHUD();
}

function chkDlg() { DLGS.forEach(d => { if (G.sDlg.has(d.id)) return; if (d.tr()) { G.sDlg.add(d.id); showTypewriterDlg(MENTOR, T(d.t)) } }) }

document.addEventListener('DOMContentLoaded', () => {
  swT(document.querySelector('.tab[data-t="prod"]'));
  const loaded = loadGame();

  if (!loaded || !G.branch) {
    setTimeout(() => { introStep = 0; showIntroPopup(); }, 300);
  } else {
    if (!G.activeContracts) G.activeContracts = [];
    if (!G.lineRates) G.lineRates = new Array(8).fill(0);
    if (!G.lineStatus) G.lineStatus = new Array(8).fill('off');

    document.getElementById('r-raw-l').textContent = T('Matéria-prima');
    document.getElementById('r-mon-l').textContent = T('Créditos');
    document.getElementById('r-inv-l').textContent = T('Estoque');
    document.getElementById('pbtn').textContent = T('⟳ PRESTÍGIO');

    const pmTitle = document.getElementById('pm-title');
    if (pmTitle) pmTitle.textContent = T('ÁRVORE DE PRESTÍGIO');

    initTabs();
    startPhaserIfNeeded();
    renderAll();
    setTimeout(() => chkDlg(), 2000);
  }
});