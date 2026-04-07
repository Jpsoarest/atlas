const AudioCtx=window.AudioContext||window.webkitAudioContext;let actx;
function initAudio(){if(!actx)try{actx=new AudioCtx()}catch(e){}}
function playTone(freq,dur,vol=.1,type='sine'){if(!actx)return;const o=actx.createOscillator(),g=actx.createGain();o.type=type;o.frequency.value=freq;g.gain.value=vol;g.gain.exponentialRampToValueAtTime(.001,actx.currentTime+dur);o.connect(g);g.connect(actx.destination);o.start();o.stop(actx.currentTime+dur)}
function sndClick(){initAudio();playTone(880,.06,.08)}
function sndFail(){initAudio();playTone(220,.2,.1,'sawtooth')}
function sndBuy(){initAudio();playTone(660,.1,.06);setTimeout(()=>playTone(880,.08,.05),60)}
function sndSell(){initAudio();playTone(440,.08,.05);setTimeout(()=>playTone(550,.06,.04),50)}
function sndAch(){initAudio();playTone(523,.12,.07);setTimeout(()=>playTone(659,.1,.06),100);setTimeout(()=>playTone(784,.15,.08),200)}
function sndPrestige(){initAudio();playTone(330,.2,.08,'triangle');setTimeout(()=>playTone(440,.2,.07,'triangle'),150);setTimeout(()=>playTone(660,.3,.09,'triangle'),300)}
function haptic(ms=10){try{navigator.vibrate&&navigator.vibrate(ms)}catch(e){}}

let audioTimer = 0;
function updateBGM(dt) {
   if(!actx || !G.branch || G.cBoost < 0.2) return;
   audioTimer += dt;
   const speed = Math.max(0.1, 1 - G.cBoost * 0.25);
   if(audioTimer > speed) {
       audioTimer -= speed;
       playTone(100 + G.cBoost * 25, 0.1, 0.015, 'square');
   }
}
