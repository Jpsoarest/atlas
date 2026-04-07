// expeditions.js

let availableMissions = [];

function generateMissions() {
    availableMissions = [];
    const eraB = Math.max(1, G.era);
    const maxI = Math.max(0, G.lines - 1);
    const items = getItems();
    if(items.length===0) return;
    
    // Short Mission (10 mins)
    availableMissions.push({
        id: 'short_' + Date.now(),
        type: 'Curta',
        durationSec: 600, // 10 min
        reqItem: maxI,
        reqAmt: Math.floor(100 * eraB * (1+Math.random()*0.5)),
        rewMoney: 1000 * eraB,
        rewDM: Math.random() < 0.2 ? 1 : 0
    });
    
    // Medium Mission (2 horas)
    availableMissions.push({
        id: 'med_' + Date.now(),
        type: 'Média',
        durationSec: 7200, // 2 horas
        reqItem: Math.max(0, maxI - 1),
        reqAmt: Math.floor(5000 * eraB * (1+Math.random()*0.5)),
        rewMoney: 25000 * eraB,
        rewDM: Math.random() < 0.8 ? 2 : 1,
        rewBadge: 0,
        rewFrag: 1
    });

    // Long Mission (8 horas)
    availableMissions.push({
        id: 'long_' + Date.now(),
        type: 'Longa',
        durationSec: 28800, // 8 horas
        reqItem: maxI,
        reqAmt: Math.floor(40000 * eraB * (1+Math.random()*0.5)),
        rewMoney: 200000 * eraB,
        rewDM: 5 + Math.floor(Math.random()*3),
        rewBadge: 1,
        rewFrag: 2 + Math.floor(Math.random()*3)
    });
}

function launchExpedition(mid) {
    const mis = availableMissions.find(m => m.id === mid);
    if(!mis) return;
    const has = G.inv[mis.reqItem] || 0;
    if(has < mis.reqAmt) {
        floatText('Recursos insuficientes!', window.innerWidth/2, window.innerHeight/2, '#ff5050');
        return;
    }
    
    G.inv[mis.reqItem] -= mis.reqAmt;
    
    if(!G.expeditions) G.expeditions = [];
    G.expeditions.push({
        id: mis.id,
        type: mis.type,
        endT: Date.now() + (mis.durationSec * 1000),
        durationSec: mis.durationSec,
        rewMoney: mis.rewMoney,
        rewDM: mis.rewDM,
        rewBadge: mis.rewBadge || 0,
        rewFrag: mis.rewFrag || 0,
        name: `Sonda ${mis.type} Alpha`
    });
    
    if(typeof sndBuy==='function') sndBuy();
    generateMissions(); // rotate missions
    saveGame();
    renderExped();
}

function claimExpedition(idx) {
    const exp = G.expeditions[idx];
    if(!exp) return;
    if(Date.now() < exp.endT) return;
    
    G.money += exp.rewMoney;
    if(exp.rewDM > 0) G.dm += exp.rewDM;
    if(exp.rewBadge > 0) {
        if(!G.badges) G.badges = 0;
        G.badges += exp.rewBadge;
    }
    if(exp.rewFrag > 0) {
        if(!G.fragments) G.fragments = 0;
        G.fragments += exp.rewFrag;
    }
    
    floatText(`💰 +${fmt(exp.rewMoney)}`, window.innerWidth/2, window.innerHeight/2 - 20, '#ffd740');
    if(exp.rewDM > 0) floatText(`🟣 +${exp.rewDM}`, window.innerWidth/2, window.innerHeight/2 - 40, '#a080cc');
    if(exp.rewBadge > 0) floatText(`🎫 +${exp.rewBadge} CRACHÁ`, window.innerWidth/2, window.innerHeight/2 - 60, '#3090ff');
    if(exp.rewFrag > 0) floatText(`🧩 +${exp.rewFrag} FRAG`, window.innerWidth/2, window.innerHeight/2 - 80, '#e0b040');
    
    if(typeof sndAch==='function') sndAch();
    
    G.expeditions.splice(idx, 1);
    saveGame();
    renderExped();
}

function renderExped() {
    if (typeof currentMarketTab !== 'undefined' && currentMarketTab !== 'exped') return;
    const c=document.getElementById('p-mkt');
    if(!c) return;
    if(!G.expeditions) G.expeditions = [];

    let h = '';
    if (typeof getMarketTabsHTML === 'function') h += getMarketTabsHTML();
    h += '<div class="st">🚀 Expedições Orbitais</div>';
    
    if(G.era < 2) {
       c.innerHTML = h + '<div style="color:#4a5878;text-align:center;margin-top:20px;font-size:12px">Tecnologia espacial ausente nesta Era.</div>';
       return;
    }

    // Active/Finished Expeditions
    if(G.expeditions.length > 0) {
        G.expeditions.forEach((exp, idx) => {
            const now = Date.now();
            const done = now >= exp.endT;
            const leftSecs = Math.max(0, Math.floor((exp.endT - now)/1000));
            const pct = done ? 100 : Math.min(100, 100 - (leftSecs / exp.durationSec)*100);
            
            h += `<div class="mkt-item" style="border-left:3px solid ${done?'#2fffb0':'#50a0ff'}; flex-direction:column; align-items: stretch; margin-bottom: 10px;">
               <div style="display:flex; justify-content:space-between">
                 <div class="mi-name">${exp.name}</div>
                 <div style="color:${done?'#2fffb0':'#ffb850'}; font-size:10px; font-weight:bold;">${done ? 'CONCLUÍDO' : leftSecs+'s'}</div>
               </div>
               <div style="display:flex; justify-content:space-between; margin-top:4px">
                 <div style="font-size:9px; color:#5a6888">Recompensa: 💰${fmt(exp.rewMoney)} ${exp.rewDM>0?`(+${exp.rewDM}🟣)`:''} ${exp.rewBadge>0?`(+${exp.rewBadge}🎫)`:''}</div>
               </div>
               <div class="heat-bar" style="margin-top:6px; background:rgba(0,0,0,0.4);"><div class="heat-fill" style="width:${pct}%; background:${done?'#2fffb0':'#50a0ff'};"></div></div>
               ${done ? `<button class="mkt-btn mkt-buy" style="margin-top:8px; width:100%" onclick="claimExpedition(${idx})">RESGATAR COLETAS</button>` : ''}
            </div>`;
        });
    }

    h += '<div class="st" style="margin-top:15px">📡 Novas Rotas</div>';
    
    if(availableMissions.length === 0) generateMissions();
    
    const maxExpeditions = 1 + (G.pUps.pe||0); // can buy prestige upg for more
    if(G.expeditions.length >= maxExpeditions) {
        h += `<div style="color:#4a5878;text-align:center;margin-top:10px;font-size:12px">Limite de frota atingido (${G.expeditions.length}/${maxExpeditions}).</div>`;
    } else {
        const items = getItems();
        availableMissions.forEach(mis => {
            const itemName = items[mis.reqItem]?.n || '???';
            const has = G.inv[mis.reqItem] || 0;
            const canAf = has >= mis.reqAmt;
            h += `<div class="mkt-item" style="border-left:3px solid #ffb850; flex-direction:column;">
                <div style="display:flex; justify-content:space-between; width: 100%;">
                    <div class="mi-name">Viagem ${mis.type} (${Math.floor(mis.durationSec/60)}m)</div>
                    <div class="mi-price" style="color:#ffb850">Custo: ${fmt(mis.reqAmt)}x ${itemName}</div>
                </div>
                <div style="display:flex; justify-content:space-between; flex-wrap:wrap; margin-top:5px; width: 100%; align-items:center;">
                    <div style="font-size:10px; color:#2fffb0">Ganhos: 💰${fmt(mis.rewMoney)} ${mis.rewDM>0?`| 🟣${mis.rewDM}`:''} ${(mis.rewBadge||0)>0?`| 🎫${mis.rewBadge}`:''} ${(mis.rewFrag||0)>0?`| 🧩${mis.rewFrag}`:''}</div>
                    <button class="mkt-btn mkt-buy ${canAf?'':'dis'}" onclick="launchExpedition('${mis.id}')">ENVIAR</button>
                </div>
            </div>`;
        });
    }
    
    c.innerHTML=h;
}

let lastExpedRender = 0;
// Ensure tick calls re-render if active
function tickExpeditions() {
    if(!G.expeditions) return;
    let anyDone = false;
    G.expeditions.forEach((exp) => {
        if(!exp.notified && Date.now() >= exp.endT) {
            exp.notified = true;
            anyDone = true;
        }
    });
    if(anyDone) {
        showTypewriterDlg(MENTOR, "Uma de nossas Sondas de Expedição retornou com carga valiosa!", true);
    }
    // Update UI actively if looking at it
    if(typeof currentMarketTab !== 'undefined' && currentMarketTab === 'exped') {
        const now = Date.now();
        if(now - lastExpedRender > 1000) {
            lastExpedRender = now;
            // Apenas renderiza a GUI 1 vez por segundo, evitando destruir os DOM Clicks!
            renderExped();
        }
    }
}
