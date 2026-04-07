// ===== NEWS TICKER — LETREIRO DE NOTÍCIAS DO UNIVERSO =====
// Apenas notícias que causam consequência real de mercado.
// Os textos reportam apenas o fato — sem explicar a consequência.

const TICKER_INTERVAL_MIN = 200;  // segundos mínimos (~3.3 min)
const TICKER_INTERVAL_MAX = 400;  // segundos máximos (~6.7 min)

const TICKER_NEWS = [
  // === AUTOMOTIVO ===
  {
    branch: 'automotive', tier: 0, type: 'crash',
    txt: '📡 GigaForja Parafuso-Omega inaugurada no Setor Delta-9. Capacidade produtiva: 40 milhões de unidades/dia.'
  },
  {
    branch: 'automotive', tier: 0, type: 'boom',
    txt: '📡 Operações de mineração em Kepler-62f suspensas. Extratoras de Ferro Bruto offline por tempo indeterminado.'
  },
  {
    branch: 'automotive', tier: 1, type: 'crash',
    txt: '📡 Robôs-KRONOS Gen.5 ativados em 12 plantas industriais. Linha automatizada de Engrenagens em operação contínua.'
  },
  {
    branch: 'automotive', tier: 1, type: 'boom',
    txt: '📡 Tempestade magnética classe-X registrada em Tau Ceti. Sistemas de fundição: offline. Estimativa de reparo: 3 semanas.'
  },
  {
    branch: 'automotive', tier: 2, type: 'boom',
    txt: '📡 Guerra Civil em Marte-3. Fábricas do Setor Sul incendiadas após confronto com forças separatistas.'
  },
  {
    branch: 'automotive', tier: 3, type: 'crash',
    txt: '📡 MegaDrive Industries e HyperMotors anunciam fusão. Nova entidade: OmegaDrive Corp. Aprovação regulatória concedida.'
  },
  {
    branch: 'automotive', tier: 4, type: 'boom',
    txt: '📡 Imperador Kalveth XVIII assina decreto de mobilização. 10.000 Chassis requisitados para a Campanha de Andrômeda.'
  },
  {
    branch: 'automotive', tier: 5, type: 'boom',
    txt: '📡 Colônia de Próxima Centauri declara emergência territorial. Solicitação de frota de Veículos protocolada.'
  },
  {
    branch: 'automotive', tier: 6, type: 'crash',
    txt: '📡 Tratado de Paz de Elysium ratificado. Cláusula 7-B cancela contrato de 500 Naves Orbitais com efeito imediato.'
  },
  {
    branch: 'automotive', tier: 7, type: 'boom',
    txt: '📡 Sinal de Classe Omega recebido. Civilização Tipo-IV identificada. Solicitação de Capital de Naves em análise.'
  },

  // === ARMAMENTO ===
  {
    branch: 'weapons', tier: 0, type: 'boom',
    txt: '📡 Insurreição no Setor-9 confirmada. Conflito armado registrado em três sistemas estelares.'
  },
  {
    branch: 'weapons', tier: 0, type: 'crash',
    txt: '📡 Cessar-fogo assinado em Nova Praga. Forças de pacificação da Federação assumem controle da região.'
  },
  {
    branch: 'weapons', tier: 2, type: 'boom',
    txt: '📡 Cartografia do Cinturão Exterior revisada. Frotas corsárias detectadas em 8 rotas comerciais ativas.'
  },
  {
    branch: 'weapons', tier: 3, type: 'crash',
    txt: '📡 Federação Galáctica aprova Resolução 441-C. Embargo de exportação de Armamentos ao Setor Sul: vigência imediata.'
  },
  {
    branch: 'weapons', tier: 5, type: 'boom',
    txt: '📡 Entidade de Classe-X detectada pelo Observatório de Vega-7. Protocolos de defesa planetária ativados.'
  },
  {
    branch: 'weapons', tier: 6, type: 'crash',
    txt: '📡 Comissão de Defesa aprova escudos de fase Sigma-9. Implantação em toda a frota prevista para os próximos 60 dias.'
  },
  {
    branch: 'weapons', tier: 7, type: 'boom',
    txt: '📡 Triangulação confirma frota hostil não identificada a dois parsecs. Conselho de Guerra convocado em sessão emergencial.'
  },

  // === ALIMENTOS ===
  {
    branch: 'food', tier: 0, type: 'crash',
    txt: '📡 Relatório agrícola de Kepler-22b: colheita 400% acima da meta. Silos de armazenamento esgotados em 14 sistemas.'
  },
  {
    branch: 'food', tier: 0, type: 'boom',
    txt: '📡 Fungo mutante Strain-Ω confirmado em 12 sistemas solares. Quarentena agrícola galáctica decretada.'
  },
  {
    branch: 'food', tier: 2, type: 'boom',
    txt: '📡 ACNUR Galáctica registra 40 milhões de deslocados após colapso de Marte-6. Campos de assistência montados.'
  },
  {
    branch: 'food', tier: 3, type: 'crash',
    txt: '📡 Sintetizador Universal de Alimentos aprovado pela Federação. Distribuição pública iniciada em 40 sistemas.'
  },
  {
    branch: 'food', tier: 5, type: 'boom',
    txt: '📡 Sede das Olimpíadas Galácticas confirmada: planeta Aure-IV. Abertura em 3 meses. Público esperado: 4 bilhões.'
  },
  {
    branch: 'food', tier: 7, type: 'boom',
    txt: '📡 Povo de Aether-Prime anuncia início do Ciclo Milenar. Cerimônia prevista para a próxima lua de convergência.'
  },

  // === TECNOLOGIA ===
  {
    branch: 'tech', tier: 0, type: 'crash',
    txt: '📡 CorpTech ativa fábrica quântica automatizada no cinturão de asteroides de Tau-7. Linha de produção: operação contínua.'
  },
  {
    branch: 'tech', tier: 0, type: 'boom',
    txt: '📡 Erupção solar magnitude 9.4 atinge três sistemas. Infraestrutura de mineração de Silício: offline em todos os setores.'
  },
  {
    branch: 'tech', tier: 2, type: 'crash',
    txt: '📡 Coletivo Hacker "Opção Zero" vaza blueprints completos de Placa-Mãe em repositórios públicos.'
  },
  {
    branch: 'tech', tier: 3, type: 'boom',
    txt: '📡 Decreto Imperial 7741: atualização de Módulos de computação obrigatória em toda a frota militar. Prazo: 30 dias.'
  },
  {
    branch: 'tech', tier: 5, type: 'boom',
    txt: '📡 Rede Theta: Núcleos IA atingiram limiar de singularidade local. Autoexpansão de capacidade em andamento.'
  },
  {
    branch: 'tech', tier: 7, type: 'boom',
    txt: '📡 Instituto ATLAS publica relatório confidencial: limiar de Singularidade Tecnológica calculado para os próximos 90 dias.'
  },

  // === GENÉRICOS ===
  {
    branch: 'all', tier: null, type: 'boom',
    txt: '📡 Cúpula das 40 Civilizações encerrada. Tratado de Livre Comércio Intergaláctico ratificado. Vigência imediata.'
  },
  {
    branch: 'all', tier: null, type: 'crash',
    txt: '📡 Bolsa de Nova-Terra declara moratória. Seis grandes fundos de investimento galácticos em default simultâneo.'
  },
  {
    branch: 'all', tier: -1, type: 'boom',
    txt: '📡 Comissão Galáctica de Recursos publica relatório anual. Déficit de matérias-primas confirmado em todos os setores.'
  },
  {
    branch: 'all', tier: -1, type: 'crash',
    txt: '📡 Extratores autônomos Nível-9 entram em operação simultânea em 200 planetas. Capacidade total: não quantificada.'
  }
];

// Timer interno
let _tickerTimer = 0;
let _tickerNext = 60; // primeira notícia aos 60s
let _pendingTickerEvent = null;
let _lastTickerNews = null;

/**
 * Chamado a cada frame pelo factoryScene.update() com dt em segundos.
 */
function tickNewsTicker(dt) {
  if (!G.branch) return;

  _tickerTimer += dt;

  if (_pendingTickerEvent) {
    _pendingTickerEvent.fireIn -= dt;
    if (_pendingTickerEvent.fireIn <= 0) {
      _applyTickerMarketEvent(_pendingTickerEvent);
      _pendingTickerEvent = null;
    }
  }

  if (_tickerTimer >= _tickerNext) {
    _tickerTimer = 0;
    _tickerNext = TICKER_INTERVAL_MIN + Math.random() * (TICKER_INTERVAL_MAX - TICKER_INTERVAL_MIN);
    _fireNextTicker();
  }
}

function _fireNextTicker() {
  const candidates = TICKER_NEWS.filter(n => {
    if (n.branch !== 'all' && n.branch !== G.branch) return false;
    if (n.tier !== null && n.tier >= 0 && n.tier >= G.lines) return false;
    return true;
  });

  if (!candidates.length) return;

  let news;
  if (candidates.length > 1) {
    const filtered = candidates.filter(n => n !== _lastTickerNews);
    news = filtered[Math.floor(Math.random() * filtered.length)];
  } else {
    news = candidates[0];
  }
  _lastTickerNews = news;

  _showTickerMessage(news.txt);

  // Agenda o evento real de mercado (2–5 min de delay)
  if (G.mktPrices.length > 0) {
    const fireIn = 120 + Math.random() * 180;
    _pendingTickerEvent = {
      type: news.type,
      tier: news.tier,
      fireIn
    };
  }
}

function _applyTickerMarketEvent(evt) {
  if (!G.mktPrices || G.mktPrices.length === 0) return;

  const multiplier = evt.type === 'boom'
    ? (1.5 + Math.random() * 0.8)
    : (0.35 + Math.random() * 0.25);

  if (evt.tier === null) {
    G.mktPrices.forEach(p => {
      p.trend = evt.type === 'boom' ? 0.3 : -0.3;
      p.cur = Math.max(p.base * 0.15, Math.min(p.base * 10, p.cur * multiplier));
    });
    G.evtActive = evt.type === 'boom' ? 'boom' : 'crash';
    setTimeout(() => { if (G.evtActive) G.evtActive = null; }, 120000);

    const confirmBoom = [
      'Evento confirmado: Boom de consumo ativo. Grande oportunidade de venda.',
      'Mercado em euforia. Preços acima da média. Venda agora, Administrador.',
      'Tratado de livre comércio ativado. Todos os preços sobem. Aproveite.'
    ];
    const confirmCrash = [
      'Crise confirmada. Deflação ativa. Aguarde ou arrisque vender rápido.',
      'Mercados em colapso. Produtos perderam valor. Retenha seus melhores itens.',
      'Deflação em curso. Preços despencando. Acumule estoque para o próximo ciclo.'
    ];
    const msgs = evt.type === 'boom' ? confirmBoom : confirmCrash;
    setTimeout(() => showTypewriterDlg(MENTOR, msgs[Math.floor(Math.random() * msgs.length)], true), 500);

  } else if (evt.tier === -1) {
    if (G.mktPrices[0]) {
      G.mktPrices[0].trend = evt.type === 'boom' ? 0.25 : -0.25;
      G.mktPrices[0].cur = Math.max(G.mktPrices[0].base * 0.15, Math.min(G.mktPrices[0].base * 8, G.mktPrices[0].cur * multiplier));
    }
  } else {
    const pi = evt.tier + 1;
    if (G.mktPrices[pi]) {
      G.mktPrices[pi].trend = evt.type === 'boom' ? 0.35 : -0.35;
      G.mktPrices[pi].cur = Math.max(G.mktPrices[pi].base * 0.15, Math.min(G.mktPrices[pi].base * 10, G.mktPrices[pi].cur * multiplier));
    }
  }
}

function _showTickerMessage(text) {
  const ticker = document.getElementById('news-ticker-content');
  if (!ticker) return;

  const msg = document.createElement('span');
  msg.className = 'ticker-msg';
  msg.textContent = text + '   ·   ';

  ticker.innerHTML = '';
  ticker.appendChild(msg);

  // 0.15s por caractere — velocidade ainda mais lenta e confortável
  const duration = Math.max(35, text.length * 0.60);
  msg.style.animationDuration = duration + 's';
}
