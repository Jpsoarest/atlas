function renderArtifacts() {
    const c = document.getElementById('p-artifacts');
    if (!c) return;

    if (G.era < 3) {
        c.innerHTML = '<div style="color:#4a5878;text-align:center;margin-top:20px;font-size:12px">Instituto Arqueológico Bloqueado. Avance de Era.</div>';
        return;
    }

    if (!G.archGrid) G.archGrid = new Array(16).fill(false);
    if (!G.fragments) G.fragments = 0;

    let h = `<div class="st" style="color:#e0b040">🏛️ Instituto Arqueológico</div>`;
    h += `<div style="font-size:10px; color:#8a98b0; background:rgba(224,176,64,0.05); border:1px solid rgba(224,176,64,0.2); padding:8px; border-radius:6px; margin-bottom:12px; line-height:1.4; text-align:center;">
        <b>TUTORIAL:</b> O subsolo alienígena esconde relíquias antigas. Restaure-as usando <b>Fragmentos (🧩)</b> para obter aumentos permanentes de velocidade e multiplicadores de valor. <br>Fragmentos são encontrados em <b>Expedições Médias e Longas</b>.
    </div>`;
    h += `<div style="font-size:12px; color:#c0d0fe; margin-bottom:12px; text-align:center;">Fragmentos Pessoais: <b>🧩 ${G.fragments}</b></div>`;

    let baseBoost = 0;
    G.archGrid.forEach(v => { if (v) baseBoost += 2; });

    let completedRows = 0;
    for (let r = 0; r < 4; r++) {
        if (G.archGrid[r * 4] && G.archGrid[r * 4 + 1] && G.archGrid[r * 4 + 2] && G.archGrid[r * 4 + 3]) completedRows++;
    }

    h += `<div style="text-align:center; margin-bottom: 20px; font-size:12px; background:rgba(200,150,50,0.1); border:1px solid rgba(200,150,50,0.2); padding: 5px; border-radius: 8px;">`;
    h += `Força Mística Despertada: <span style="color:#2fffb0">+${baseBoost}% Velocity</span><br>`;
    if (completedRows > 0) h += `<span style="color:#ffb850; font-weight:bold;">Sinergia Espacial Ativa: x${Math.pow(2, completedRows)} Valores Virtuais!</span>`;
    h += `</div>`;

    h += `<div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:6px; max-width: 250px; margin: 0 auto;">`;

    for (let i = 0; i < 16; i++) {
        const unl = G.archGrid[i];
        if (unl) {
            h += `<div style="background:linear-gradient(135deg, #e0b040, #ff8030); border-radius:4px; height:50px; display:flex; align-items:center; justify-content:center; box-shadow: 0 0 10px rgba(224,176,64,0.3);">
                <span style="font-size:20px; filter:drop-shadow(0 2px 2px rgba(0,0,0,0.5))">🏺</span>
            </div>`;
        } else {
            const canAfford = G.fragments >= 1;
            h += `<div onclick="unlockArtifact(${i})" style="cursor:${canAfford ? 'pointer' : 'not-allowed'}; background:rgba(0,0,0,0.5); border:1px dashed #5a6888; border-radius:4px; height:50px; display:flex; flex-direction:column; align-items:center; justify-content:center; transition: 0.2s;">
                <span style="font-size:16px; opacity:0.3">❓</span>
                <span style="font-size:8px; color:${canAfford ? '#2fffb0' : '#5a6888'}; font-weight:bold;">1🧩</span>
            </div>`;
        }
    }

    h += `</div>`;
    c.innerHTML = h;
}

function unlockArtifact(i) {
    if (G.archGrid[i]) return;
    if (G.fragments >= 1) {
        G.fragments--;
        G.archGrid[i] = true;
        if (typeof sndBuy === 'function') sndBuy();
        saveGame();
        renderArtifacts();
        if (typeof renderProd === 'function') renderProd();
    }
}