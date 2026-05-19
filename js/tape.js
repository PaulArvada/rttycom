/**
 * tape.js — ITA2 Baudot 5-level punched tape renderer
 * RTTY.COM website
 *
 * Renders two canvas elements as authentic paper tape strips:
 *   #tapeTop — encodes RTTY.COM in ITA2
 *   #tapeBot — encodes DE W2TTY in ITA2
 *
 * ITA2 bit order in this file: [b5, b4, b3, b2, b1]
 * where b5 is the top data channel and b1 is the bottom.
 * The sprocket hole sits between channels 3 and 2 (always punched).
 *
 * ITA2 code reference (decimal → bit pattern):
 *   LTRS=31 FIGS=27 SP=4 CR=8 LF=2
 *   A=3  B=25 C=14 D=9  E=1  F=13 G=26 H=20 I=6  J=11
 *   K=15 L=18 M=28 N=12 O=24 P=22 Q=23 R=10 S=5  T=16
 *   U=7  V=30 W=19 X=29 Y=21 Z=17
 *   Figures: .(period)=M-key(28)  2=W-key(19)  0=P-key(22)
 */

// Top tape: LTRS R T T Y FIGS .(M-key) LTRS C O M SP
const TAPE_TOP = [
  [1,1,1,1,1], // LTRS (31)
  [0,1,0,1,0], // R    (10)
  [1,0,0,0,0], // T    (16)
  [1,0,0,0,0], // T    (16)
  [1,0,1,0,1], // Y    (21)
  [1,1,0,1,1], // FIGS (27)
  [1,1,1,0,0], // .    M-key in FIGS (28)
  [1,1,1,1,1], // LTRS (31)
  [0,1,1,1,0], // C    (14)
  [1,1,0,0,0], // O    (24)
  [1,1,1,0,0], // M    (28)
  [0,0,1,0,0], // SP   (4)
];

// Bottom tape: LTRS D E SP W FIGS 2(W-key) LTRS T T Y SP
// W2TTY: W is a letter; 2 requires FIGS shift (W-key=19 in figures); then LTRS back for TTY
const TAPE_BOT = [
  [1,1,1,1,1], // LTRS (31)
  [0,1,0,0,1], // D    (9)
  [0,0,0,0,1], // E    (1)
  [0,0,1,0,0], // SP   (4)
  [1,0,0,1,1], // W    (19)
  [1,1,0,1,1], // FIGS (27)
  [1,0,0,1,1], // 2    W-key in FIGS (19)
  [1,1,1,1,1], // LTRS (31)
  [1,0,0,0,0], // T    (16)
  [1,0,0,0,0], // T    (16)
  [1,0,1,0,1], // Y    (21)
  [0,0,1,0,0], // SP   (4)
];

function drawTape(canvas, bits) {
  const W = canvas.offsetWidth || 900;
  const H = 52;
  canvas.width  = W;
  canvas.height = H;
  canvas.style.height = H + 'px';

  const ctx = canvas.getContext('2d');

  // Layout constants
  const COL = 13;                               // pixels per character column
  const CH  = [6.5, 14.5, 22.5, 35.5, 43.5];  // y-centers: channels 5→1
  const SPY = 29;                               // sprocket y-center
  const HR  = 4.2;                              // data hole radius (px)
  const SR  = 2.0;                              // sprocket hole radius (px)

  // Pale yellow paper tape background
  ctx.fillStyle = '#f0e8a8';
  ctx.fillRect(0, 0, W, H);

  // Subtle horizontal paper grain
  ctx.fillStyle = 'rgba(0,0,0,0.05)';
  for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);

  // Top and bottom edge strips (slightly darker)
  ctx.fillStyle = '#c8c080';
  ctx.fillRect(0, 0, W, 2);
  ctx.fillRect(0, H - 2, W, 2);

  const cols = Math.ceil(W / COL) + 1;

  for (let c = 0; c < cols; c++) {
    const x = c * COL + 6.5;
    const b = bits[c % bits.length];

    // Sprocket hole — always punched, smaller than data holes
    ctx.beginPath();
    ctx.arc(x, SPY, SR + 0.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, SPY, SR, 0, Math.PI * 2);
    ctx.fillStyle = '#a8a060';
    ctx.fill();

    // Data holes — only where bit is 1 (punched)
    for (let ch = 0; ch < 5; ch++) {
      if (b[ch]) {
        // Drop shadow gives depth illusion
        ctx.beginPath();
        ctx.arc(x + 0.8, CH[ch] + 0.8, HR, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.28)';
        ctx.fill();
        // The hole itself — punched through, light cream
        ctx.beginPath();
        ctx.arc(x, CH[ch], HR, 0, Math.PI * 2);
        ctx.fillStyle = '#faf8f0';
        ctx.fill();
        // Top-left highlight suggests roundness of punch
        ctx.beginPath();
        ctx.arc(x - 0.8, CH[ch] - 0.8, HR * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,240,0.5)';
        ctx.fill();
      }
    }
  }
}

function addTapeHover(canvas, mainLabel, codeSeq) {
  const isTop = canvas.id === 'tapeTop';
  canvas.style.cursor = 'crosshair';

  const tip = document.createElement('div');
  Object.assign(tip.style, {
    position:       'fixed',
    background:     '#e8e0cc',
    border:         '1px solid #9a8868',
    borderLeft:     '3px solid #1a1510',
    boxShadow:      '2px 2px 0 rgba(0,0,0,0.14)',
    fontFamily:     "'Courier Prime','Courier New',monospace",
    textTransform:  'uppercase',
    pointerEvents:  'none',
    opacity:        '0',
    transition:     'opacity .15s',
    zIndex:         '999',
    whiteSpace:     'nowrap',
    padding:        '6px 14px 7px',
  });

  const l1 = document.createElement('div');
  l1.textContent = '■ ' + mainLabel;
  Object.assign(l1.style, {
    fontSize:      '11px',
    letterSpacing: '.18em',
    color:         '#3a2e20',
    fontWeight:    '700',
    marginBottom:  '3px',
  });

  const l2 = document.createElement('div');
  l2.textContent = codeSeq;
  Object.assign(l2.style, {
    fontSize:      '10px',
    letterSpacing: '.12em',
    color:         '#7a6a50',
  });

  tip.appendChild(l1);
  tip.appendChild(l2);
  document.body.appendChild(tip);

  canvas.addEventListener('mouseenter', function () {
    tip.style.opacity = '1';
  });

  canvas.addEventListener('mousemove', function (e) {
    const rect = canvas.getBoundingClientRect();
    tip.style.left      = (e.clientX + 12) + 'px';
    tip.style.top       = isTop ? (rect.bottom + 6) + 'px' : (rect.top - tip.offsetHeight - 6) + 'px';
    tip.style.transform = 'none';
  });

  canvas.addEventListener('mouseleave', function () {
    tip.style.opacity = '0';
  });
}

document.addEventListener('DOMContentLoaded', function () {
  const top = document.getElementById('tapeTop');
  const bot = document.getElementById('tapeBot');
  if (top) { drawTape(top, TAPE_TOP); addTapeHover(top, 'RTTY.COM — ITA2 Baudot 5-level punched tape', 'LTRS R T T Y · FIGS . · LTRS C O M'); }
  if (bot) { drawTape(bot, TAPE_BOT); addTapeHover(bot, 'DE W2TTY — ITA2 Baudot 5-level punched tape', 'LTRS D E SP W · FIGS 2 · LTRS T T Y'); }
});
