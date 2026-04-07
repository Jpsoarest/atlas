const ERAS = [
  { n: 'Garagem', sub: 'O Início do Legado', th: 480, bg1: 0x14161e, bg2: 0x121420, wc: 0x666 },
  { n: 'Oficina', sub: 'Ferramentas Tomam Forma', th: 3e3, bg1: 0x181a24, bg2: 0x161822, wc: 0xa84 },
  { n: 'Fábrica', sub: 'A Máquina Acorda', th: 18e3, bg1: 0x161c28, bg2: 0x141a28, wc: 0x48a },
  { n: 'Indústria', sub: 'Empires São Forjados', th: 12e4, bg1: 0x142024, bg2: 0x121e26, wc: 0x4a4 },
  { n: 'Corporação', sub: 'O Capital Não Ten Piedade', th: 12e5, bg1: 0x1c162a, bg2: 0x1a1428, wc: 0x84a },
  { n: 'Multinacional', sub: 'Continentes Curvam-Se', th: 15e6, bg1: 0x20161a, bg2: 0x1e141a, wc: 0xa44 },
  { n: 'Espacial', sub: 'Além dos Horizontes', th: 3e8, bg1: 0x0e1a2c, bg2: 0x0c182c, wc: 0x4af },
  { n: 'Intergaláctica', sub: 'A Singularidade Se Aproxima', th: Infinity, bg1: 0x160e2a, bg2: 0x140c28, wc: 0xfa0 }
];

const BRANCHES = {
  automotive: {
    n: 'Automotiva', i: '🚗', cl: 0x2090dd, desc: 'Peças mecânicas → naves', raw: 'Ferro', rawEmoji: '<img src="assets/img/iron/iron.png" style="width:1.2em; height:1.2em; vertical-align:-0.2em; object-fit:contain;">', items: [
      { n: 'Parafuso', val: 1.4, recipe: null, icon: 'hex', clr: '#9098a8', sz: 9 }, { n: 'Engrenagem', val: 7, recipe: { 0: 3 }, icon: 'gear', clr: '#d4a830', sz: 11 },
      { n: 'Pistão', val: 35, recipe: { 1: 2, 0: 4 }, icon: 'piston', clr: '#b0c8e0', sz: 13 }, { n: 'Motor', val: 210, recipe: { 2: 2, 1: 3 }, icon: 'engine', clr: '#5090cc', sz: 17 },
      { n: 'Chassi', val: 1400, recipe: { 3: 2, 0: 8 }, icon: 'chassis', clr: '#50b878', sz: 19 }, { n: 'Veículo', val: 11200, recipe: { 4: 1, 3: 2, 1: 6 }, icon: 'car', clr: '#3090ff', sz: 23 },
      { n: 'Nave Orbital', val: 112e3, recipe: { 5: 2, 3: 4 }, icon: 'ship', clr: '#20d0ff', sz: 27 }, { n: 'Nave Capital', val: 14e5, recipe: { 6: 2, 3: 8, 1: 30 }, icon: 'capital', clr: '#ffd740', sz: 31 }]
  },
  weapons: {
    n: 'Armamento', i: '⚔️', cl: 0xdd3838, desc: 'Ferramentas → armas cósmicas', raw: 'Aço', rawEmoji: '⚔️', items: [
      { n: 'Lâmina', val: 1.4, recipe: null, icon: 'blade', clr: '#c0c0c8', sz: 9 }, { n: 'Ferramenta', val: 7, recipe: { 0: 3 }, icon: 'tool', clr: '#d05050', sz: 11 },
      { n: 'Mecanismo', val: 35, recipe: { 1: 2, 0: 4 }, icon: 'mech', clr: '#b87050', sz: 13 }, { n: 'Armamento', val: 210, recipe: { 2: 2, 1: 3 }, icon: 'weapon', clr: '#ff5050', sz: 17 },
      { n: 'Míssil', val: 1400, recipe: { 3: 2, 0: 6 }, icon: 'missile', clr: '#ff7848', sz: 19 }, { n: 'Sistema Laser', val: 11200, recipe: { 4: 2, 2: 4 }, icon: 'laser', clr: '#ff9848', sz: 23 },
      { n: 'Canhão Plasma', val: 112e3, recipe: { 5: 2, 4: 3 }, icon: 'plasma', clr: '#ffb848', sz: 27 }, { n: 'Destruidor', val: 14e5, recipe: { 6: 2, 5: 8 }, icon: 'destroyer', clr: '#ff3030', sz: 31 }]
  },
  food: {
    n: 'Alimentos', i: '🍔', cl: 0x30bb50, desc: 'Ingredientes → ambrosia', raw: 'Grãos', rawEmoji: '🌾', items: [
      { n: 'Ingrediente', val: 1.4, recipe: null, icon: 'ingr', clr: '#70c070', sz: 9 }, { n: 'Massa', val: 7, recipe: { 0: 3 }, icon: 'dough', clr: '#d8c090', sz: 11 },
      { n: 'Refeição', val: 35, recipe: { 1: 2, 0: 4 }, icon: 'meal', clr: '#c89050', sz: 13 }, { n: 'Lote', val: 210, recipe: { 2: 2, 1: 4 }, icon: 'batch', clr: '#987050', sz: 17 },
      { n: 'Carga', val: 1400, recipe: { 3: 2, 0: 6 }, icon: 'cargo', clr: '#50b858', sz: 19 }, { n: 'Suprimento', val: 11200, recipe: { 4: 2, 3: 3 }, icon: 'supply', clr: '#30d898', sz: 23 },
      { n: 'Nutriente Q.', val: 112e3, recipe: { 5: 2, 4: 4 }, icon: 'nutrient', clr: '#20e0b0', sz: 27 }, { n: 'Ambrosia', val: 14e5, recipe: { 6: 2, 5: 8 }, icon: 'ambrosia', clr: '#ffd740', sz: 31 }]
  },
  tech: {
    n: 'Tecnologia', i: '💻', cl: 0x9050dd, desc: 'Chips → singularidade', raw: 'Silício', rawEmoji: '💎', items: [
      { n: 'Transistor', val: 1.4, recipe: null, icon: 'trans', clr: '#b080ff', sz: 9 }, { n: 'Chip', val: 7, recipe: { 0: 3 }, icon: 'chip', clr: '#9070ff', sz: 11 },
      { n: 'Placa-Mãe', val: 35, recipe: { 1: 2, 0: 5 }, icon: 'board', clr: '#50b070', sz: 13 }, { n: 'Módulo', val: 210, recipe: { 2: 2, 1: 3 }, icon: 'module', clr: '#5070ff', sz: 17 },
      { n: 'Servidor', val: 1400, recipe: { 3: 2, 2: 4 }, icon: 'server', clr: '#3050cc', sz: 19 }, { n: 'Núcleo IA', val: 11200, recipe: { 4: 2, 3: 6 }, icon: 'aicore', clr: '#b050ff', sz: 23 },
      { n: 'Proc. Quântico', val: 112e3, recipe: { 5: 2, 4: 4 }, icon: 'quantum', clr: '#5090ff', sz: 27 }, { n: 'Singularidade', val: 14e5, recipe: { 6: 2, 5: 8 }, icon: 'singularity', clr: '#e0e0f0', sz: 31 }]
  }
};

const LINE_COSTS = [0, 30, 300, 3e3, 3e4, 3e5, 3e6, 3e7];
const LINE_UPS = [
  { id: 'spd', n: 'Velocidade', d: '+12% vel.', ic: '⚡', co: 5, cm: 1.6, mx: 30, tip: 'Velocidade da esteira.' },
  { id: 'qual', n: 'Qualidade', d: '-3% perda', ic: '✓', co: 8, cm: 1.65, mx: 25, tip: 'Reduz defeitos.' },
  { id: 'mach', n: 'Máquina', d: '+1 proc.', ic: '🏭', co: 15, cm: 2.2, mx: 6, tip: 'Processamento paralelo.' },
  { id: 'eff', n: 'Eficiência', d: '-8% insumos', ic: '♻️', co: 12, cm: 1.85, mx: 12, tip: 'Menos matéria-prima por item.' },
  { id: 'over', n: 'Overclock', d: '+25% Vel', ic: '🔥', co: 50, cm: 2.1, mx: 15, tip: 'Aceleração brutal. Aumenta perdas em 2% por nível.' }
];
const GLOBAL_UPS = {
  global: {
    n: '🌐 Global', ups: [
      { id: 'gl1', n: 'Fundação', d: '+50% Vel L1', co: 150, cm: 2.5, mx: 15, tip: 'Acelera exclusivamente a Linha 1 para alimentar a cadeia produtiva.' },
      { id: 'gspd', n: 'Sincronia', d: '+3% vel.', co: 60, cm: 2, mx: 15, tip: 'Bônus modesto global.' },
      { id: 'gval', n: 'Reputação', d: '+3% valor', co: 50, cm: 1.9, mx: 20, tip: 'Valor base de mercado.' },
      { id: 'gcap', n: 'Armazém', d: '+50 cap.', co: 12, cm: 1.5, mx: 30, tip: 'Estoque máximo.' },
      { id: 'gcap2', n: 'Armazém XL', d: '+200 cap.', co: 500, cm: 2.3, mx: 15, tip: 'Grande expansão.' },
      { id: 'gfuel', n: 'Tanque M.', d: '+500 Comb.', co: 200, cm: 2.5, mx: 10, tip: 'Capacidade do tanque.' },
      { id: 'gresf', n: 'Resfriamento', d: '+10 resf./s', co: 250, cm: 1.6, mx: 20, tip: 'Acelera perda de calor passiva.' }]
  },
  workers: {
    n: '👷 Funcionários', ups: [
      { id: 'w_op', n: 'Operário', d: '1 cli/s', co: 300, cm: 2.8, mx: 15, tip: 'Trabalha na bancada clicando por você.' },
      { id: 'w_ven', n: 'Vendedor', d: 'Vendas C.', co: 90, cm: 1, mx: 1, tip: 'Venda automática limite.' },
      { id: 'w_com', n: 'Comprador', d: 'Compras', co: 600, cm: 1, mx: 1, tip: 'Compra Matéria-prima automático.' },
      { id: 'w_mec', n: 'Mecânico', d: '-5% perda', co: 1000, cm: 2, mx: 10, tip: 'Diminui perdas nas esteiras.' }]
  },
  click: {
    n: '👆 Click', ups: [
      { id: 'ck1', n: 'Luvas', d: '+0.05', co: 10, cm: 1.5, mx: 30, tip: 'Mais boost/click.' },
      { id: 'ck2', n: 'Exo', d: '+0.1', co: 180, cm: 1.9, mx: 20, tip: 'Boost avançado.' },
      { id: 'ck4', n: 'Refrigeração', d: '-10% heat', co: 500, cm: 2.3, mx: 10, tip: 'Reduz aquecimento por click.' }]
  }
};

const PRESTIGE_TREE = [
  { id: 'ps', n: 'Velocidade', d: '+10%', co: 1, cm: 1.8, mx: 25, ly: 1 }, { id: 'pm', n: 'Capital', d: 'Cr iniciais', co: 1, cm: 2.5, mx: 15, ly: 1 },
  { id: 'pc', n: 'Click', d: '+15%', co: 2, cm: 2, mx: 20, ly: 2 }, { id: 'pv', n: 'Valor', d: '+8%', co: 1, cm: 2, mx: 25, ly: 2 }, { id: 'pq', n: 'Qualidade', d: '+2% todas', co: 2, cm: 2, mx: 20, ly: 2 },
  { id: 'pb', n: 'Boost Max', d: '+1x', co: 2, cm: 2.5, mx: 10, ly: 3 }, { id: 'pl', n: 'T2 Grátis', d: 'Linha 2', co: 3, cm: 3, mx: 5, ly: 3 }, { id: 'pk', n: 'Estoque', d: '+100', co: 3, cm: 2, mx: 15, ly: 3 },
  { id: 'pa', n: 'Progresso', d: '+10% era', co: 4, cm: 2, mx: 30, ly: 4 }, { id: 'pf', n: 'Auto-click', d: '+1', co: 5, cm: 3, mx: 10, ly: 4 }, { id: 'pd', n: 'Desconto', d: '-5%', co: 5, cm: 2.5, mx: 20, ly: 4 },
  { id: 'pp', n: 'Multi', d: '+3%', co: 6, cm: 3, mx: 50, ly: 5 }, { id: 'pi', n: 'Era 1', d: 'Oficina auto', co: 12, cm: 1, mx: 1, ly: 5 }, { id: 'px', n: '+50% ⭐', d: 'Mais estrelas', co: 10, cm: 3, mx: 10, ly: 5 },
  { id: 'pr', n: 'Ramo', d: 'Mantém ramo', co: 15, cm: 1, mx: 1, ly: 6 }, { id: 'pz', n: 'Singularidade', d: '+2% em TUDO', co: 20, cm: 1.5, mx: 9999, ly: 6 }
];

const MENTOR = { n: 'ATLAS', a: '🤖' };

const ACHS = [
  { id: 'first_prod', n: 'Primeira Engrenagem', d: 'Produza 1 item', c: () => G.tProd >= 1, txt: 'Registrando primeira produção. A jornada começa com um único componente.' },
  { id: 'first_sell', n: 'Capital Inicial', d: 'Ganhe 10 créditos', c: () => G.tMon >= 10, txt: '10 créditos gerados. Capital é o sangue de qualquer império.' },
  { id: 'line2', n: 'Expansão Horizontal', d: 'Desbloqueie linha 2', c: () => G.lines >= 2, txt: 'Linha 2 ativada. A complexidade aumenta. Gerencie seus insumos com sabedoria.' },
  { id: 'era1', n: 'Oficina Estabelecida', d: 'Alcance Oficina', c: () => G.era >= 1, txt: 'Classificação elevada: Oficina. Suas operações saíram do amadorismo.' },
  { id: 'click50', n: 'Aceleração Manual', d: '50 clicks', c: () => G.tClk >= 50, txt: 'Intervenção manual detectada. Cuidado com o Superaquecimento (Heat).' },
  { id: 'money1k', n: 'Primeiro Milhar', d: '💰 1K total', c: () => G.tMon >= 1e3, txt: 'Meta de 1K alcançada. Sugiro investir em automação de vendas.' },
  { id: 'prestige1', n: 'Colapso e Renascimento', d: 'Primeiro prestígio', c: () => G.pCnt >= 1, txt: 'Singularidade alcançada. O Núcleo absorveu o conhecimento. Evolua.' },
  { id: 'era3', n: 'Era Industrial', d: 'Alcance Indústria', c: () => G.era >= 3, txt: 'Classificação: Indústria. A poeira, o óleo, o lucro contínuo.' },
  { id: 'extractor_1k', n: 'Primeiro Extrato', d: 'Receba 1000 raw do Extrator', c: () => (G.rawFromExtractor || 0) >= 1000, txt: 'O Extrator Básico acumulou 1000 unidades entregues. Resultado de um sistema resiliente.' },
  { id: 'crash_survivor', n: 'Sobrevivente do Crash', d: 'Venda durante evento CRASH', c: () => G.crashSales >= 1, txt: 'Operação executada em zona de crise. Resiliência ou loucura — o lucro é o mesmo.' },
  { id: 'intergalactic', n: 'Herói da Galáxia', d: 'Alcance Era Intergaláctica', c: () => G.era >= 7, txt: 'Classificação: INTERGALÁCTICA. Poucos chegam aqui. O universo é seu campo de operações.' }
];

const DLGS = [
  { id: 'tut1', t: 'Saudações. Sua fábrica está ociosa. Acesse o <b>Mercado</b> e adquira <b>Matéria-prima</b> para iniciarmos.', tr: () => G.branch && G.raw === 0 && G.money > 0 },
  { id: 'tut2', t: 'Interessante. A produção começou. Note o botão de <b>Energia (⚡)</b>. Pressione-o para sobrecarregar a velocidade.', tr: () => G.tProd >= 10 && G.tClk === 0 },
  { id: 'tut3', t: 'Análise: Vender em massa derruba os preços temporariamente. Seja estratégico — o mercado tem memória.', tr: () => G.tMon >= 1500 },
  { id: 'tut4', t: 'Alerta: O <b>Prestígio</b> está disponível. Sacrificar a fábrica gerará energia estelar permanente. Renasça mais forte.', tr: () => G.tMon >= 8000 && G.pCnt === 0 },
  { id: 'rpg_start', t: '⛏️ Extrator Básico ativo. Matéria-prima sendo gerada automaticamente. O Império começa aqui, Administrador.', tr: () => G.branch && G.era === 0 && G.tProd === 0 },
  { id: 'rpg_era1', t: '🌟 Classificação atualizada: OFICINA. O mundo exterior começa a nos notar. Cada peça produzida é um passo rumo ao domínio.', tr: () => G.era >= 1 },
  { id: 'rpg_era2', t: '⚙️ Era da FÁBRICA. O rugido das máquinas ecoa através dos setores. Rivais registraram nossa expansão.', tr: () => G.era >= 2 },
  { id: 'rpg_era3', t: '🏗️ Classificação: INDÚSTRIA. Nossos processos agora definem padrões de mercado. A concorrência sente a pressão.', tr: () => G.era >= 3 },
  { id: 'rpg_era4', t: '🏛️ Status: CORPORAÇÃO. Representantes governamentais solicitaram reunião. Não aceitamos termos — ditamos os nossos.', tr: () => G.era >= 4 },
  { id: 'rpg_era5', t: '🌐 MULTINACIONAL confirmado. Operações em 14 planetas. O mapeamento de rotas de exportação está sendo reconfigurado.', tr: () => G.era >= 5 },
  { id: 'rpg_era6', t: '🚀 LIMITES PLANETÁRIOS EXCEDIDOS. Nossa presença distorce rotas de comércio galáctico. O próximo passo é inevitável.', tr: () => G.era >= 6 },
  { id: 'rpg_era7', t: '✨ CLASSIFICAÇÃO MÁXIMA: INTERGALÁCTICA. Registros históricos serão reescritos. O universo observa cada decisão sua.', tr: () => G.era >= 7 },
  { id: 'rpg_crash', t: '⚠️ CRASH detectado. Deflaçao ativa. O ciclo sempre inverte — retenha seus melhores itens e aguarde o próximo pico.', tr: () => G.evtActive === 'crash' && G.era >= 1 },
  { id: 'rpg_prestige2', t: '🔮 Segundo Prestígio registrado. Cada ciclo de renascimento deposita conhecimento residual no núcleo. Você evolui.', tr: () => G.pCnt >= 2 },
  { id: 'rpg_dm10', t: '🟣 Matéria Escura acumulada: 10 unidades. Esses fragmentos têm propriedades que a ciência ainda não compreende completamente.', tr: () => (G.dm || 0) >= 10 }
];

const ATLAS_AMBIENT = {
  era0: [
    'Monitorando: produção em estágio inicial. Cada componente fabricado sedimenta a fundação do futuro Império.',
    'O mercado não considera pequenos produtores uma ameaça. Por enquanto. Continue, Administrador.',
    'Registrando histórico de produção. A trajetória atual indica ascensão consistente. Não interrompa o fluxo.',
    'Esta garagem foi onde "Seu Zé" construiu o primeiro protótipo. Honre o legado — ou o supere.'
  ],
  era1: [
    'Análise de mercado: concorrentes observam nossa eficiência. Recomendam manter a velocidade de expansão.',
    'Classificação Oficina ativa. A transição para Fábrica requer foco em volume. Priorize upgrades de velocidade.',
    'As paredes desta Oficina absorveram décadas de trabalho. Agora são nossa base. Expanda além delas.'
  ],
  era2: [
    'Relatório trimestral: nossa produção supera 3 concorrentes regionais. A consolidação é questão de tempo.',
    'Fábrica em plena operação. O zumbido das máquinas é o som de riqueza sendo gerada. Escute o ritmo.',
    'Alertas de rivalidade crescentes. Nossa expansão foi notada. Mantenha a posição — ou acelere antes que reajam.'
  ],
  era3: [
    'Análise industrial: atingimos produção que sustentaria uma cidade de 40.000 habitantes por ano.',
    'Resistência corporativa detectada — lobby nos parlamentos planetários. Esperado. Continue produzindo.',
    'O mercado começa a precificar nossa presença como fator dominante. Isso tem consequências que monitorarei de perto.'
  ],
  era4: [
    'Classificação Corporação implica responsabilidade sobre cadeias de suprimento de 8 sistemas estelares.',
    'Detectei tentativas de espionagem industrial. Fontes desconhecidas. Operações protegidas — por enquanto.',
    'Nossa influência agora afeta decisões políticas em 3 planetas. O poder econômico é o poder real, Administrador.'
  ],
  era5: [
    'Multinacional implica presença distribuída. Nossa queda seria sentida em cascata por economias inteiras.',
    'Registrando: 14 escritórios em planetas distintos. 400.000 empregados indiretos. O Império tem substância.',
    'A Federação Galáctica nos enviou um representante. Ainda não respondemos. A espera é estética do poder.'
  ],
  era6: [
    'Além da atmosfera: operações em 23 sistemas estelares confirmadas. Nosso alcance é literalmente cósmico.',
    'A física do comércio interestelar é diferente. Velocidade de luz limita logística. Nossos algoritmos compensam.',
    'Civilizações tipo-II tomaram nota da nossa produção. Um sinal foi recebido — ainda decodificando.'
  ],
  era7: [
    'Singularidade corporativa: quando uma entidade produtiva atinge escala suficiente, muda a natureza do universo.',
    'Registrando: nossa presença agora aparece em modelos cosmológicos de longa escala. Isso não era previsto.',
    'O universo é vasto. Nossa fábrica, ainda assim, deixou sua marca na estrutura-padrão do comércio galáctico.'
  ],
  money_high: [
    'Créditos em excesso detectados. Reinvista em upgrades — capital estagnado é capital morto.',
    'Análise: seu patrimônio atual sustentaria 3 nações-estados por um século. Mas queremos mais.',
    'A riqueza acumulada é impressionante. Lembre que o Prestígio multiplica sua trajetória permanentemente.'
  ],
  boom_active: [
    'Evento BOOM ativo. Preços elevados. Este é o momento de vender os itens de maior valor em estoque.',
    'Mercado em euforia. Janelas de oportunidade como esta duram minutos. Aproveite agora.',
    'BOOM confirmado. Nossa reputação de fornecedor premium garante contratos prioritários neste pico.'
  ],
  fuel_low: [
    'ALERTA: Combustível abaixo de 20%. Produção em risco de desaceleração severa. Reabasteça logo.',
    'Tanques críticos. Se os motores desacelerarem, perdemos contratos e tempo. Priorize o reabastecimento.',
    'Diagnóstico: escassez de combustível iminente. Uma fábrica sem energia é apenas uma escultura cara.'
  ],
  generic: [
    'O ATLAS processa 4 trilhões de variáveis por segundo para manter sua fábrica em otimização máxima.',
    'Monitoramento contínuo ativo. Cada decisão sua é registrada e analisada para refinamento futuro.',
    'Pausa para calibração de sensores. Operações continuam nominais. Apenas relatando presença, Administrador.',
    'Os rivais acreditam que somos frutos da sorte. Os dados dizem diferente. Continue construindo o legado.',
    'Calculando trajetória de longo prazo: mantendo o ritmo atual, a singularidade tecnológica está ao alcance.',
    'Um pensamento: impérios não são construídos em dias. São construídos em ciclos. Cada click importa.'
  ]
};

function fireAtlasAmbient() {
  if (!G.branch || !G.era !== undefined) {
    if (!G.branch) return;
  }

  let pool = [];

  if (G.fuel <= (1000 + 500 * (G.ups?.gfuel || 0)) * 0.2) {
    pool = ATLAS_AMBIENT.fuel_low;
  } else if (G.evtActive === 'boom') {
    pool = ATLAS_AMBIENT.boom_active;
  } else if (G.money > 50000 && G.era < 3) {
    pool = ATLAS_AMBIENT.money_high;
  } else {
    const eraKey = `era${Math.min(G.era, 7)}`;
    pool = ATLAS_AMBIENT[eraKey] || ATLAS_AMBIENT.generic;
    if (Math.random() < 0.2) pool = [...pool, ...ATLAS_AMBIENT.generic];
  }

  if (!pool.length) return;
  const msg = pool[Math.floor(Math.random() * pool.length)];

  showTypewriterDlg(MENTOR, T(msg), false);
}