function tickBlackMarket(dt) {
   if (G.bm_freeze) {
      G.bm_freezeTimer = (G.bm_freezeTimer || 0) - dt;
      if (G.bm_freezeTimer <= 0) {
         G.bm_freeze = false;
         G.bm_freezeTimer = 0;
         showTypewriterDlg(MENTOR, "Alerta: O Congelador Quântico esgotou a sua carga.", true);
      } else {
         G.heat = 0;
      }
   }
   if (G.bm_super) {
      G.bm_superTimer = (G.bm_superTimer || 0) - dt;
      if (G.bm_superTimer <= 0) {
         G.bm_super = false;
         G.bm_superTimer = 0;
         showTypewriterDlg(MENTOR, "Alerta: O Salto Duplo Temporal foi desativado.", true);
      }
   }
}

function buyBM(id) {
   if (id === 'freeze') {
      if (G.dm >= 2 && !G.bm_freeze) {
         G.dm -= 2;
         G.bm_freeze = true;
         G.bm_freezeTimer = 300;
         sndBuy(); renderBlackMarket();
      }
   } else if (id === 'super') {
      if (G.dm >= 3 && !G.bm_super) {
         G.dm -= 3;
         G.bm_super = true;
         G.bm_superTimer = 300;
         sndBuy(); renderBlackMarket();
      }
   } else if (id === 'bmax') {
      if (G.dm >= 5 && !G.bm_bmax) {
         G.dm -= 5;
         G.bm_bmax = true;
         sndBuy(); renderBlackMarket(); updateHUD();
      }
   } else if (id === 'comp') {
      const sel = document.getElementById('comp-line-sel');
      if (!sel) return;
      const li = parseInt(sel.value);
      if (isNaN(li)) return;

      if (typeof G.bm_comp !== 'object') G.bm_comp = {};
      const currentLvl = G.bm_comp[li] || 0;

      let costComp = Math.floor(5 * Math.pow(2, currentLvl));

      if (G.dm >= costComp) {
         G.dm -= costComp;
         G.bm_comp[li] = currentLvl + 1;
         sndBuy();
         renderBlackMarket();
         updateHUD();
         renderProd();
      }
   }
}

function triggerCollapse() {
   if (G.lines >= 8 && G.dm >= 10 && G.bm_bmax) {
      if (confirm("ATENÇÃO: O Colapso da Singularidade VAI DESTRUIR TODO SEU PROGRESSO ATUAL (Dinheiro, Upgrades, Matéria Escura, Investimentos da Árvore de Prestígio Normal)! Você receberá 1 PONTO GÊNESIS, multiplicando o rendimento base de vendas pela eternidade em 5x cumulativos. Tem certeza?")) {
         G.genesisPts = (G.genesisPts || 0) + 1;
         G.singularities = (G.singularities || 0) + 1;

         G.dm = 0;
         G.badges = 0;
         G.fragments = 0;
         G.pStars = 0;
         G.tpStars = 0;
         G.pCnt = 0;
         G.money = 15;
         G.tMon = 0;
         G.tProd = 0;
         G.era = 0;
         G.eraProg = 0;
         G.branch = null;
         G.ups = {};
         G.pUps = {};
         G.lineUps = [];
         G.lines = 1;
         G.inv = [];
         G.bm_bmax = false;
         G.bm_comp = {};
         G.bm_freeze = false;
         G.bm_super = false;
         G.activeContracts = [];
         G.expeditions = [];
         G.rivalShare = 0;

         G.assignedDirs = {};

         saveGame();
         window.location.reload();
      }
   }
}

function renderBlackMarket() {
   const c = document.getElementById('p-bm');
   if (!c) return;
   if (G.pCnt < 1) {
      c.innerHTML = '<div style="color:#4a5878;text-align:center;margin-top:20px;font-size:12px">Acesso negado. Requer Singularidade.</div>';
      return;
   }
   let h = `<div class="st" style="color:#8040ff">🌌 O Submundo</div>
  <div style="font-size:12px; color:#a080cc; margin-bottom:12px; text-align:center">Suas posses obscuras: <b>${G.dm} 🟣 Matéria Escura</b></div>`;

   let fzState = G.bm_freeze ? `Ativo (${Math.ceil(G.bm_freezeTimer || 0)}s)` : 'Adquirir';
   let fzDis = G.bm_freeze || G.dm < 2 ? 'dis' : '';
   h += `<div class="mkt-item" style="border-left:3px solid #8040ff; align-items:center;">
       <div class="mi-icon">❄️</div>
       <div class="mi-info"><div class="mi-name">Congelador Quântico</div><div style="font-size:9px; color:#5a6888;">Zera a geração de Heat por 5 minutos. Permite auto-click furioso e seguro.</div></div>
       <button class="mkt-btn mkt-buy ${fzDis}" onclick="buyBM('freeze')">${fzState}<br>2🟣</button>
  </div>`;

   let suState = G.bm_super ? `Ativo (${Math.ceil(G.bm_superTimer || 0)}s)` : 'Adquirir';
   let suDis = G.bm_super || G.dm < 3 ? 'dis' : '';
   h += `<div class="mkt-item" style="border-left:3px solid #ff4080; align-items:center;">
       <div class="mi-icon">⏱️</div>
       <div class="mi-info"><div class="mi-name">Salto Duplo Temporal</div><div style="font-size:9px; color:#5a6888;">Dobra a velocidade base de TODAS as esteiras por 5 minutos.</div></div>
       <button class="mkt-btn mkt-buy ${suDis}" onclick="buyBM('super')">${suState}<br>3🟣</button>
  </div>`;

   let mxState = G.bm_bmax ? 'Vendido' : 'Adquirir';
   let mxDis = G.bm_bmax || G.dm < 5 ? 'dis' : '';
   h += `<div class="mkt-item" style="border-left:3px solid #ffd740; align-items:center;">
       <div class="mi-icon">MAX</div>
       <div class="mi-info"><div class="mi-name">Capacidade Neural (Perm)</div><div style="font-size:9px; color:#5a6888;">Boost Máximo Permanente aumentado em +3x. Não sobrevive ao prestígio.</div></div>
       <button class="mkt-btn mkt-buy ${mxDis}" onclick="buyBM('bmax')">${mxState}<br>5🟣</button>
  </div>`;

   let selNode = document.getElementById('comp-line-sel');
   let selectedLi = selNode ? parseInt(selNode.value) : 0;
   if (selectedLi >= G.lines) selectedLi = 0;

   if (typeof G.bm_comp !== 'object') G.bm_comp = {};

   let selHtml = `<select id="comp-line-sel" onchange="renderBlackMarket()" style="background:#0b0e18; color:#2fffb0; border:1px solid #2fffb0; border-radius:4px; margin-top:6px; padding:2px; max-width: 100%;">`;
   for (let i = 0; i < G.lines; i++) {
      const lvl = G.bm_comp[i] || 0;
      const isSelected = i === selectedLi ? 'selected' : '';
      selHtml += `<option value="${i}" ${isSelected}>L${i + 1}: Atu x${Math.pow(10, lvl)} → Próx x${Math.pow(10, lvl + 1)}</option>`;
   }
   selHtml += `</select>`;

   const currentLvl = G.bm_comp[selectedLi] || 0;
   let currentCost = Math.floor(5 * Math.pow(2, currentLvl));
   let cpDis = G.dm < currentCost ? 'dis' : '';

   h += `<div class="mkt-item" style="border-left:3px solid #2fffb0; align-items:center;">
       <div class="mi-icon">📦</div>
       <div class="mi-info"><div class="mi-name">Compressão Quântica</div><div style="font-size:9px; color:#5a6888;">Evolui o agrupamento (x10, x100...). Salva o FPS e Libera +25 Upgrades de Velocidade naquela linha.</div>${selHtml}</div>
       <button class="mkt-btn mkt-buy ${cpDis}" onclick="buyBM('comp')">Evoluir<br>${currentCost}🟣</button>
  </div>`;

   if (G.lines >= 8) {
      h += `<div class="st" style="margin-top:20px; color:#ff3050; border-top:1px solid #ff3050; padding-top:10px;">🔴 Evento Cataclísmico</div>`;
      const canCollapse = G.dm >= 10 && G.bm_bmax;
      h += `<div class="mkt-item" style="border-left:3px solid #ff3050; align-items:center; background:rgba(255,50,80,0.05);">
           <div class="mi-icon">🕳️</div>
           <div class="mi-info"><div class="mi-name" style="color:#ff3050">Colapso da Singularidade</div><div style="font-size:9px; color:#5a6888;">Sacrifica tudo, até seu Prestígio Normal. Gera 1 Esfera Gênesis (+5x de Multiplicador Permanente Oculto). Requer Nível 8 de Esteiras e 10 Matéria Escura.</div></div>
           <button class="mkt-btn mkt-buy ${canCollapse ? '' : 'dis'}" style="${canCollapse ? 'background-color:#ff3050; color:#fff;' : ''}" onclick="triggerCollapse()">COLAPSAR<br>10🟣</button>
      </div>`;
   }

   c.innerHTML = h;
}