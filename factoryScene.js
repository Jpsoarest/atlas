const MAX_P = 250;

class Factory extends Phaser.Scene {
  constructor() { super({ key: 'Factory' }); }

  preload() {
    this.load.audio('bgm_industrial', 'assets/Industrial Theme Music/industrial.mp3');

    this.load.image('iron', 'assets/img/iron/iron.png');
    this.load.image('coal', 'assets/img/coal/coal.png');
    this.load.image('mach_idle', 'assets/img/machine/machineidle.png');

    this.load.spritesheet('mach_trans', 'assets/img/machine/machineoffon.png', {
      frameWidth: 64,
      frameHeight: 64
    });

    // CARREGAMENTO DO SPRITE DO DISPENSER
    this.load.spritesheet('dispenser', 'assets/img/dispenser/dispenser.png', {
      frameWidth: 64, // LARGURA DE UM ÚNICO QUADRO
      frameHeight: 64 // ALTURA DE UM ÚNICO QUADRO
    });

    // =======================================================================================
    // INSTRUÇÃO PARA BACKGROUND FUTURO:
    // Para reativar o cenário Parallax, remova as duas barras (//) do início das 4 linhas abaixo.
    // Lembre-se de verificar se os arquivos estão exatamente nesta pasta.
    // =======================================================================================
    // this.load.image('bg4', 'assets/Layers/bg.png');
    // this.load.image('bg3', 'assets/Layers/far-buildings.png'); 
    // this.load.image('bg2', 'assets/Layers/buildings.png');
    // this.load.image('bg1', 'assets/Layers/skill-foreground.png');
  }

  create() {
    scene = this;

    try {
      if (this.sound) {
        if (!this.sound.get('bgm_industrial')) {
          this.bgMusic = this.sound.add('bgm_industrial', { loop: true });
        } else {
          this.bgMusic = this.sound.get('bgm_industrial');
        }
        this.updateMusicState();

        this.input.once('pointerdown', () => {
          this.updateMusicState();
        });
      }
    } catch (e) {
      console.warn("Falha silenciosa ao carregar áudio. O jogo prosseguirá normalmente.");
    }

    const W = this.scale.width;
    const H = this.scale.height;

    this.cameras.main.setBackgroundColor('#0b0e18');

    this.anims.create({
      key: 'mach_off',
      frames: this.anims.generateFrameNumbers('mach_trans', { start: 0, end: 5 }),
      frameRate: 10,
      repeat: 0
    });
    this.anims.create({
      key: 'mach_on',
      frames: this.anims.generateFrameNumbers('mach_trans', { start: 5, end: 0 }),
      frameRate: 10,
      repeat: 0
    });

    // ANIMAÇÃO CÍCLICA DO DISPENSER - LINEAR E SEM ESPELHAMENTO
    this.anims.create({
      key: 'dispenser_loop',
      frames: this.anims.generateFrameNumbers('dispenser', { start: 0, end: 5 }), // Ajuste o 'end' para Total de Quadros - 1
      frameRate: 12,
      repeat: -1, // Loop infinito
      yoyo: false // Garante que a animação não vai tocar de trás para frente ao chegar no final
    });

    // =======================================================================================
    // INSTRUÇÃO PARA BACKGROUND FUTURO (Parte 2):
    // Descomente o bloco abaixo para o Phaser desenhar as camadas na tela
    // =======================================================================================
    /*
    this.bgLayer4 = this.add.tileSprite(W/2, H/2, W, H, 'bg4').setScrollFactor(0);
    this.bgLayer3 = this.add.tileSprite(W/2, H/2, W, H, 'bg3').setScrollFactor(0);
    this.bgLayer2 = this.add.tileSprite(W/2, H/2, W, H, 'bg2').setScrollFactor(0);
    this.bgLayer1 = this.add.tileSprite(W/2, H/2, W, H, 'bg1').setScrollFactor(0);
    const scaleY = H / 1080;
    [this.bgLayer4, this.bgLayer3, this.bgLayer2, this.bgLayer1].forEach(bg => {
        bg.setTileScale(Math.max(1, scaleY));
        bg.setAlpha(0.6); 
    });
    */

    this.lineObjs = [];
    this.allP = [];
    this.spT = [];
    this.autoT = 0;
    this.uiT = 0;
    this.uiT2 = 0;
    this.saveT = 0;

    this.gF = this.add.group();
    this.gL = this.add.group();
    this.gP = this.add.group();
    this.gX = this.add.group();

    this.buildFactory();
    this.scale.on('resize', () => this.rebuildFactory());
  }

  updateMusicState() {
    if (!this.bgMusic) return;
    try {
      const vol = G.musicVol !== undefined ? G.musicVol : 0.3;
      this.bgMusic.setVolume(vol);

      if (G.musicOn) {
        if (!this.bgMusic.isPlaying) this.bgMusic.play();
      } else {
        if (this.bgMusic.isPlaying) this.bgMusic.pause();
      }
    } catch (e) { }
  }

  rebuildFactory() {
    const oldP = this.allP ? this.allP.map(p => ({ line: p.line, pg: p.pg })) : [];
    const oldSpT = this.spT ? [...this.spT] : [];

    // =======================================================================================
    // INSTRUÇÃO PARA BACKGROUND FUTURO (Parte 3):
    // Descomente as linhas abaixo para atualizar o tamanho do fundo caso redimensione a janela
    // =======================================================================================
    /*
    const W = this.scale.width;
    const H = this.scale.height;
    [this.bgLayer4, this.bgLayer3, this.bgLayer2, this.bgLayer1].forEach(bg => {
        if(bg) bg.setSize(W, H).setPosition(W/2, H/2);
    });
    */

    this.tweens.killAll();
    [this.gF, this.gL, this.gP, this.gX].forEach(g => g.clear(true, true));

    this.lineObjs = [];
    this.allP = [];
    this.spT = [];

    this.buildFactory();

    oldP.forEach(op => {
      const lo = this.lineObjs[op.line];
      if (lo) {
        const prod = this.drawItem(0, 0, op.line);
        if (prod) {
          let acc = 0;
          for (let j = 0; j < lo.path.length - 1; j++) {
            const sl = Phaser.Math.Distance.Between(lo.path[j].x, lo.path[j].y, lo.path[j + 1].x, lo.path[j + 1].y);
            if (acc + sl > op.pg) {
              const t = (op.pg - acc) / sl;
              prod.x = Phaser.Math.Linear(lo.path[j].x, lo.path[j + 1].x, t);
              prod.y = Phaser.Math.Linear(lo.path[j].y, lo.path[j + 1].y, t);
              break;
            }
            acc += sl;
          }
          this.allP.push({ ct: prod, line: op.line, pg: op.pg });
        }
      }
    });

    for (let i = 0; i < oldSpT.length; i++) {
      if (i < this.spT.length) this.spT[i] = oldSpT[i];
    }
  }

  updateMachines(li) {
    const lo = this.lineObjs[li];
    if (!lo) return;
    lo.machines.forEach(m => {
      if (m.sprite) m.sprite.destroy();
      if (m.belt) m.belt.destroy();
    });
    lo.machines = [];
    const W = this.scale.width, ts = 24, padL = ts * 3.5, padR = ts * 3.5, beltLen = W - padL - padR;
    const bClr = G.branch ? BRANCHES[G.branch].cl : 0x446688;
    const mc = getMC(li);
    const mSp = beltLen / (mc + 1);
    const cy = lo.cy;

    for (let mi = 0; mi < mc; mi++) {
      const mx = padL + mSp * (mi + 1);
      const my = cy - ts * 1.0;

      const belt = this.add.rectangle(mx, cy - ts * .32, 3, ts * .75, bClr, .2);
      this.gL.add(belt);

      const machSprite = this.add.sprite(mx, my, 'mach_idle');
      this.gL.add(machSprite);

      lo.machines.push({ sprite: machSprite, belt: belt, isOn: true, offTimer: 0 });
    }
  }

  pathLen(path) {
    let t = 0;
    for (let j = 0; j < path.length - 1; j++)
      t += Phaser.Math.Distance.Between(path[j].x, path[j].y, path[j + 1].x, path[j + 1].y);
    return t;
  }

  buildFactory() {
    const W = this.scale.width, H = this.scale.height, ts = 24;
    const era = ERAS[G.era], items = getItems(), nL = G.lines;

    const gridSize = 48;
    const cols = Math.ceil(W / gridSize) + 1;
    const rows = Math.ceil(H / gridSize) + 1;

    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        let cell = this.add.rectangle(x * gridSize + gridSize / 2, y * gridSize + gridSize / 2, gridSize - 1, gridSize - 1, 0x161a28, 0.2);
        cell.setStrokeStyle(1, 0x2fffb0, 0.05);
        this.gF.add(cell);
      }
    }

    if (G.era >= 6) {
      for (let i = 0; i < 40; i++) {
        const s = this.add.circle(
          Phaser.Math.Between(0, W), Phaser.Math.Between(0, H),
          Phaser.Math.Between(1, 3), 0xffffff, Phaser.Math.FloatBetween(.05, .2)
        );
        this.gF.add(s);
        this.tweens.add({
          targets: s, alpha: { from: s.alpha, to: s.alpha * .1 },
          duration: Phaser.Math.Between(800, 2500), yoyo: true, repeat: -1
        });
      }
    }

    if (!nL || !items.length) return;

    const usableH = H - ts * 3.5;
    const lineH = Math.min(65, usableH / (nL + .2));
    const startY = ts * 1.8;
    const padL = ts * 3.5, padR = ts * 3.5, beltLen = W - padL - padR;

    for (let li = 0; li < nL; li++) {
      const cy = startY + lineH * li + lineH * .5;
      const path = [];

      for (let x = padL; x <= padL + beltLen; x += ts) {
        path.push({ x: x + ts / 2, y: cy });
        this.gL.add(this.add.rectangle(x + ts / 2, cy, ts - 1, ts * .55, 0x1e2838).setStrokeStyle(1, 0x2a3e50, .4));
        this.gL.add(this.add.rectangle(x + ts / 2, cy - ts * .22, ts - 1, 3, 0x3a5a6a, .3));
        this.gL.add(this.add.rectangle(x + ts / 2, cy + ts * .22, ts - 1, 3, 0x3a5a6a, .3));
        if (((x - padL) / ts) % 2 === 0)
          this.gL.add(this.add.rectangle(x + ts / 2, cy, 3, ts * .45, 0x3a5868, .25));
      }

      for (let x = padL + ts * 2; x < padL + beltLen - ts; x += ts * 4) {
        this.gL.add(this.add.text(x, cy, '▸', { fontSize: '10px', color: '#2a4a5a', fontStyle: 'bold' }).setOrigin(.5).setAlpha(.4));
      }

      // INÍCIO DA ESTEIRA (O DISPENSER ANIMADO)
      const hx = padL - ts * .8;

      // Cria o sprite animado puro (sem rotações ou distorções) e garante que ele toque a animação linear.
      const dispenserSprite = this.add.sprite(hx, cy, 'dispenser').play('dispenser_loop');

      this.gL.add(dispenserSprite);

      this.gL.add(this.add.text(hx, cy - ts * 1.1, `L${li + 1}`, { fontFamily: 'Orbitron', fontSize: '9px', color: '#8aacc0', fontStyle: 'bold' }).setOrigin(.5));

      // FIM DA ESTEIRA (A CAIXA FINAL)
      const ox = padL + beltLen + ts * .8;
      this.gL.add(this.add.rectangle(ox, cy, ts * 1.3, ts * 1.6, 0x282418).setStrokeStyle(1, 0xffb850, .25));
      this.gL.add(this.add.text(ox, cy, '📦', { fontSize: '12px' }).setOrigin(.5));

      const statDot = this.add.circle(ox + ts * 1.2, cy, 4, 0x2fffb0, .5);
      this.gL.add(statDot);

      this.lineObjs.push({ path, machines: [], cy, statDot, tier: li, hasFixEvt: false });
      this.spT.push(0);
      this.updateMachines(li);
    }
  }

  drawItem(x, y, tier) {
    const items = BRANCHES[G.branch]?.items;
    if (!items || !items[tier]) return null;
    const it = items[tier];
    const clr = Phaser.Display.Color.HexStringToColor(it.clr).color;
    const sz = it.sz * 1.1;
    const ct = this.add.container(x, y);

    if (tier >= 4) ct.add(this.add.circle(0, 0, sz * .8, clr, .12));
    if (tier >= 6) ct.add(this.add.circle(0, 0, sz * 1.2, clr, .08));

    switch (it.icon) {
      case 'hex':
        for (let a = 0; a < 6; a++) {
          const ang = a * Math.PI / 3;
          ct.add(this.add.rectangle(Math.cos(ang) * sz * .35, Math.sin(ang) * sz * .35, sz * .2, sz * .2, clr, .8).setAngle(a * 60));
        }
        ct.add(this.add.circle(0, 0, sz * .18, clr, 1));
        ct.add(this.add.circle(0, 0, sz * .06, 0x0a0e18, .6));
        break;
      case 'blade':
        ct.add(this.add.triangle(0, 0, 0, -sz * .45, sz * .28, sz * .3, -sz * .28, sz * .3, clr, 1));
        ct.add(this.add.rectangle(0, sz * .18, sz * .12, sz * .2, 0x888898, .5));
        break;
      case 'ingr':
        ct.add(this.add.circle(0, 0, sz * .38, clr, 1));
        ct.add(this.add.circle(0, 0, sz * .12, 0xffffff, .2));
        break;
      case 'trans':
        ct.add(this.add.triangle(0, -sz * .08, 0, -sz * .38, sz * .28, sz * .12, -sz * .28, sz * .12, clr, .9));
        ct.add(this.add.rectangle(-sz * .12, sz * .2, 2, sz * .18, clr, .6));
        ct.add(this.add.rectangle(0, sz * .2, 2, sz * .18, clr, .6));
        ct.add(this.add.rectangle(sz * .12, sz * .2, 2, sz * .18, clr, .6));
        break;
      case 'gear':
        ct.add(this.add.circle(0, 0, sz * .38, clr, 1));
        ct.add(this.add.circle(0, 0, sz * .14, 0x0a0e18, .5));
        for (let a = 0; a < 8; a++) {
          const ang = a * Math.PI / 4;
          ct.add(this.add.rectangle(Math.cos(ang) * sz * .36, Math.sin(ang) * sz * .36, sz * .16, sz * .1, clr, .8).setAngle(a * 45));
        }
        break;
      case 'tool':
        ct.add(this.add.rectangle(0, 0, sz * .12, sz * .7, clr, .9));
        ct.add(this.add.circle(0, -sz * .3, sz * .17, clr, .85));
        ct.add(this.add.circle(0, -sz * .3, sz * .06, 0x0a0e18, .5));
        break;
      case 'dough':
        ct.add(this.add.ellipse(0, 0, sz * .85, sz * .55, clr, .9));
        break;
      case 'chip':
        ct.add(this.add.rectangle(0, 0, sz * .65, sz * .45, clr, .9));
        for (let p = 0; p < 4; p++) {
          ct.add(this.add.rectangle(-sz * .22 + p * sz * .15, sz * .28, 2, sz * .1, clr, .6));
          ct.add(this.add.rectangle(-sz * .22 + p * sz * .15, -sz * .28, 2, sz * .1, clr, .6));
        }
        break;
      case 'piston':
      case 'mech':
        ct.add(this.add.rectangle(0, 0, sz * .75, sz * .48, clr, .9));
        ct.add(this.add.rectangle(0, -sz * .28, sz * .18, sz * .25, clr, .7));
        break;
      case 'meal':
        ct.add(this.add.circle(0, 0, sz * .4, clr, .8));
        ct.add(this.add.rectangle(-sz * .08, 0, sz * .25, sz * .12, 0xdd8844, .6));
        break;
      case 'board':
        ct.add(this.add.rectangle(0, 0, sz * .85, sz * .55, clr, .9));
        ct.add(this.add.rectangle(-sz * .18, 0, sz * .3, 1.5, 0x88ffaa, .3));
        break;
      case 'engine':
      case 'weapon':
        ct.add(this.add.rectangle(0, 0, sz * .85, sz * .65, clr, .85));
        ct.add(this.add.rectangle(0, -sz * .2, sz * .65, sz * .15, clr, .6));
        break;
      case 'batch':
      case 'module':
        ct.add(this.add.rectangle(0, 0, sz * .8, sz * .6, clr, .85));
        ct.add(this.add.rectangle(0, -sz * .12, sz * .55, sz * .12, clr, .5));
        break;
      case 'chassis':
      case 'missile':
        ct.add(this.add.rectangle(0, 0, sz * .95, sz * .38, clr, .85));
        ct.add(this.add.rectangle(-sz * .35, 0, 3, sz * .3, 0xffffff, .2));
        ct.add(this.add.rectangle(sz * .35, 0, 3, sz * .3, 0xffffff, .2));
        break;
      case 'cargo':
      case 'server':
        ct.add(this.add.rectangle(0, 0, sz * .8, sz * .5, clr, .85));
        ct.add(this.add.circle(sz * .28, -sz * .12, sz * .04, 0x2fffb0, .4));
        break;
      case 'car':
        ct.add(this.add.rectangle(0, 0, sz * .5, sz * .85, clr, .9));
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([ox, oy]) =>
          ct.add(this.add.rectangle(ox * sz * .28, oy * sz * .32, sz * .1, sz * .15, 0x1a1a2a, .7))
        );
        break;
      case 'laser':
        ct.add(this.add.circle(0, 0, sz * .35, clr, .85));
        ct.add(this.add.rectangle(0, 0, sz * .6, 2.5, 0xff4040, .4));
        break;
      case 'supply':
        ct.add(this.add.ellipse(0, 0, sz * .45, sz * .8, clr, .9));
        break;
      case 'aicore':
        ct.add(this.add.circle(0, 0, sz * .35, clr, .85));
        for (let a = 0; a < 4; a++) {
          const ang = a * Math.PI / 2;
          ct.add(this.add.rectangle(Math.cos(ang) * sz * .28, Math.sin(ang) * sz * .28, sz * .12, 3, clr, .5));
        }
        break;
      case 'ship':
      case 'plasma':
        ct.add(this.add.triangle(0, -2, 0, -sz * .45, sz * .3, sz * .3, -sz * .3, sz * .3, clr, .9));
        break;
      case 'nutrient':
      case 'quantum':
        ct.add(this.add.circle(0, 0, sz * .38, clr, .9));
        ct.add(this.add.circle(0, 0, sz * .15, 0xffffff, .2));
        break;
      case 'capital':
      case 'destroyer':
        ct.add(this.add.star(0, 0, 6, sz * .2, sz * .45, clr, .95));
        ct.add(this.add.circle(0, 0, sz * .15, 0xffffff, .2));
        break;
      case 'ambrosia':
      case 'singularity':
        ct.add(this.add.star(0, 0, 8, sz * .18, sz * .42, clr, .95));
        ct.add(this.add.circle(0, 0, sz * .2, 0xffffff, .25));
        break;
      default:
        ct.add(this.add.rectangle(0, 0, sz, sz, clr, .9));
    }

    this.gP.add(ct);
    return ct;
  }

  update(time, delta) {
    const _delta = (typeof delta === 'number' && !isNaN(delta)) ? delta : 16.66;
    const dt = Math.min(_delta / 1000, .05);

    // =======================================================================================
    // INSTRUÇÃO PARA BACKGROUND FUTURO (Parte 4):
    // Descomente o bloco abaixo para o efeito Parallax (movimento lateral) voltar a rodar.
    // =======================================================================================
    /*
    if(this.bgLayer3) this.bgLayer3.tilePositionX += 5 * dt;
    if(this.bgLayer2) this.bgLayer2.tilePositionX += 15 * dt;
    if(this.bgLayer1) this.bgLayer1.tilePositionX += 40 * dt;
    */

    if (!G.branch || !this.lineObjs.length) return;
    const items = getItems();

    if (typeof G.mgNext === 'undefined' || isNaN(G.mgNext)) {
      G.mgTimer = 0;
      G.mgNext = 300 + Math.random() * 600;
    }
    G.mgTimer += dt;
    if (G.mgTimer >= G.mgNext) {
      G.mgTimer = 0;
      G.mgNext = 300 + Math.random() * 600;
      if (typeof startMinigame === 'function' && G.era > 0) startMinigame();
    }

    G.cBoost = Math.min(Math.max(0, (G.cBoost || 0) - G.cDecay * dt * 60), getBoostMax());
    if (isNaN(G.cBoost)) G.cBoost = 0;

    const heatDecay = 8 + 10 * (G.ups.gresf || 0);
    if (!G.overheated) G.heat = Math.max(0, (G.heat || 0) - dt * heatDecay);
    if (isNaN(G.heat)) G.heat = 0;

    const ac = (G.ups.ck3 || 0) + (G.pUps.pf || 0);
    if (ac > 0) {
      this.autoT += dt;
      if (this.autoT >= 1 / Math.max(ac, .5)) {
        this.autoT = 0;
        G.cBoost = Math.min(G.cBoost + G.cPow * .3, getBoostMax());
      }
    }

    const globalBoost = G.cBoost;
    let claimedThisFrame = new Array(8).fill(0);
    let claimedRaw = 0;

    for (let li = G.lines - 1; li >= 0; li--) {
      if (li >= this.lineObjs.length) continue;
      const lo = this.lineObjs[li], it = items[li], baseSpd = getLineSpeed(li), mc = getMC(li);
      const totalSpd = baseSpd + globalBoost;
      const eff = getEff(li);

      const compLevel = (G.bm_comp && G.bm_comp[li]) || 0;
      const batchSize = Math.pow(10, compLevel);
      const threshold = batchSize;

      const isCapped = (G.inv[li] || 0) >= getItemCap();
      let canP = true;

      if (!it.recipe) {
        const rawAvailable = G.raw - claimedRaw;
        if (rawAvailable < batchSize) canP = false;

        if (!isCapped) {
          claimedRaw += Math.min(Math.max(0, rawAvailable), batchSize);
        }
      } else {
        for (const [ti, qty] of Object.entries(it.recipe)) {
          const tiIdx = parseInt(ti);
          const reserve = (G.invReserve && G.invReserve[tiIdx]) || 0;
          const requiredTotal = Math.ceil(qty * eff) * batchSize;
          const available = (G.inv[tiIdx] || 0) - reserve - claimedThisFrame[tiIdx];

          if (available < requiredTotal) canP = false;
        }

        if (!isCapped) {
          for (const [ti, qty] of Object.entries(it.recipe)) {
            const tiIdx = parseInt(ti);
            const reserve = (G.invReserve && G.invReserve[tiIdx]) || 0;
            const requiredTotal = Math.ceil(qty * eff) * batchSize;
            const available = (G.inv[tiIdx] || 0) - reserve - claimedThisFrame[tiIdx];
            claimedThisFrame[tiIdx] += Math.min(Math.max(0, available), requiredTotal);
          }
        }
      }

      if (isCapped) canP = false;

      G.lineStatus[li] = canP ? 'on' : 'off';
      if (lo.statDot) {
        lo.statDot.setFillStyle(canP ? 0x2fffb0 : 0xff5050);
        lo.statDot.setAlpha(canP ? 1 : .3 + Math.sin(time / 250) * .2);
      }

      const rate = .5 * totalSpd * (1 + mc * .3);
      G.lineRates[li] = canP ? rate : 0;

      lo.machines.forEach(m => {
        if (canP) {
          m.offTimer = 0;
          if (!m.isOn) {
            m.isOn = true;
            try {
              m.sprite.play('mach_on');
              m.sprite.once('animationcomplete', () => {
                if (m.isOn) m.sprite.setTexture('mach_idle');
              });
            } catch (e) { }
          }
        } else {
          if (m.isOn) {
            m.offTimer += dt;
            if (m.offTimer >= 3.0) {
              m.isOn = false;
              try {
                m.sprite.play('mach_off');
              } catch (e) {
                m.sprite.setAlpha(0.5);
              }
            }
          }
        }
      });

      if (!canP) continue;

      this.spT[li] = (this.spT[li] || 0) + dt * rate;

      if (isNaN(this.spT[li])) this.spT[li] = 0;
      if (this.spT[li] >= threshold) {
        this.spT[li] -= threshold;
        if (!it.recipe) { G.raw -= batchSize; }
        else {
          for (const [ti, qty] of Object.entries(it.recipe)) {
            G.inv[parseInt(ti)] -= Math.ceil(qty * eff) * batchSize;
            if (G.inv[parseInt(ti)] < 0) G.inv[parseInt(ti)] = 0;
          }
        }

        const lossRate = getLineLoss(li);
        const successInBatch = Math.round(batchSize * (1 - lossRate));
        const lostInBatch = batchSize - successInBatch;
        G.totalLost += lostInBatch;

        if (!G.lossAcc) G.lossAcc = new Array(8).fill(0);
        G.lossAcc[li] += lostInBatch;

        if (successInBatch > 0) {
          if (!G.prodAcc) G.prodAcc = new Array(8).fill(0);
          G.prodAcc[li] += successInBatch;

          if (this.allP.length < MAX_P) {
            const path = lo.path;
            if (path.length > 0) {
              const sp = path[0];
              const prod = this.drawItem(sp.x, sp.y, li);
              if (prod) {
                if (successInBatch > 1) {
                  const txt = this.add.text(0, -12, `x${successInBatch}`, { fontSize: '11px', color: '#2fffb0', fontStyle: 'bold', stroke: '#000', strokeThickness: 3 }).setOrigin(0.5);
                  prod.add(txt);
                }
                this.allP.push({ ct: prod, line: li, pg: 0, amt: successInBatch });
              }
            }
          } else {
            G.inv[li] = (G.inv[li] || 0) + successInBatch;
            G.tProd += successInBatch;
            autoSellCheck(li);
            checkEra();
          }
        }
      }
    }

    for (let i = this.allP.length - 1; i >= 0; i--) {
      const p = this.allP[i];
      const lo = this.lineObjs[p.line];
      if (!lo) { p.ct.destroy(); this.allP.splice(i, 1); continue; }
      const path = lo.path;
      let curSpd = (getLineSpeed(p.line) + globalBoost) * 35;
      if (isNaN(curSpd)) curSpd = 35;
      p.pg = (p.pg || 0) + dt * curSpd;
      const tl = this.pathLen(path);
      if (p.pg >= tl) {
        const amt = p.amt || 1;
        G.inv[p.line] = (G.inv[p.line] || 0) + amt;
        G.tProd += amt;
        autoSellCheck(p.line);
        checkEra();
        p.ct.destroy();
        this.allP.splice(i, 1);
      } else {
        let acc = 0;
        for (let j = 0; j < path.length - 1; j++) {
          const sl = Phaser.Math.Distance.Between(path[j].x, path[j].y, path[j + 1].x, path[j + 1].y);
          if (acc + sl > p.pg) {
            const t = (p.pg - acc) / sl;
            p.ct.x = Phaser.Math.Linear(path[j].x, path[j + 1].x, t);
            p.ct.y = Phaser.Math.Linear(path[j].y, path[j + 1].y, t);
            break;
          }
          acc += sl;
        }
      }
    }

    if (typeof updateBGM === 'function') updateBGM(dt);
    if (typeof tickContracts === 'function') tickContracts(dt);
    if (typeof tickBlackMarket === 'function') tickBlackMarket(dt);
    if (typeof tickRivalry === 'function') tickRivalry(dt);
    if (typeof tickExpeditions === 'function') tickExpeditions();
    if (typeof tickNewsTicker === 'function') tickNewsTicker(dt);

    if (G.fuel > 0) {
      G.fuel = Math.max(0, G.fuel - (dt * 2 * G.lines));
    }

    this.uiT = (this.uiT || 0) + dt;
    if (this.uiT > .2) { this.uiT = 0; updateHUD(); }

    this.uiT2 = (this.uiT2 || 0) + dt;
    if (this.uiT2 > 1) {
      this.uiT2 = 0;

      if (!G.statHistory) G.statHistory = [];
      G.statHistory.push({
        prod: [...(G.prodAcc || new Array(8).fill(0))],
        loss: [...(G.lossAcc || new Array(8).fill(0))],
        val: (G.valAcc || 0)
      });
      if (G.statHistory.length > 60) G.statHistory.shift();

      G.prodAcc = new Array(8).fill(0);
      G.lossAcc = new Array(8).fill(0);
      G.valAcc = 0;

      if (G.branch) {
        const eraRawGen = [1, 1, 1.5, 1.5, 2, 2, 3, 3][Math.min(G.era, 7)];
        const rawAdded = Math.floor(eraRawGen);
        G.raw = Math.floor(G.raw + eraRawGen);
        G.rawFromExtractor = (G.rawFromExtractor || 0) + rawAdded;
      }

      if ((G.ups.w_com || 0) >= 1 && G.raw < (G.autoBuyLimit || 10) && G.money > 0) {
        const p = (G.mktPrices[0]?.cur || 0.5) * 1.05;
        const requestedQty = G.autoBuyQty || 10;
        const totalCost = requestedQty * p;

        if (G.money >= totalCost) {
          G.money -= totalCost;
          G.raw += requestedQty;
          if (typeof sndBuy === 'function') sndBuy();
        } else if (G.money >= p) {
          const possibleQty = Math.floor(G.money / p);
          G.money -= possibleQty * p;
          G.raw += possibleQty;
          if (typeof sndBuy === 'function') sndBuy();
        }
      }

      if (typeof tickMarket === 'function') tickMarket();
      if (typeof recalcAutoReserve === 'function') recalcAutoReserve();
      if (!_panelInputFocused('p-prod')) renderProd();
      if (!_panelInputFocused('p-up')) renderUpgrades();
      if (!_panelInputFocused('p-stats')) renderStats();
      if (!_panelInputFocused('p-cfg')) renderConfig();
      if (typeof renderRivalry === 'function' && document.getElementById('p-rivalry') && document.getElementById('p-rivalry').classList.contains('act') && !_panelInputFocused('p-rivalry')) renderRivalry();

      if (typeof checkRPGTriggers === 'function') checkRPGTriggers();

      if (typeof chkDlg === 'function') chkDlg();
      if (typeof checkAchs === 'function') checkAchs();
    }

    this.saveT += dt;
    if (this.saveT > 15) { this.saveT = 0; saveGame(); }

    this.atlasT = (this.atlasT || 0) + dt;
    if (!this.atlasNext) this.atlasNext = 300 + Math.random() * 240;
    if (this.atlasT >= this.atlasNext) {
      this.atlasT = 0;
      this.atlasNext = 240 + Math.random() * 240;
      if (typeof fireAtlasAmbient === 'function') fireAtlasAmbient();
    }
  }
}