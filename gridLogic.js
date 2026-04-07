// --- LÓGICA ESTRUTURAL DO GRID (Não Visual) ---
// type: 'belt', 'machine', 'merger', 'splitter'
// dir: 0 (Direita), 1 (Baixo), 2 (Esquerda), 3 (Cima)

function placeGridNode(x, y, type, dir = 0, tier = 0) {
    if (!G.grid) G.grid = {};
    const key = `${x},${y}`;

    // Regras de negócio podem ser adicionadas aqui (ex: checar colisão, checar dinheiro)
    if (G.grid[key]) return false; // Célula ocupada

    G.grid[key] = { type, dir, tier };
    return true;
}

function removeGridNode(x, y) {
    if (!G.grid) return;
    const key = `${x},${y}`;
    if (G.grid[key]) {
        delete G.grid[key];
        // Reembolso de custo pode entrar aqui
        return true;
    }
    return false;
}

function getGridNode(x, y) {
    if (!G.grid) return null;
    return G.grid[`${x},${y}`] || null;
}

// A base do Pathfinding que substituirá a matemática estática no futuro
function tracePath(startX, startY) {
    let currentX = startX;
    let currentY = startY;
    let path = [];
    let loopProtect = 0;

    while (loopProtect < 100) {
        loopProtect++;
        const node = getGridNode(currentX, currentY);
        if (!node || node.type !== 'belt') break;

        path.push({ x: currentX, y: currentY, dir: node.dir });

        if (node.dir === 0) currentX++;
        else if (node.dir === 1) currentY++;
        else if (node.dir === 2) currentX--;
        else if (node.dir === 3) currentY--;
    }
    return path;
}