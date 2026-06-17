'use strict';

// ─── Canvas setup ────────────────────────────────────────────
const canvas = document.getElementById('c');
const ctx    = canvas.getContext('2d');
const W = 400, H = 600;
const dpr = Math.min(window.devicePixelRatio || 1, 2);
canvas.width  = W * dpr;
canvas.height = H * dpr;
canvas.style.width  = W + 'px';
canvas.style.height = H + 'px';
ctx.scale(dpr, dpr);

// ─── Constants ───────────────────────────────────────────────
const GRAVITY       = 1500;
const JUMP_VY       = -445;
const BIRD_X        = 88;
const PIPE_W        = 58;
const PIPE_GAP      = 142;
const PIPE_INT_BASE = 1.85;
const PIPE_INT_MIN  = 0.95;
const SPEED_BASE    = 165;
const SPEED_MAX     = 255;
const GROUND_H      = 82;
const GROUND_Y      = H - GROUND_H;
const BIRD_R        = 13;

// ─── Game state ──────────────────────────────────────────────
let state      = 'START';   // START | PLAYING | DEAD | GAMEOVER
let score      = 0;
let hiScore    = 0;
let pipeTimer  = 0;
let deadTimer  = 0;
let shakeTimer = 0;
let scoreFlash = 0;
let groundOff  = 0;
let globalT    = 0;

// ─── Utility ─────────────────────────────────────────────────
const clamp = (v, lo, hi) => v < lo ? lo : v > hi ? hi : v;

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function circleVsRect(cx, cy, r, rx, ry, rw, rh) {
  const nx = clamp(cx, rx, rx + rw);
  const ny = clamp(cy, ry, ry + rh);
  return (cx - nx) ** 2 + (cy - ny) ** 2 < r * r;
}

function getSpeed()   { return clamp(SPEED_BASE + score * 2.2, SPEED_BASE, SPEED_MAX); }
function getPipeInt() { return clamp(PIPE_INT_BASE - score * 0.035, PIPE_INT_MIN, PIPE_INT_BASE); }

// ─── Bird ────────────────────────────────────────────────────
const bird = {
  y: H / 2 - 50,
  vy: 0,
  rot: 0,
  wing: 0,
  wingT: 0,
  dead: false,

  reset() {
    this.y    = H / 2 - 50;
    this.vy   = 0;
    this.rot  = 0;
    this.wing = 0;
    this.wingT = 0;
    this.dead = false;
  },

  jump() {
    this.vy    = JUMP_VY;
    this.wing  = 1;
    this.wingT = 0;
  },

  update(dt) {
    this.vy += GRAVITY * dt;
    this.y  += this.vy * dt;

    if (this.dead) this.y = Math.min(this.y, GROUND_Y - BIRD_R - 2);

    const target = clamp(this.vy / 7.5, -25, 90);
    this.rot += (target - this.rot) * 14 * dt;

    this.wingT += dt;
    if (this.wingT > 0.13) {
      this.wingT = 0;
      this.wing  = (this.wing >= 0) ? -1 : 1;
    }
  },

  hover(t) {
    this.y   = H / 2 - 50 + Math.sin(t * 2.6) * 10;
    this.rot = 0;
    this.wingT += 1 / 60;
    if (this.wingT > 0.13) { this.wingT = 0; this.wing = (this.wing >= 0) ? -1 : 1; }
  },

  hitbox() { return { x: BIRD_X, y: this.y, r: BIRD_R }; },

  draw() {
    ctx.save();
    ctx.translate(BIRD_X, this.y);
    ctx.rotate(this.rot * Math.PI / 180);

    const wingOff = this.wing === 1 ? -9 : (this.wing === -1 ? 7 : 0);
    ctx.fillStyle = '#D4900A';
    ctx.beginPath();
    ctx.ellipse(-3, wingOff, 12, 6, this.wing * 0.25, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(180,120,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 5, 18, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFF3A0';
    ctx.beginPath();
    ctx.ellipse(4, 2, 9, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(8, -5, 6.5, 6.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.ellipse(10, -5, 3.2, 3.2, 0, 0, Math.PI * 2);
    ctx.fill();

    if (this.dead) {
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(6, -8); ctx.lineTo(10, -4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(10, -8); ctx.lineTo(6, -4); ctx.stroke();
    } else {
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.ellipse(11, -7, 1.8, 1.8, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#FF8C00';
    ctx.beginPath(); ctx.moveTo(13, -3); ctx.lineTo(23, -1); ctx.lineTo(13, 1); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#E07800';
    ctx.beginPath(); ctx.moveTo(13, 1); ctx.lineTo(22, 2); ctx.lineTo(13, 5); ctx.closePath(); ctx.fill();

    ctx.restore();
  }
};

// ─── Pipes ───────────────────────────────────────────────────
let pipes = [];

function spawnPipe() {
  const gapY = 155 + Math.random() * (GROUND_Y - 310);
  pipes.push({ x: W + 20, gapY, passed: false });
}

function updatePipes(dt) {
  const speed = getSpeed();
  pipeTimer -= dt;
  if (pipeTimer <= 0) {
    pipeTimer = getPipeInt();
    spawnPipe();
  }
  for (const p of pipes) {
    p.x -= speed * dt;
    if (!p.passed && p.x + PIPE_W < BIRD_X - 8) {
      p.passed   = true;
      score++;
      scoreFlash = 0.28;
    }
  }
  pipes = pipes.filter(p => p.x > -PIPE_W - 20);
}

function drawPipes() {
  for (const p of pipes) {
    const half = PIPE_GAP / 2;
    const capW = PIPE_W + 14;
    const capH = 26;
    const capX = p.x - 7;

    const topEnd = p.gapY - half;
    ctx.fillStyle = '#4CAF50';
    if (topEnd - capH > 0) ctx.fillRect(p.x, 0, PIPE_W, topEnd - capH);
    ctx.fillStyle = '#388E3C';
    ctx.fillRect(capX, topEnd - capH, capW, capH);
    ctx.fillStyle = '#2E7D32';
    ctx.fillRect(capX, topEnd - capH, capW, 3);
    ctx.fillRect(capX, topEnd - 3, capW, 3);
    ctx.fillStyle = '#66BB6A';
    ctx.fillRect(p.x + 5, 0, 8, Math.max(0, topEnd - capH - 2));

    const botStart = p.gapY + half;
    const botEnd   = GROUND_Y;
    ctx.fillStyle = '#388E3C';
    ctx.fillRect(capX, botStart, capW, capH);
    ctx.fillStyle = '#2E7D32';
    ctx.fillRect(capX, botStart, capW, 3);
    ctx.fillRect(capX, botStart + capH - 3, capW, 3);
    ctx.fillStyle = '#4CAF50';
    if (botEnd - (botStart + capH) > 0)
      ctx.fillRect(p.x, botStart + capH, PIPE_W, botEnd - (botStart + capH));
    ctx.fillStyle = '#66BB6A';
    ctx.fillRect(p.x + 5, botStart + capH + 2, 8,
                 Math.max(0, botEnd - (botStart + capH) - 2));
  }
}

// ─── Clouds ──────────────────────────────────────────────────
let clouds = [];

function initClouds() {
  clouds = [];
  for (let i = 0; i < 7; i++) {
    clouds.push({
      x:   Math.random() * W,
      y:   28 + Math.random() * 190,
      w:   50 + Math.random() * 70,
      spd: 0.12 + Math.random() * 0.18
    });
  }
}

function updateClouds(dt) {
  const spd = getSpeed();
  for (const c of clouds) {
    c.x -= spd * c.spd * dt;
    if (c.x + c.w < 0) {
      c.x = W + 10;
      c.y = 28 + Math.random() * 190;
      c.w = 50 + Math.random() * 70;
    }
  }
}

function drawClouds() {
  ctx.fillStyle = 'rgba(255,255,255,0.86)';
  for (const c of clouds) {
    const h = c.w * 0.36;
    ctx.beginPath(); ctx.ellipse(c.x + c.w * .50, c.y,        c.w * .50, h * .58, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(c.x + c.w * .28, c.y - h*.32, c.w * .30, h * .52, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(c.x + c.w * .72, c.y - h*.22, c.w * .24, h * .44, 0, 0, Math.PI * 2); ctx.fill();
  }
}

// ─── Ground ──────────────────────────────────────────────────
function updateGround(dt) {
  groundOff = (groundOff + getSpeed() * dt) % 30;
}

function drawGround() {
  ctx.fillStyle = '#8BC34A';
  ctx.fillRect(0, GROUND_Y, W, 10);
  ctx.fillStyle = '#DEB887';
  ctx.fillRect(0, GROUND_Y + 10, W, 22);
  ctx.fillStyle = '#C49055';
  ctx.fillRect(0, GROUND_Y + 32, W, GROUND_H - 32);

  ctx.fillStyle = 'rgba(0,0,0,0.065)';
  for (let x = -groundOff; x < W + 30; x += 30)
    ctx.fillRect(x, GROUND_Y + 10, 15, GROUND_H - 10);

  ctx.fillStyle = '#7CB342';
  for (let x = (20 - groundOff % 30 + 30) % 30; x < W; x += 30) {
    ctx.fillRect(x,      GROUND_Y + 2, 4, 6);
    ctx.fillRect(x + 7,  GROUND_Y,     3, 8);
    ctx.fillRect(x + 13, GROUND_Y + 3, 3, 5);
  }
}

// ─── Background ──────────────────────────────────────────────
function drawBg() {
  const grad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  grad.addColorStop(0,    '#4BA8DC');
  grad.addColorStop(0.55, '#87CEEB');
  grad.addColorStop(1,    '#BAE8FB');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, GROUND_Y);

  ctx.fillStyle = 'rgba(90,170,90,0.38)';
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.bezierCurveTo(70,  GROUND_Y - 60,  150, GROUND_Y - 85, 230, GROUND_Y - 42);
  ctx.bezierCurveTo(300, GROUND_Y - 5,   360, GROUND_Y - 68, W,   GROUND_Y - 52);
  ctx.lineTo(W, GROUND_Y);
  ctx.closePath();
  ctx.fill();
}

// ─── Collision ───────────────────────────────────────────────
function checkCollision() {
  const { x, y, r } = bird.hitbox();
  if (y - r < 0 || y + r > GROUND_Y) return true;

  const inset = 5;
  for (const p of pipes) {
    const half = PIPE_GAP / 2;
    if (circleVsRect(x, y, r - inset, p.x + inset, 0,
                     PIPE_W - inset * 2, p.gapY - half)) return true;
    if (circleVsRect(x, y, r - inset, p.x + inset, p.gapY + half,
                     PIPE_W - inset * 2, GROUND_Y - (p.gapY + half))) return true;
  }
  return false;
}

// ─── UI ──────────────────────────────────────────────────────
function drawPlayingScore() {
  const sc = scoreFlash > 0 ? 1 + scoreFlash * 1.4 : 1;
  ctx.save();
  ctx.translate(W / 2, 72);
  ctx.scale(sc, sc);
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(0,0,0,0.32)';
  ctx.font = 'bold 50px "Courier New", monospace';
  ctx.fillText(score, 3, 3);
  ctx.fillStyle = '#fff';
  ctx.fillText(score, 0, 0);
  ctx.restore();
}

function drawStartScreen() {
  ctx.fillStyle = 'rgba(0,0,0,0.20)';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  roundRect(W/2 - 144, 139, 296, 200, 20);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  roundRect(W/2 - 148, 135, 296, 200, 20);
  ctx.fill();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#2E7D32';
  ctx.font = 'bold 44px "Courier New", monospace';
  ctx.fillText('FLAPPY', W/2, 205);
  ctx.fillStyle = '#E65100';
  ctx.fillText('BIRD', W/2, 256);

  ctx.fillStyle = '#777';
  ctx.font = '12px "Courier New", monospace';
  ctx.fillText('Nhấn SPACE hoặc Tap để bắt đầu', W/2, 298);
  ctx.fillText('▼', W/2, 318);
}

function drawGameOverScreen() {
  ctx.fillStyle = 'rgba(0,0,0,0.50)';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  roundRect(W/2 - 146, H/2 - 144, 300, 296, 20);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.97)';
  roundRect(W/2 - 150, H/2 - 148, 300, 296, 20);
  ctx.fill();

  ctx.textAlign = 'center';

  ctx.fillStyle = '#C62828';
  ctx.font = 'bold 29px "Courier New", monospace';
  ctx.fillText('GAME OVER', W/2, H/2 - 98);

  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(W/2 - 110, H/2 - 74);
  ctx.lineTo(W/2 + 110, H/2 - 74);
  ctx.stroke();

  ctx.fillStyle = '#999';
  ctx.font = '12px "Courier New", monospace';
  ctx.fillText('ĐIỂM SỐ', W/2, H/2 - 44);

  ctx.fillStyle = '#1565C0';
  ctx.font = 'bold 58px "Courier New", monospace';
  ctx.fillText(score, W/2, H/2 + 18);

  ctx.fillStyle = '#888';
  ctx.font = '13px "Courier New", monospace';
  const medal = score >= hiScore && score > 0 ? ' 🏆' : '';
  ctx.fillText(`Cao nhất: ${hiScore}${medal}`, W/2, H/2 + 52);

  ctx.fillStyle = '#43A047';
  roundRect(W/2 - 100, H/2 + 72, 200, 50, 12);
  ctx.fill();
  ctx.fillStyle = '#2E7D32';
  roundRect(W/2 - 100, H/2 + 118, 200, 6, 6);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px "Courier New", monospace';
  ctx.fillText('▶  Chơi lại', W/2, H/2 + 103);
}

// ─── Input ───────────────────────────────────────────────────
function onAction() {
  if (state === 'START') {
    state     = 'PLAYING';
    pipeTimer = 1.6;
    bird.jump();
  } else if (state === 'PLAYING') {
    bird.jump();
  } else if (state === 'GAMEOVER') {
    bird.reset();
    pipes      = [];
    score      = 0;
    pipeTimer  = 1.6;
    deadTimer  = 0;
    shakeTimer = 0;
    scoreFlash = 0;
    state      = 'PLAYING';
    bird.jump();
  }
}

document.addEventListener('keydown', e => {
  if (e.code === 'Space') { e.preventDefault(); onAction(); }
});
canvas.addEventListener('click', onAction);
canvas.addEventListener('touchstart', e => { e.preventDefault(); onAction(); }, { passive: false });

// ─── Main loop ───────────────────────────────────────────────
let lastT = 0;

function loop(t) {
  requestAnimationFrame(loop);

  const dt = Math.min((t - lastT) / 1000, 0.05);
  lastT   = t;
  globalT = t / 1000;

  if (shakeTimer > 0) shakeTimer -= dt;

  if (state === 'START') {
    bird.hover(globalT);
    updateClouds(dt);
    updateGround(dt);

  } else if (state === 'PLAYING') {
    bird.update(dt);
    updatePipes(dt);
    updateClouds(dt);
    updateGround(dt);
    if (scoreFlash > 0) scoreFlash -= dt * 3.5;

    if (checkCollision()) {
      state      = 'DEAD';
      bird.dead  = true;
      shakeTimer = 0.38;
      if (score > hiScore) hiScore = score;
    }

  } else if (state === 'DEAD') {
    bird.update(dt);
    deadTimer += dt;
    if (deadTimer >= 1.3) state = 'GAMEOVER';
  }

  let sx = 0, sy = 0;
  if (shakeTimer > 0) {
    const intensity = shakeTimer * 12;
    sx = (Math.random() - 0.5) * intensity;
    sy = (Math.random() - 0.5) * intensity * 0.5;
  }

  ctx.save();
  ctx.translate(sx, sy);

  drawBg();
  drawClouds();
  drawPipes();
  drawGround();
  bird.draw();

  if (state === 'PLAYING' || state === 'DEAD') drawPlayingScore();
  if (state === 'START')    drawStartScreen();
  if (state === 'GAMEOVER') { drawPlayingScore(); drawGameOverScreen(); }

  ctx.restore();
}

// ─── Boot ────────────────────────────────────────────────────
initClouds();
requestAnimationFrame(t => { lastT = t; requestAnimationFrame(loop); });
