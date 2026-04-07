# Implementações Feitas (Histórico)

Este arquivo visa registrar as etapas já atingidas com sucesso para acompanhamento das correções e adições mecânicas ao projeto.

## Versão Atual

### Otimizações Correntes
- **Modularização:** Separação contínua da arquitetura core (Ex: UI, State, Scene e sub-módulos independentes).
- **Ajustes de Motor (Engine):** Fixado o `rebuildFactory` da engine do Phaser 3 para restaurar os itens progressando nas esteiras e o tempo contínuo de construção das máquinas, impedindo que materiais sumissem ao se atualizar a tela.

### Adições e Funcionalidades Feitas (Última Etapa)
- **Expansão de Minigames:** O `minigame.js` agora possui uma roleta que seleciona aleatoriamente entre 3 modos:
  1. *Anomalia (Whack-a-mole)*
  2. *Sequenciamento Multíplo (Senha do 1 ao 8)*
  3. *Sobrecarga de Pressão (Spam Click Frenético)*
- **Controle Fino de Auto-Venda:** Agora, quando a habilidade de Venda Automática global é desbloqueada, cada recurso na aba de inventário ganha uma caixinha de marcação "Auto-venda". É finalmente possível desligar a venda automática de itens cruciais para craft sem precisar usar apenas o range numérico.
- **Painel de Debug Integrado:** Construído um mini-hud no canto invisível para preenchimento ágil.
- **HUD (Aba do Submundo):** Estilização de colunas convertida para flex.
