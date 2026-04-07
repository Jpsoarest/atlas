function debugAddMoney() {
  const m = G.money === 0 ? 1000 : G.money * 5 + 10000;
  G.money += m;
  if(typeof sndBuy === 'function') sndBuy();
  if(typeof updateHUD === 'function') updateHUD();
}

function debugAddStars() {
  G.pStars += 50;
  if(typeof sndBuy === 'function') sndBuy();
  if(typeof showPrestigeTree === 'function' && document.getElementById('tree-modal').classList.contains('show')) showPrestigeTree();
  if(typeof updateHUD === 'function') updateHUD();
}

function debugAddDarkMatter() {
  G.dm += 5;
  if(typeof sndBuy === 'function') sndBuy();
  if(typeof renderBlackMarket === 'function' && document.getElementById('p-bm').classList.contains('act')) renderBlackMarket();
  if(typeof showPrestigeTree === 'function' && document.getElementById('tree-modal').classList.contains('show')) showPrestigeTree();
  if(typeof updateHUD === 'function') updateHUD();
}

/** Reinicia o jogo do zero, apagando o save. */
function debugResetGame() {
  if (!confirm('RESET TOTAL? Isso apaga TODO o progresso permanentemente (Prestígio, Gênesis, tudo). Tem certeza?')) return;
  // Bloqueia qualquer saveGame() que possa ser disparado pelo visibilitychange
  // durante o process de reload (o browser dispara o evento ao navegar)
  window._factoryResetPending = true;
  localStorage.removeItem('factory-empire-save');
  window.location.reload();
}
