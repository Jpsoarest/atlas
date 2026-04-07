let contractTimer = 0;
const CONTRACT_INTERVAL = 300; // 5 min
const PENALTY_FACTOR = 0.5;

function tickContracts(dt) {
  if (G.era < 1) return;
  contractTimer += dt;
  if(contractTimer >= CONTRACT_INTERVAL) {
    contractTimer = 0;
    generateContracts();
  }
  
  // Recalcula reserva de contratos ativos para o sell system
  const ctRes = [];
  for (const c of G.activeContracts) {
    if (c.status === 'active') {
      const already = G.inv[c.item] || 0;
      // Reserva = quanto ainda falta para o contrato, limitado ao estoque existente
      const needed = Math.max(0, c.amount - (c.delivered || 0));
      ctRes[c.item] = (ctRes[c.item] || 0) + Math.min(needed, already);
    }
  }
  G.contractReserve = ctRes;

  let changed = false;
  for(let i = G.activeContracts.length - 1; i >= 0; i--) {
     let c = G.activeContracts[i];
     if(c.status !== 'active') continue;
     c.timeLeft -= dt;
     if(c.timeLeft <= 0) {
        c.status = 'failed';
        G.money -= c.penalty;
        changed = true;
        showTypewriterDlg(MENTOR, `Contrato Falhou. Multa de ${fmt(c.penalty)} aplicada.`, true);
        sndFail();
     } else {
        // Verifica se o inventário tem o suficiente (prioridade sobre autoReserve)
        const needed = c.amount - (c.delivered || 0);
        const available = G.inv[c.item] || 0;
        if (available >= needed) {
           // Conclui o contrato
           G.inv[c.item] -= needed;
           if (G.inv[c.item] < 0) G.inv[c.item] = 0;
           G.money += c.reward;
           if (c.dmReward > 0) G.dm += c.dmReward;
           G.completedContracts++;
           c.status = 'completed';
           changed = true;
           showTypewriterDlg(MENTOR, `Contrato Concluído! +${fmt(c.reward)} 💰 ${c.dmReward>0?('(+'+c.dmReward+'🟣)'):''}`);
           sndBuy();
        } else if (available > 0) {
           // Entrega parcial automática: acumula o que tiver
           c.delivered = (c.delivered || 0) + available;
           G.inv[c.item] = 0;
           changed = true;
        }
     }
  }
  if(changed && typeof renderContracts === "function") renderContracts();
}

function generateContracts() {
   // Generate 1 to 2 new contracts
   const num = 1 + Math.floor(Math.random()*2);
   let maxItem = Math.min(G.lines - 1, 7);
   if(maxItem < 0) maxItem = 0;
   
   for(let i=0; i<num; i++) {
      const itemIdx = Math.floor(Math.random() * (maxItem + 1));
      const val = getItems()[itemIdx].val;
      const amount = 50 + Math.floor(Math.random() * 200 * (itemIdx + 1));
      
      const isHuge = Math.random() < 0.1; // 10% chance of HUGE contract
      const amtFinal = isHuge ? amount * 5 : amount;
      
      const timeSecs = isHuge ? 600 : (120 + Math.random() * 240); // 2 to 6 mins
      
      const reward = (amtFinal * val) * (isHuge ? 3 : 1.5) * getValMult();
      const penalty = reward * PENALTY_FACTOR;
      let dmReward = 0;
      if (isHuge && G.pCnt >= 1) dmReward = 1 + Math.floor(Math.random() * 3);
      
      G.activeContracts.push({
         id: Date.now() + Math.random(),
         item: itemIdx,
         itemName: getItems()[itemIdx].n,
         amount: amtFinal,
         timeLeft: timeSecs,
         maxTime: timeSecs,
         reward: reward,
         penalty: penalty,
         dmReward: dmReward,
         status: 'ready' // 'ready', 'active', 'completed', 'failed'
      });
   }
   if(G.activeContracts.length > 5) {
     const toRem = G.activeContracts.findIndex(c => c.status !== 'active');
     if(toRem >= 0) G.activeContracts.splice(toRem, 1);
     else G.activeContracts.shift();
   }
   if(typeof renderContracts === "function") renderContracts();
}

function acceptContract(idx) {
  if(G.activeContracts[idx]) {
     G.activeContracts[idx].status = 'active';
     renderContracts();
  }
}

function renderContracts() {
  if (typeof currentMarketTab !== 'undefined' && currentMarketTab !== 'contracts') return;
  const c=document.getElementById('p-mkt');
  if(!c) return;
  
  let h = '';
  if (typeof getMarketTabsHTML === 'function') h += getMarketTabsHTML();
  
  if(G.era < 1) {
     c.innerHTML = h + '<div style="color:#4a5878;text-align:center;margin-top:20px;font-size:12px">Sistemas de contratos bloqueados nesta Era.</div>';
     return;
  }
  h += '<div class="st">📋 Contratos Corporativos</div>';
  if(G.activeContracts.length === 0) {
      h += '<div style="color:#4a5878;text-align:center;margin-top:20px;font-size:12px">Nenhum contrato disponível. Aguardando.</div>';
  } else {
      G.activeContracts.slice().reverse().forEach((ct, i) => {
         const realIdx = G.activeContracts.length - 1 - i;
         if(ct.status === 'completed') {
            h += `<div class="mkt-item" style="border-left:3px solid #2fffb0; opacity:0.6"><div class="mi-icon">✅</div><div class="mi-info"><div class="mi-name">Contrato Cumprido</div><div style="font-size:10px; color:#2fffb0">+💰${fmt(ct.reward)}</div></div></div>`;
         } else if (ct.status === 'failed') {
            h += `<div class="mkt-item" style="border-left:3px solid #ff5050; opacity:0.6"><div class="mi-icon">❌</div><div class="mi-info"><div class="mi-name">Contrato Falhou</div><div style="font-size:10px; color:#ff5050">-💰${fmt(ct.penalty)}</div></div></div>`;
         } else if (ct.status === 'ready') {
            h += `<div class="mkt-item" style="border-left:3px solid #ffb850"><div class="mi-icon">📜</div><div class="mi-info"><div class="mi-name">Demanda: ${fmt(ct.amount)}x ${ct.itemName}</div>
            <div style="font-size:9px; color:#5a6888; margin-top:2px;">Tempo: ${Math.floor(ct.maxTime)}s | Punição: <span style="color:#ff5050">-💰${fmt(ct.penalty)}</span></div>
            <div class="mi-price"><span class="up">Recompensa: 💰${fmt(ct.reward)} ${ct.dmReward>0?`| 🟣+${ct.dmReward}`:''}</span></div>
            </div><button class="mkt-btn mkt-buy" onclick="acceptContract(${realIdx})">ACEITAR</button></div>`;
         } else if (ct.status === 'active') {
            const delivered = ct.delivered || 0;
            const total = ct.amount;
            const remaining = total - delivered;
            const has = G.inv[ct.item] || 0;
            const pct = Math.min(100, (delivered / total) * 100);
            const inStock = Math.min(has, remaining);
            h += `<div class="mkt-item" style="border-left:3px solid #3090ff; flex-direction:column; align-items: stretch;">
               <div style="display:flex; justify-content:space-between">
                 <div class="mi-name">Entregar: ${fmt(total)}x ${ct.itemName}</div>
                 <div style="color:${ct.timeLeft<30?'#ff5050':'#ffb850'}; font-size:10px;">${Math.floor(ct.timeLeft)}s</div>
               </div>
               <div style="display:flex; justify-content:space-between; margin-top:4px">
                 <div style="font-size:9px; color:#5a6888">Entregue: ${fmt(delivered)} / ${fmt(total)} ${inStock>0?`<span style="color:#2fffb0">(+${fmt(inStock)} no estoque)</span>`:''}</div>
                 <div style="font-size:9px; color:#2fffb0">+💰${fmt(ct.reward)} ${ct.dmReward>0?`(+${ct.dmReward}🟣)`:''}</div>
               </div>
               <div class="heat-bar" style="margin-top:6px; background:rgba(0,0,0,0.4);"><div class="heat-fill" style="width:${pct}%; background:${pct>=100?'#2fffb0':'#3090ff'};"></div></div>
            </div>`;

         }
      });
  }
  c.innerHTML=h;
}
