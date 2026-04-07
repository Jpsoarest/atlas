let mgInterval = null;
let mgTimeLeft = 10;
let mgActive = false;
let mgType = 0; // 0=Anomalias, 1=Sequencia, 2=Pressão

// Variáveis Tipo 0
let mgNodesLeft = 10;

// Variáveis Tipo 1
let mgSeqTarget = 1;
let mgSeqMax = 8;

// Variáveis Tipo 2
let mgSpamClicks = 0;
let mgSpamGoal = 35;

function startMinigame(forceType = -1) {
    if(mgActive) return;
    mgActive = true;
    
    mgType = forceType >= 0 ? forceType : Math.floor(Math.random() * 5);
    
    const modal = document.getElementById('minigame-modal');
    modal.style.display = 'flex';
    document.getElementById('mg-close-btn').style.display = 'none';
    
    const area = document.getElementById('minigame-area');
    area.innerHTML = '';
    
    const title = modal.querySelector('h2');
    const desc = modal.querySelector('p');

    // === ATLAS TUTORIAL — apenas na primeira vez por tipo ===
    const tutorialKey = `mg_tut_${mgType}`;
    const isFirstTime = !(G.sDlg && G.sDlg.has(tutorialKey));
    if (isFirstTime && G.sDlg) {
        G.sDlg.add(tutorialKey);
        const tutorials = [
            // Tipo 0: Anomalias
            'ALERTA: Nós quânticos instáveis detectados na matriz de produção. Protocolo de contenção iniciado. Você tem segundos para eliminar cada nó antes que colapsom. Clique neles rapidamente.',
            // Tipo 1: Sequência
            'BLOQUEIO DE NÚCLEO DETECTADO. O sistema de segurança exige autenticação por sequência numérica. Identifique a ordem correta (1 ao 8) e clique nos blocos um a um. Qualquer erro reinicia a sequência.',
            // Tipo 2: Pressão
            'SOBRECARGA CRÍTICA. Os reatores estão acima da temperatura de fusão. Clique repetidamente no botão de resfriamento até zerar a barra de calor. Velocidade é essencial.',
            // Tipo 3: Fiação
            'CURTO CIRCUITO NOS CONDUTOS. Cabos de energia precisam ser reconectados por cor. Clique em um cabo de um lado, depois no cabo correspondente do outro lado. Errar a cor custa tempo.',
            // Tipo 4: Cofre
            'COFRE DE SEGURANÇA ATIVADO. O sistema de backup está sob senha numérica de 3 dígitos. Use as setas para ajustar cada dígito. As dicas acima/abaixo indicam se você está mais alto ou mais baixo que o valor correto.'
        ];
        setTimeout(() => {
            if (typeof showTypewriterDlg === 'function') {
                showTypewriterDlg(MENTOR, tutorials[mgType] || tutorials[0], true);
            }
        }, 300);
    }
    
    if (mgType === 0) {
        title.innerText = '⚠️ ANOMALIA DETECTADA';
        desc.innerText = 'Apague os nós quânticos instáveis clicando neles antes que explodam!';
        mgTimeLeft = 15.0;
        mgNodesLeft = 12;
        for(let i=0; i<4; i++) spawnNode(area);
        mgInterval = setInterval(() => tickType0(area), 100);
    } else if (mgType === 1) {
        title.innerText = '🔐 SEQUENCIAMENTO MÚLTIPLO';
        desc.innerText = 'Clique nos blocos na ordem exata (1 ao 8) para religar o núcleo!';
        mgTimeLeft = 12.0;
        mgSeqTarget = 1;
        mgSeqMax = 8;
        setupSequence(area);
        mgInterval = setInterval(() => tickTimeOnly(), 100);
    } else if (mgType === 2) {
        title.innerText = '🔥 SOBRECARGA ENERGÉTICA';
        desc.innerText = 'CUIDADO! Clique no botão de resfriamento MÚLTIPLAS VEZES para estabilizar!';
        mgTimeLeft = 10.0;
        mgSpamClicks = 0;
        mgSpamGoal = 35;
        setupPressure(area);
        mgInterval = setInterval(() => tickTimeOnly(), 100);
    } else if (mgType === 3) {
        title.innerText = '🔌 CURTO CIRCUITO';
        desc.innerText = 'Ligue os cabos conectando as extremidades da MESMA COR (clique de um lado e depois do outro)!';
        mgTimeLeft = 15.0;
        setupWiring(area);
        mgInterval = setInterval(() => tickTimeOnly(), 100);
    } else if (mgType === 4) {
        title.innerText = '🔒 DECODIFICADOR';
        desc.innerText = 'Descubra a senha de 3 dígitos! Siga as setas (▲/▼) para maior ou menor.';
        mgTimeLeft = 18.0;
        setupSafeLock(area);
        mgInterval = setInterval(() => tickTimeOnly(), 100);
    }
    
    updateMgTimerDisplay();
}


// ==== TIPO 0: NÓS ==== //
function tickType0(area) {
    mgTimeLeft -= 0.1;
    updateMgTimerDisplay();
    if(Math.random() < 0.25 && area.getElementsByClassName('mg-target').length < 6 && mgNodesLeft > area.getElementsByClassName('mg-target').length) {
        spawnNode(area);
    }
    if (mgTimeLeft <= 0) endMinigame(false);
}

function spawnNode(area) {
    if (mgNodesLeft <= 0) return;
    const node = document.createElement('div');
    node.className = 'mg-target';
    const x = 15 + Math.random() * (area.clientWidth - 30);
    const y = 15 + Math.random() * (area.clientHeight - 30);
    node.style.left = x + 'px';
    node.style.top = y + 'px';
    
    node.onclick = () => {
        if(typeof sndClick === 'function') sndClick();
        node.remove();
        mgNodesLeft--;
        if (mgNodesLeft <= 0) {
            endMinigame(true);
        } else {
             if(Math.random() > 0.4) spawnNode(area);
        }
    };
    area.appendChild(node);
}

// ==== TIPO 1: SEQUÊNCIA ==== //
function setupSequence(area) {
    const arr = [];
    for(let i=1; i<=mgSeqMax; i++) arr.push(i);
    arr.sort(() => Math.random() - 0.5); // shuffle
    
    area.style.display = 'flex';
    area.style.flexWrap = 'wrap';
    area.style.gap = '10px';
    area.style.justifyContent = 'center';
    area.style.alignItems = 'center';
    area.style.padding = '20px';
    
    for(let num of arr) {
        const btn = document.createElement('div');
        btn.innerText = num;
        btn.style.width = '50px';
        btn.style.height = '50px';
        btn.style.background = 'rgba(0,220,160,0.1)';
        btn.style.border = '2px solid rgba(0,220,160,0.4)';
        btn.style.borderRadius = '8px';
        btn.style.display = 'flex';
        btn.style.justifyContent = 'center';
        btn.style.alignItems = 'center';
        btn.style.fontSize = '24px';
        btn.style.fontWeight = 'bold';
        btn.style.cursor = 'pointer';
        
        btn.onclick = () => {
            if (num === mgSeqTarget) {
                btn.style.background = '#2fffb0';
                btn.style.color = '#000';
                btn.style.pointerEvents = 'none';
                mgSeqTarget++;
                if(typeof sndClick === 'function') sndClick();
                if (mgSeqTarget > mgSeqMax) {
                    endMinigame(true);
                }
            } else {
                // Errou!
                if(typeof sndFail === 'function') sndFail();
                btn.style.background = '#ff5050';
                setTimeout(() => {
                    mgSeqTarget = 1;
                    setupSequence(area); // Reset
                }, 400);
            }
        };
        area.appendChild(btn);
    }
}

// ==== TIPO 2: PRESSÃO ==== //
function setupPressure(area) {
    area.style.display = 'flex';
    area.style.flexDirection = 'column';
    area.style.justifyContent = 'center';
    area.style.alignItems = 'center';
    
    const barWrap = document.createElement('div');
    barWrap.style.width = '80%';
    barWrap.style.height = '30px';
    barWrap.style.background = 'rgba(255,80,80,0.2)';
    barWrap.style.border = '2px solid #ff5050';
    barWrap.style.borderRadius = '15px';
    barWrap.style.overflow = 'hidden';
    barWrap.style.marginBottom = '30px';
    barWrap.style.marginTop = '20px';
    
    const barLine = document.createElement('div');
    barLine.id = 'mg-press-bar';
    barLine.style.width = '100%';
    barLine.style.height = '100%';
    barLine.style.background = 'linear-gradient(90deg, #ffb850, #ff5050)';
    barWrap.appendChild(barLine);
    
    const btn = document.createElement('div');
    btn.innerText = '🔥 RESFRIAR 🔥';
    btn.style.padding = '15px 40px';
    btn.style.background = '#2fffb0';
    btn.style.color = '#0b0e18';
    btn.style.fontSize = '24px';
    btn.style.fontWeight = '900';
    btn.style.borderRadius = '30px';
    btn.style.cursor = 'pointer';
    btn.style.boxShadow = '0 0 20px #2fffb0';
    btn.style.transition = 'transform 0.05s';
    btn.style.userSelect = 'none';
    
    btn.onmousedown = () => btn.style.transform = 'scale(0.9)';
    btn.onmouseup = () => btn.style.transform = 'scale(1)';
    btn.onmouseleave = () => btn.style.transform = 'scale(1)';
    
    btn.onclick = () => {
        mgSpamClicks++;
        let pct = Math.max(0, 100 - (mgSpamClicks / mgSpamGoal * 100));
        barLine.style.width = pct + '%';
        if (pct <= 0) {
            endMinigame(true);
        }
    };
    
    area.appendChild(barWrap);
    area.appendChild(btn);
}

// ==== GERAL ==== //
function tickTimeOnly() {
    mgTimeLeft -= 0.1;
    updateMgTimerDisplay();
    if (mgTimeLeft <= 0) endMinigame(false);
}

function updateMgTimerDisplay() {
    const d = document.getElementById('mg-time-display');
    if (!d) return;
    d.innerText = Math.max(0, mgTimeLeft).toFixed(1) + 's';
    if(mgTimeLeft < 5) d.style.color = '#ff5050';
    else d.style.color = '#ffb850';
}

function endMinigame(win) {
    clearInterval(mgInterval);
    mgActive = false;
    const area = document.getElementById('minigame-area');
    area.innerHTML = '';
    area.style.display = 'block';
    
    const winMsgs = [
        '✅ CONTENÇÃO BEM-SUCEDIDA',
        '✅ SISTEMA ESTABILIZADO',
        '✅ ANOMALIA NEUTRALIZADA',
        '✅ NÚCLEO RESTAURADO',
        '✅ PROTOCOLO ENCERRADO'
    ];
    const loseMsgs = [
        '❌ FALHA CRÍTICA — SISTEMA COMPROMETIDO',
        '❌ CONTENÇÃO FRACASSADA — DANOS REGISTRADOS',
        '❌ TEMPO EXPIRADO — ANOMALIA PERSISTENTE',
        '❌ NÚCLEO INSTÁVEL — INTERVENÇÃO FALHOU',
        '❌ PROTOCOLO ABORTADO'
    ];

    if (win) {
        document.getElementById('mg-time-display').innerHTML =
            `<span style="color:#2fffb0;font-family:'Orbitron',sans-serif">${winMsgs[mgType] || winMsgs[0]}</span>`;
        grantMinigameRewards();
    } else {
        document.getElementById('mg-time-display').innerHTML =
            `<span style="color:#ff5050;font-family:'Orbitron',sans-serif">${loseMsgs[mgType] || loseMsgs[0]}</span>`;
        if(typeof sndFail === 'function') sndFail();
        // ATLAS comenta a derrota
        const atlasLose = [
            'Protocolo de contenção falhou. Registrando incidente. Os danos serão absorvidos pelo sistema.',
            'Anomalia não contida. A resiliência da fábrica mantém operações mínimas. Tente novamente.',
            'Falha operacional registrada. Não há penalidade permanente — só perda de bônus potencial.',
            'Sistema comprometido temporariamente. ATLAS está corrigindo os parâmetros. Fábrica estável.'
        ];
        setTimeout(() => {
            if (typeof showTypewriterDlg === 'function')
                showTypewriterDlg(MENTOR, atlasLose[Math.floor(Math.random() * atlasLose.length)], false);
        }, 600);
    }
    
    document.getElementById('mg-close-btn').style.display = 'block';
    setTimeout(() => {
        if(document.getElementById('minigame-modal').style.display !== 'none') {
            closeMinigame();
        }
    }, 4000);
}

function closeMinigame() {
    document.getElementById('minigame-modal').style.display = 'none';
}

function grantMinigameRewards() {
    if(typeof sndAch === 'function') sndAch();
    
    const maxVal = getItems()[Math.max(0, G.lines-1)]?.val || 1;
    const bonusT = Math.max(1, mgTimeLeft / 5);
    const moneyBonus = maxVal * getValMult() * (600 * bonusT);
    G.money += moneyBonus;
    
    G.cBoost = getBoostMax() * 2;
    G.heat = 0;
    G.overheated = false;
    const cb = document.getElementById('cbtn');
    if (cb) cb.classList.remove('overheat');
    
    const gotDM = Math.random() < 0.35;
    if (gotDM) {
        G.dm = (G.dm || 0) + 1;
        floatText('🟣 MATÉRIA ESCURA ENCONTRADA!', window.innerWidth/2, window.innerHeight/2 - 60, '#a080cc');
    }
    
    floatText(`💰 BÔNUS: +${fmt(moneyBonus)}`, window.innerWidth/2, window.innerHeight/2 - 30, '#ffd740');
    floatText('⚡ SUPER RECARGA', window.innerWidth/2, window.innerHeight/2 + 30, '#ffb850');

    // ATLAS — comentário de vitória com sabor narrativo
    const atlasWin = [
        `Excelente execução. Bônus de ${fmt(moneyBonus)} creditado. Sua precisão não passa despercebida, Administrador.`,
        `Anomalia eliminada. Eficiência registrada. Créditos extras liberados como compensação operacional.`,
        `Protocolo encerrado com sucesso. O sistema reconhece sua competência. ${gotDM ? 'Matéria Escura extraída do evento — raro.' : 'Continue assim.'}`,
        `Contenção perfeita. O ATLAS processou o bônus de produção. Cada intervenção bem-sucedida fortalece o Império.`,
        `Sistema restaurado. A fábrica opera acima da capacidade nominal. Bônus de super-recarga ativado.`
    ];
    setTimeout(() => {
        if (typeof showTypewriterDlg === 'function')
            showTypewriterDlg(MENTOR, atlasWin[Math.floor(Math.random() * atlasWin.length)], false);
    }, 1200);
}


// ==== TIPO 3: FIAÇÃO (WIRING) ==== //
let mgWireSelected = null;
let mgWiresLeft = 4;
function setupWiring(area) {
    const colors = ['#ff5050', '#2fffb0', '#50a0ff', '#ffb850']; // Vermelho, Verde, Azul, Amarelo
    let leftCols = [...colors].sort(() => Math.random() - 0.5);
    let rightCols = [...colors].sort(() => Math.random() - 0.5);
    mgWiresLeft = 4;
    mgWireSelected = null;

    area.style.display = 'flex';
    area.style.justifyContent = 'space-between';
    area.style.alignItems = 'center';
    area.style.padding = '20px 40px';
    
    const leftCol = document.createElement('div');
    const rightCol = document.createElement('div');
    leftCol.style.display = 'flex'; leftCol.style.flexDirection = 'column'; leftCol.style.gap = '15px';
    rightCol.style.display = 'flex'; rightCol.style.flexDirection = 'column'; rightCol.style.gap = '15px';
    
    area.appendChild(leftCol);
    area.appendChild(rightCol);

    for(let i=0; i<4; i++) {
        const lb = createWireNode(leftCols[i], 'left', area);
        const rb = createWireNode(rightCols[i], 'right', area);
        leftCol.appendChild(lb);
        rightCol.appendChild(rb);
    }
}

function createWireNode(color, side, area) {
    const btn = document.createElement('div');
    btn.dataset.color = color;
    btn.dataset.side = side;
    btn.style.width = '30px';
    btn.style.height = '30px';
    btn.style.borderRadius = '50%';
    btn.style.background = color;
    btn.style.border = '2px solid rgba(255,255,255,0.5)';
    btn.style.cursor = 'pointer';
    btn.style.boxShadow = `0 0 10px ${color}`;
    
    btn.onclick = () => {
        if(btn.dataset.connected) return;
        
        if (!mgWireSelected || mgWireSelected.dataset.side === side) {
            // Seleciona o primeiro ou troca de mesma coluna
            if(mgWireSelected) { mgWireSelected.style.border = '2px solid rgba(255,255,255,0.5)'; mgWireSelected.style.transform = 'scale(1)'; }
            mgWireSelected = btn;
            btn.style.border = '4px solid #fff';
            btn.style.transform = 'scale(1.2)';
            if(typeof sndClick === 'function') sndClick();
        } else {
            // Tentou conectar
            if (mgWireSelected.dataset.color === color) {
                // Sucesso
                btn.dataset.connected = "true";
                mgWireSelected.dataset.connected = "true";
                btn.style.opacity = 0.3; mgWireSelected.style.opacity = 0.3;
                btn.style.transform = 'scale(1)'; mgWireSelected.style.transform = 'scale(1)';
                mgWireSelected = null;
                mgWiresLeft--;
                if(typeof sndBuy === 'function') sndBuy();
                if(mgWiresLeft <= 0) endMinigame(true);
            } else {
                // Errou a cor
                if(typeof sndFail === 'function') sndFail();
                mgWireSelected.style.border = '2px solid rgba(255,255,255,0.5)';
                mgWireSelected.style.transform = 'scale(1)';
                mgWireSelected = null;
                // Penalidade opcional de tempo
                mgTimeLeft = Math.max(0, mgTimeLeft - 1.5);
            }
        }
    };
    return btn;
}

// ==== TIPO 4: COFRE DECODIFICADOR ==== //
let mgSafeTarget = [0,0,0];
let mgSafeCurrent = [5,5,5];
function setupSafeLock(area) {
    for(let i=0; i<3; i++) mgSafeTarget[i] = Math.floor(Math.random() * 10);
    mgSafeCurrent = [5,5,5];
    
    area.style.display = 'flex';
    area.style.flexDirection = 'column';
    area.style.justifyContent = 'center';
    area.style.alignItems = 'center';
    
    const tip = document.createElement('div');
    tip.id = 'mg-safe-tip';
    tip.innerText = 'Analise a fechadura...';
    tip.style.marginBottom = '20px';
    tip.style.fontSize = '14px';
    tip.style.color = '#8a98b0';
    area.appendChild(tip);

    const dialsBox = document.createElement('div');
    dialsBox.style.display = 'flex';
    dialsBox.style.gap = '20px';
    area.appendChild(dialsBox);

    for(let i=0; i<3; i++) {
        const col = document.createElement('div');
        col.style.display = 'flex'; col.style.flexDirection = 'column'; col.style.alignItems = 'center'; col.style.gap = '5px';
        
        const bUp = document.createElement('button');
        bUp.innerText = '▲'; bUp.className = 'dbg-btn';
        bUp.onclick = () => { mgSafeCurrent[i] = (mgSafeCurrent[i]+1)%10; updateSafe(i, col); checkSafe(tip); };
        
        const disp = document.createElement('div');
        disp.className = 'safe-disp';
        disp.innerText = mgSafeCurrent[i];
        disp.style.fontSize = '30px'; disp.style.fontWeight = 'bold'; disp.style.color = '#2fffb0';
        disp.style.background = 'rgba(255,255,255,0.05)'; disp.style.padding = '10px 15px'; disp.style.borderRadius = '8px';
        
        const bDown = document.createElement('button');
        bDown.innerText = '▼'; bDown.className = 'dbg-btn';
        bDown.onclick = () => { mgSafeCurrent[i] = (mgSafeCurrent[i]-1+10)%10; updateSafe(i, col); checkSafe(tip); };
        
        col.appendChild(bUp); col.appendChild(disp); col.appendChild(bDown);
        dialsBox.appendChild(col);
    }
    checkSafe(tip);
}

function updateSafe(idx, colNode) {
    colNode.querySelector('.safe-disp').innerText = mgSafeCurrent[idx];
    if(typeof sndClick === 'function') sndClick();
}

function checkSafe(tipNode) {
    let perfect = true;
    let hints = [];
    for(let i=0; i<3; i++) {
        if(mgSafeCurrent[i] !== mgSafeTarget[i]) perfect = false;
        if(mgSafeCurrent[i] < mgSafeTarget[i]) hints.push('Maior');
        else if(mgSafeCurrent[i] > mgSafeTarget[i]) hints.push('Menor');
        else hints.push('OK');
    }
    
    if(perfect) {
        endMinigame(true);
    } else {
        tipNode.innerHTML = `Estatus: <span style="color:#ffb850">${hints.join(' | ')}</span>`;
    }
}
