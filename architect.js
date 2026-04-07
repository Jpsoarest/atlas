let archTool = 'belt';

function setArchTool(t) {
    archTool = t;
    renderArchitect();
}

const ARCH_COLORS = {
    'belt': '#3a5a6a',
    'mach': '#2fffb0',
    'in': '#ffb850',
    'out': '#ff5050',
    'empty': 'rgba(255,255,255,0.05)'
};

const ARCH_ICONS = {
    'belt': '▸',
    'mach': '⚙️',
    'in': '📥',
    'out': '📤',
    'empty': ''
};

function paintArchGrid(r, c) {
    let inCount = 0;
    let outCount = 0;
    for (let i = 0; i < 64; i++) {
        if (G.archMap[i] === 'in') inCount++;
        if (G.archMap[i] === 'out') outCount++;
    }

    const idx = r * 8 + c;

    if (archTool === 'in' && inCount >= 1 && G.archMap[idx] !== 'in') {
        alert("Apenas 1 Entrada permitida por enquanto!"); return;
    }
    if (archTool === 'out' && outCount >= 1 && G.archMap[idx] !== 'out') {
        alert("Apenas 1 Saída permitida por enquanto!"); return;
    }

    G.archMap[idx] = archTool;

    calcArchEfficiency();
    saveGame();
    renderArchitect();
}

function calcArchEfficiency() {
    let startIndex = -1;
    let targetIndex = -1;

    for (let i = 0; i < 64; i++) {
        if (G.archMap[i] === 'in') startIndex = i;
        if (G.archMap[i] === 'out') targetIndex = i;
    }

    G.architectLoss = 0;
    G.architectCap = 0;
    if (startIndex === -1 || targetIndex === -1) return;

    let visited = new Set();
    let machsInPath = 0;
    let beltsInPath = 0;

    function dfs(idx) {
        if (idx < 0 || idx >= 64) return false;
        if (visited.has(idx)) return false;

        const type = G.archMap[idx];
        if (type === 'empty') return false;

        visited.add(idx);

        if (type === 'mach') machsInPath++;
        if (type === 'belt') beltsInPath++;

        if (idx === targetIndex) return true;

        let r = Math.floor(idx / 8);
        let c = idx % 8;

        let pathWorks = false;
        if (r > 0 && dfs((r - 1) * 8 + c)) pathWorks = true;
        else if (r < 7 && dfs((r + 1) * 8 + c)) pathWorks = true;
        else if (c > 0 && dfs(r * 8 + c - 1)) pathWorks = true;
        else if (c < 7 && dfs(r * 8 + c + 1)) pathWorks = true;

        return pathWorks;
    }

    if (dfs(startIndex)) {
        G.architectLoss = (machsInPath * 0.01);
        G.architectCap = (beltsInPath * 20);
    }
}

function renderArchitect() {
    const cont = document.getElementById('p-arch');
    if (!cont) return;

    if (G.era < 5) {
        cont.innerHTML = '<div style="color:#4a5878;text-align:center;margin-top:20px;font-size:12px">Módulo de Arquitetura Retido. Avance para a Era 5.</div>';
        return;
    }

    if (!G.archMap) {
        G.archMap = new Array(64).fill('empty');
        calcArchEfficiency();
    }

    let h = `<div class="st" style="color:#2fffb0">📐 Arquiteto Ciberfísico</div>`;
    h += `<div style="font-size:10px; color:#c0d0fe; margin-bottom:12px; text-align:center; background:rgba(47,255,176,0.05); padding:8px; border-radius:6px; border:1px solid rgba(47,255,176,0.2);">
        <b>TUTORIAL:</b> Monte uma planta de roteamento limpo para extrair bônus logísticos globais. O caminho precisa interligar a 📥 Entrada e a 📤 Saída sem interrupções.<br>
        <b>▸ Esteiras</b>: +20 de Capacidade de Estoque Base / cada.<br>
        <b>⚙️ Máquinas</b>: -1% de Perda (Itens Quebrados) / cada.
    </div>`;

    h += `<div style="text-align:center; margin-bottom:15px;">`;
    if (G.architectCap > 0 || G.architectLoss > 0) {
        h += `<div style="color:#2fffb0; font-weight:bold; font-size:12px;">✅ Fluxo Válido! Capacidade: +${G.architectCap} | Perda: -${(G.architectLoss * 100).toFixed(0)}%</div>`;
    } else {
        h += `<div style="color:#ff5050; font-size:11px;">⚠️ Circuito Quebrado ou Incompleto. Sem Bônus.</div>`;
    }
    h += `</div>`;

    h += `<div style="display:flex; justify-content:center; gap:8px; margin-bottom:15px;">`;
    const tools = [
        { id: 'in', n: '📥 Entrada' },
        { id: 'out', n: '📤 Saída' },
        { id: 'belt', n: '▸ Esteira' },
        { id: 'mach', n: '⚙️ Máquina' },
        { id: 'empty', n: '❌ Apagar' }
    ];

    tools.forEach(t => {
        const isAct = archTool === t.id;
        h += `<button class="mkt-btn" style="${isAct ? 'background:#2fffb0; color:#000; font-weight:bold;' : ''}" onclick="setArchTool('${t.id}')">${t.n}</button>`;
    });
    h += `</div>`;

    h += `<div style="display:grid; grid-template-columns: repeat(8, 1fr); gap:2px; max-width: 300px; margin: 0 auto; background:#1c1e2e; padding:4px; border:1px solid #3a4a5a;">`;

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const idx = r * 8 + c;
            const t = G.archMap[idx];
            h += `<div onclick="paintArchGrid(${r},${c})" style="aspect-ratio: 1; background:${ARCH_COLORS[t]}; display:flex; align-items:center; justify-content:center; cursor:crosshair; user-select:none; font-size:16px;">
                ${ARCH_ICONS[t]}
            </div>`;
        }
    }

    h += `</div>`;
    cont.innerHTML = h;
}