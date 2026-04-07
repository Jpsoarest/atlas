const DIRECTOR_POOL = [
    { id: 'd_n1', name: 'Estagiário Prodígio', rarity: 'N', color: '#5a6888', buff: { spdMult: 1.05, lossReduction: 0.10 } },
    { id: 'd_n2', name: 'Engenheiro Júnior', rarity: 'N', color: '#5a6888', buff: { spdMult: 1.10, lossReduction: 0.05 } },
    { id: 'd_n3', name: 'Auditor Leigo', rarity: 'N', color: '#5a6888', buff: { spdMult: 1.02, lossReduction: 0.20 } },
    { id: 'd_r1', name: 'Gerente de Chão', rarity: 'R', color: '#3090ff', buff: { spdMult: 1.25, lossReduction: 0.25 } },
    { id: 'd_r2', name: 'Engenheiro Sênior', rarity: 'R', color: '#3090ff', buff: { spdMult: 1.35, lossReduction: 0.10 } },
    { id: 'd_sr1', name: 'Vice-Presidente de Operações', rarity: 'SR', color: '#a080cc', buff: { spdMult: 1.60, lossReduction: 0.40 } },
    { id: 'd_sr2', name: 'Sábio da Logística', rarity: 'SR', color: '#a080cc', buff: { spdMult: 1.40, lossReduction: 0.60 } },
    { id: 'd_ssr1', name: 'CEO Intergaláctico', rarity: 'SSR', color: '#ffd740', buff: { spdMult: 2.50, lossReduction: 0.80 } },
    { id: 'd_ssr2', name: 'Mente Colmeia Artificial', rarity: 'SSR', color: '#ffd740', buff: { spdMult: 3.00, lossReduction: 0.50 } },
];

function getDirectorBuff(id) {
    const d = DIRECTOR_POOL.find(x => x.id === id);
    if (!d) return { spdMult: 1, lossReduction: 0 };
    return d.buff;
}

function getRarityDrop() {
    const r = Math.random();
    if (r < 0.01) return 'SSR';
    if (r < 0.10) return 'SR';
    if (r < 0.40) return 'R';
    return 'N';
}

function drawDirector() {
    if (G.badges >= 1) {
        G.badges -= 1;
        const rarity = getRarityDrop();
        const pool = DIRECTOR_POOL.filter(x => x.rarity === rarity);
        const rolled = pool[Math.floor(Math.random() * pool.length)];

        G.directors.push(rolled.id);

        showTypewriterDlg(MENTOR, `Contrato Assinado! Você recrutou [${rolled.rarity}] ${rolled.name}. Designe-o a uma esteira.`, true);
        if (typeof sndAch === 'function') sndAch();
        saveGame();
        renderPersonnel();
    }
}

function assignDirector(dirId) {
    const availableLine = prompt("Digite o número da esteira para designar este Diretor (Ex: 1 para L1):");
    const li = parseInt(availableLine) - 1;

    if (isNaN(li) || li < 0 || li >= G.lines) {
        alert("Linha inválida ou ainda bloqueada!");
        return;
    }

    const currDir = G.assignedDirs[li];

    const ownedTotal = G.directors.filter(x => x === dirId).length;
    let assignedCount = 0;
    for (let k in G.assignedDirs) {
        if (G.assignedDirs[k] === dirId) assignedCount++;
    }

    if (assignedCount >= ownedTotal) {
        alert("Todos os diretores desta classe já estão em uso!");
        return;
    }

    G.assignedDirs[li] = dirId;
    saveGame();
    renderPersonnel();
    if (typeof renderProd === 'function') renderProd();
}

function unassignDirectorLine(li) {
    if (G.assignedDirs[li]) {
        delete G.assignedDirs[li];
        saveGame();
        renderPersonnel();
        if (typeof renderProd === 'function') renderProd();
    }
}

function formatBuff(buff) {
    let t = [];
    if (buff.spdMult > 1) t.push(`Speed +${Math.round((buff.spdMult - 1) * 100)}%`);
    if (buff.lossReduction > 0) t.push(`Perda -${Math.round(buff.lossReduction * 100)}%`);
    return t.join(' | ');
}

function renderPersonnel() {
    const c = document.getElementById('p-personnel');
    if (!c) return;

    if (G.era < 4) {
        c.innerHTML = '<div style="color:#4a5878;text-align:center;margin-top:20px;font-size:12px">RH Bloqueado. Avance as eras para atrair especialistas.</div>';
        return;
    }

    if (!G.directors) G.directors = [];
    if (!G.badges) G.badges = 0;
    if (!G.assignedDirs) G.assignedDirs = {};

    let h = `<div class="st" style="color:#3090ff">🏢 Sala do Conselho (Operações Especiais)</div>`;
    h += `<div style="font-size:10px; color:#8a98b0; background:rgba(48,144,255,0.05); border:1px solid rgba(48,144,255,0.2); padding:8px; border-radius:6px; margin-bottom:12px; line-height:1.4; text-align:center;">
        <b>TUTORIAL:</b> Recrute Diretores de diferentes raridades (N, R, SR, SSR) para chefiar suas linhas de produção. Eles concedem bônus passivos massivos. <br>Para recrutá-los, você precisa de <b>Crachás Físicos (🎫)</b>, que são obtidos concluindo <b>Expedições Longas</b> na aba Mercado.
    </div>`;
    h += `<div style="font-size:12px; color:#c0d0fe; margin-bottom:12px; text-align:center">Crachás Disponíveis: <b>🎫 ${G.badges}</b></div>`;

    const canDraw = G.badges >= 1;
    h += `<div class="mkt-item" style="border-left:3px solid #ffb850; align-items:center;">
        <div class="mi-icon">🎲</div>
        <div class="mi-info"><div class="mi-name">Recrutamento Global</div><div style="font-size:9px; color:#5a6888;">Gasta 1 Crachá obtido em Expedições para puxar um Especialista aleatório no gacha.</div></div>
        <button class="mkt-btn mkt-buy ${canDraw ? '' : 'dis'}" onclick="drawDirector()">Puxar (-1🎫)</button>
    </div>`;

    h += `<div class="st" style="margin-top:15px; font-size:11px;">Linhas em Operação</div>`;

    for (let i = 0; i < G.lines; i++) {
        const dId = G.assignedDirs[i];
        if (!dId) {
            h += `<div class="mkt-item" style="border-left:2px solid #3a4868; padding: 4px; align-items:center;">
                <div style="font-size:10px; flex:1">L${i + 1}: - Vazio -</div>
            </div>`;
        } else {
            const dir = DIRECTOR_POOL.find(x => x.id === dId);
            h += `<div class="mkt-item" style="border-left:2px solid ${dir.color}; padding: 4px; align-items:center;">
                <div style="font-size:10px; flex:1">L${i + 1}: <span style="color:${dir.color}; font-weight:bold">[${dir.rarity}] ${dir.name}</span></div>
                <div style="font-size:9px; color:#2fffb0; margin-right: 10px;">${formatBuff(dir.buff)}</div>
                <button class="mkt-btn mkt-sell-btn" style="padding:2px 6px; font-size:9px;" onclick="unassignDirectorLine(${i})">Remover</button>
            </div>`;
        }
    }

    h += `<div class="st" style="margin-top:15px; font-size:11px;">Equipe Contratada (Piscina)</div>`;

    let ownedCounts = {};
    G.directors.forEach(id => ownedCounts[id] = (ownedCounts[id] || 0) + 1);

    let activeCounts = {};
    for (let i in G.assignedDirs) {
        activeCounts[G.assignedDirs[i]] = (activeCounts[G.assignedDirs[i]] || 0) + 1;
    }

    let hasAny = false;
    DIRECTOR_POOL.forEach(dir => {
        const owned = ownedCounts[dir.id] || 0;
        if (owned > 0) {
            hasAny = true;
            const active = activeCounts[dir.id] || 0;
            const free = owned - active;
            h += `<div class="mkt-item" style="border-left:2px solid ${dir.color}; flex-direction:column; padding: 6px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                   <div style="font-size:11px; font-weight:bold; color:${dir.color}">[${dir.rarity}] ${dir.name} (x${owned})</div>
                   <button class="mkt-btn mkt-buy ${free > 0 ? '' : 'dis'}" style="padding:2px 6px; font-size:9px;" onclick="assignDirector('${dir.id}')">Designar</button>
                </div>
                <div style="font-size:9px; color:#a0b0d0; margin-top:2px;">Passivo: ${formatBuff(dir.buff)}</div>
                <div style="font-size:9px; color:#5a6888; margin-top:2px;">Disponíveis para uso: ${free}</div>
            </div>`;
        }
    });

    if (!hasAny) {
        h += `<div style="text-align:center; font-size:10px; color:#5a6888; margin-top:10px;">Você não possui diretores ativos.</div>`;
    }

    c.innerHTML = h;
}