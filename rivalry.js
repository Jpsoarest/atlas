// rivalry.js

function tickRivalry(dt) {
    if(G.era < 3) return; // Só começa na Era 3
    if(!G.rivalShare) G.rivalShare = 0;
    
    const growthRate = 0.05 * dt; // 0.05% sec
    G.rivalShare = Math.min(100, G.rivalShare + growthRate);
}

function sabotageRival() {
    if(G.dm >= 3) {
        G.dm -= 3;
        G.rivalShare = Math.max(0, G.rivalShare - 40);
        floatText('-40% Market Share', window.innerWidth/2, window.innerHeight/2, '#2fffb0');
        if(typeof sndBuy==='function') sndBuy();
        saveGame();
        renderRivalry();
        updateHUD();
    }
}

function campaignRival() {
    const cost = 50000 * Math.max(1, G.era) * Math.max(1, G.lines/2);
    if(G.money >= cost) {
        G.money -= cost;
        G.rivalShare = Math.max(0, G.rivalShare - 15);
        floatText('-15% Market Share', window.innerWidth/2, window.innerHeight/2, '#2fffb0');
        if(typeof sndBuy==='function') sndBuy();
        saveGame();
        renderRivalry();
        updateHUD();
    }
}

function renderRivalry() {
    const c = document.getElementById('p-rivalry');
    if(!c) return;
    
    if(G.era < 3) {
        c.innerHTML = '<div style="color:#4a5878;text-align:center;margin-top:20px;font-size:12px">Radar limpo. Sem corporações inimigas detectadas no momento (Requer Era 3).</div>';
        return;
    }
    
    if(!G.rivalShare) G.rivalShare = 0;
    const share = G.rivalShare.toFixed(1);
    
    let rivalImpact = (G.rivalShare || 0) * 0.005; // 100% -> 0.5x
    let penaltyPct = (rivalImpact * 100).toFixed(1);
    
    let h = `<div class="st" style="color:#ff5050; padding:10px; text-align:center; border: 1px solid rgba(255,80,80,0.2); background: rgba(255,80,80,0.05); border-radius: 8px;">👿 Corporação OMEGA</div>`;
    h += `<div style="font-size:12px; color:#c0d0fe; margin:12px 0; text-align:center">Eles estão monopolizando o mercado, desvalorizando os seus lucros!</div>`;
    
    // Progress Bar
    h += `<div class="heat-bar" style="height:25px; margin-bottom:10px; border:2px solid #ff5050; border-radius:12px;"><div class="heat-fill" style="width:${share}%; background:linear-gradient(90deg, #ffb850, #ff5050);"></div></div>`;
    
    h += `<div style="text-align:center; font-size:14px; font-weight:bold; color:#ff5050; margin-bottom: 20px;">Fatia da OMEGA: ${share}%<br><span style="font-size:12px; color:#ffb850">📉 Margem de Lucro Reduzida em: -${penaltyPct}%</span></div>`;
    
    const campCost = 50000 * Math.max(1, G.era) * Math.max(1, G.lines/2);
    const canCamp = G.money >= campCost;
    h += `<div class="mkt-item" style="border-left:3px solid #3090ff; align-items:center;">
        <div class="mi-icon">📺</div>
        <div class="mi-info"><div class="mi-name">Campanha de Difamação</div><div style="font-size:9px; color:#5a6888;">Distorce dados mercadológicos para abalar a Omega. Reduz domínio em -15% instantaneamente.</div></div>
        <button class="mkt-btn mkt-buy ${canCamp?'':'dis'}" onclick="campaignRival()">Lançar<br>💰${fmt(campCost)}</button>
    </div>`;
    
    const canSab = G.dm >= 3;
    h += `<div class="mkt-item" style="border-left:3px solid #a080cc; align-items:center;">
        <div class="mi-icon">💣</div>
        <div class="mi-info"><div class="mi-name">Sabotagem Industrial</div><div style="font-size:9px; color:#5a6888;">Plantas da Omega explodem magicamente. Reduz domínio em -40% instantaneamente.</div></div>
        <button class="mkt-btn mkt-buy ${canSab?'':'dis'}" onclick="sabotageRival()">Iniciar<br>3🟣</button>
    </div>`;
    
    c.innerHTML = h;
}
