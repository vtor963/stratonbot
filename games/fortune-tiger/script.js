/* Fortune Tiger valendo: mesmo visual e sons do clone, com aposta e sorteio reais. */
const params = new URLSearchParams(location.search);
const platformId = params.get('platform') || 'demo';
const PKEY = 'player_' + platformId;
const fmt = v => 'R$ ' + Number(v || 0).toFixed(2);

let saldo = 100;
try {
  const p = JSON.parse(localStorage.getItem(PKEY) || 'null');
  if (p && typeof p.saldo === 'number') saldo = p.saldo;
} catch (e) {}
function saveSaldo() {
  try {
    const p = JSON.parse(localStorage.getItem(PKEY) || '{}');
    p.saldo = saldo;
    localStorage.setItem(PKEY, JSON.stringify(p));
  } catch (e) {}
  document.querySelector('#carteira').textContent = fmt(saldo);
}
async function logBet(b) {
  try {
    const m = await import('../../supabase.js');
    await m.sbCreateBet({ platform_id: platformId, jogo: 'fortune-tiger', ...b });
  } catch (e) {}
}

const BETS = [1, 2, 5, 10, 20, 50, 100];
let betIdx = 2;
let spinning = false;
let turbo = localStorage.getItem('tiger_turbo') === '1';
const apostaEl = document.querySelector('#aposta');
function renderBet() { apostaEl.textContent = fmt(BETS[betIdx]); }
apostaEl.addEventListener('click', () => {
  if (spinning) return;
  betIdx = (betIdx + 1) % BETS.length;
  renderBet();
  try{ localStorage.setItem('tiger_bet', String(BETS[betIdx])); }catch(e){}
});
try{ const sb = Number(localStorage.getItem('tiger_bet')); if(BETS.includes(sb)) betIdx = BETS.indexOf(sb); }catch(e){}
renderBet();
saveSaldo();
function setTurbo(v){
  turbo = !!v;
  document.getElementById('btnTurbo').classList.toggle('on', turbo);
  try{ localStorage.setItem('tiger_turbo', turbo ? '1' : '0'); }catch(e){}
}
setTurbo(turbo);

document.getElementById('btnBack').addEventListener('click', () => {
  if (history.length > 1) history.back();
  else location.href = '../../p.html?demo=6666';
});
document.getElementById('btnTurbo').addEventListener('click', () => setTurbo(!turbo));

let bgSound = document.querySelector('#bgSound');
let clickSound = document.querySelector('#clickSound');
let spinSound = document.querySelector('#spinSound');
let spinSound2 = document.querySelector('#spinSound2');
let coinsSound = document.querySelector('#coinsSound');
let win1 = document.querySelector('#win1');
let bigWinSound = document.querySelector('#bigWinSound');
let fogosSound = document.querySelector('#fogosSound');
let levelupSound = document.querySelector('#levelupSound');
let levelupSound2 = document.querySelector('#levelupSound2');

bgSound.volume = 0;
document.querySelector('.start-button').addEventListener('click', () => {
  document.querySelector('.stage1').style.display = 'none';
  document.querySelector('.stage2').style.maxHeight = 'unset';
  document.querySelector('.stage2').style.maxWidth = 'unset';
  document.querySelector('.stage2').style.opacity = '1';
  startVolumeIncrease();
});

function startVolumeIncrease() {
  bgSound.volume = 0.3;
  try { bgSound.play(); } catch (e) {}
  const targetVolume = 0.6;
  const intervalId = setInterval(() => {
    if (bgSound.volume < targetVolume) {
      bgSound.volume = Math.min(bgSound.volume + 0.01, targetVolume);
    } else {
      clearInterval(intervalId);
    }
  }, 100);
}

const marquees = document.querySelectorAll('.marquee .marqueeSpace');
let currentIndex = 0;
function updateMarquee() {
  marquees.forEach((marquee) => marquee.classList.add('hidden'));
  marquees[currentIndex].classList.remove('hidden');
  currentIndex = (currentIndex + 1) % marquees.length;
}
updateMarquee();
setInterval(updateMarquee, 8000);

const positions = [
  ['-41.4%', '-30%', '-81.8%'],
  ['-7.8%', '0', '-14.8%'],
  ['-15%', '-7.4%', '-26.05%'],
];
function randomRow() { return positions[Math.floor(Math.random() * positions.length)]; }

function flashNoFunds() {
  const c = document.querySelector('#carteira');
  const old = c.style.color;
  c.style.color = '#ff5555';
  const sp = document.querySelector('.marqueeSpace span');
  const oldTxt = sp.textContent;
  sp.textContent = 'Saldo insuficiente. Deposite para continuar.';
  setTimeout(() => { c.style.color = old; sp.textContent = oldTxt; }, 1800);
}

function resetRoundVisual() {
  document.querySelector('.allmarquee').style.opacity = '1';
  document.querySelector('.speedlight').style.opacity = '0';
  document.querySelector('#ganhoCols1').style.opacity = '0';
  const g2 = document.querySelector('#ganhoCols2');
  g2.style.opacity = '0';
  g2.style.display = 'grid';
  document.querySelector('.ganho').classList.remove('show');
}

function hideBigWin() {
  const gg = document.querySelector('.grandeGanho');
  gg.style.display = 'none';
  gg.style.opacity = '0';
  document.querySelector('#grandeGanhoImg').style.display = 'block';
  document.querySelector('#megaGanhoImg').style.display = 'none';
  document.querySelector('#superMegaGanhoImg').style.display = 'none';
  document.querySelector('.circle').classList.remove('lastCircle');
  document.querySelector('.bgGanho').classList.remove('mixed');
  document.querySelector('.btnFim').style.display = 'none';
  document.querySelector('.btnFim').style.opacity = '0';
  document.querySelector('#cont2').style.display = 'none';
  try { fogosSound.pause(); } catch (e) {}
}
document.getElementById('btnResgatar').addEventListener('click', hideBigWin);

function countTo(prize) {
  const el = document.getElementById('cont1');
  const target = Math.max(1, Math.floor(prize));
  const dur = 3200;
  const t0 = Date.now();
  const megaAt = prize >= 200;
  const superAt = prize >= 500;
  let megaShown = false, superShown = false;
  const iv = setInterval(() => {
    const k = Math.min(1, (Date.now() - t0) / dur);
    const val = Math.floor(target * k);
    el.textContent = 'R$ ' + val + '.00';
    if (megaAt && !megaShown && k >= 0.55) {
      megaShown = true;
      document.querySelector('#grandeGanhoImg').style.display = 'none';
      document.querySelector('#megaGanhoImg').style.display = 'block';
      document.querySelector('.grandeGanho').classList.add('explode');
      document.querySelector('.bgGanho').classList.add('mixed');
      try { spinSound2.play(); levelupSound2.play(); } catch (e) {}
    }
    if (superAt && !superShown && k >= 0.85) {
      superShown = true;
      document.querySelector('#megaGanhoImg').style.display = 'none';
      document.querySelector('#superMegaGanhoImg').style.display = 'block';
      document.querySelector('.grandeGanho').classList.add('explode', 'pinkBright');
      try { fogosSound.play(); bigWinSound.play(); } catch (e) {}
      document.querySelector('.circle').classList.add('lastCircle');
    }
    if (k >= 1) {
      clearInterval(iv);
      el.innerText = fmt(prize);
      document.querySelector('#cont2').style.display = 'flex';
      document.querySelector('.btnFim').style.display = 'block';
      document.querySelector('.btnFim').style.opacity = '1';
    }
  }, 50);
}

function stopSpin(column, row, index) {
  column.style.animation = 'none';
  column.style.transform = 'translateY(' + row[index] + ')';
}

document.getElementById('spinButton').addEventListener('click', function (e) {
  if (spinning) return;
  const bet = BETS[betIdx];
  if (!(bet > 0) || bet > saldo) { flashNoFunds(); return; }
  spinning = true;
  saldo = Math.round((saldo - bet) * 100) / 100;
  saveSaldo();
  resetRoundVisual();
  hideBigWin();

  try { clickSound.play(); spinSound.play(); } catch (err) {}

  e.target.classList.add('rotateFaster');
  e.target.blur();
  document.querySelector('body').focus();
  let stars = document.querySelector('.stars');
  stars.classList.add('anim');

  const columns = [
    document.getElementById('col1'),
    document.getElementById('col2'),
    document.getElementById('col3'),
  ];
  columns.forEach((col) => { col.style.animation = 'spin 0.7s linear infinite'; });
  const cols = document.querySelectorAll('.col');
  cols.forEach((col) => { col.classList.add('shinecol'); });

  const r = Math.random();
  const outcome = r < 0.18 ? 'small' : (r < 0.24 ? 'big' : 'loss');
  const row = randomRow();

  function finishSpin(betV){
    e.target.classList.remove('rotateFaster');
    stars.classList.remove('anim');
    cols.forEach((col) => { col.classList.remove('shinecol'); });

    if (outcome === 'small') {
      const prize = betV * 2;
      document.querySelector('.allmarquee').style.opacity = '0';
      document.querySelector('.speedlight').style.opacity = '0.2';
      document.querySelector('.ganho').classList.add('show');
      document.querySelector('.ganho span').textContent = 'Ganho ' + fmt(prize);
      document.querySelector('#ganhoCols1').style.opacity = '1';
      try { win1.play(); } catch (err) {}
      document.querySelector('#total').textContent = fmt(prize);
      saldo = Math.round((saldo + prize) * 100) / 100;
      saveSaldo();
      logBet({ valor: betV, multiplicador: 2, retorno: prize, resultado: 'win' });
    } else if (outcome === 'big') {
      const prize = betV * 10;
      document.querySelector('#ganhoCols2').style.opacity = '1';
      try { win1.play(); } catch (err) {}
      document.querySelector('#total').textContent = fmt(prize);
      saldo = Math.round((saldo + prize) * 100) / 100;
      saveSaldo();
      logBet({ valor: betV, multiplicador: 10, retorno: prize, resultado: 'win' });
      setTimeout(() => {
        try { coinsSound.play(); } catch (err) {}
        bgSound.volume = 0.3;
        const gg = document.querySelector('.grandeGanho');
        gg.style.display = 'block';
        gg.style.opacity = '1';
        countTo(prize);
      }, turbo ? 120 : 1000);
    } else {
      logBet({ valor: betV, multiplicador: 0, retorno: 0, resultado: 'loss' });
    }
    spinning = false;
  }
  if(turbo){
    cols.forEach((col,i)=> stopSpin(col,row,i));
    finishSpin(bet);
    return;
  }
  setTimeout(() => stopSpin(columns[0], row, 0), turbo ? 120 : 400);
  setTimeout(() => stopSpin(columns[1], row, 1), turbo ? 220 : 900);
  setTimeout(() => {
    stopSpin(columns[2], row, 2);
    finishSpin(bet);
  }, 3000);
});
