# Planos de Implementação (Roadmap)

Aqui registramos as metodologias e guias de implantação para futuras funcionalidades e integrações dentro do Factory Empire.

## 1. Novos Minigames para Eventos Esporádicos
Vamos criar uma estruturação modular no `minigame.js` para sortear aleatoriamente 1 entre 3 minigames de "conserto":
1. **Anomalias (Atual):** Clicar em 12 nós esporádicos.
2. **Sequenciamento de Núcleo:** Aparecem botões numerados do 1 ao 8 misturados na tela. É preciso clicar em ordem crescente para religar o núcleo.
3. **Estabilização de Pressão:** Um botão central gigante e uma barra térmica que rapidamente se enche. Pressionar (spam-click) um botão 35 vezes evita a explosão iminente.

## 2. Toggle de Auto-Venda Individual
Fornecer um botão na aba Inventário/Produção para desativar a auto-venda ("Hold") mesmo se a habilidade `w_ven` for destravada.
- **Implementação:** Estado via `G.asStatus[ ]`, que será checado em `main.js` e renderizado em `ui.js` próximo do input numérico de limite.
