import { GROUND_TOP } from './ground.js';

const GRAVITY = 1800;
const START_X = 80;
const DINO_W = 44;
const DINO_H = 48;

export class Dino {
  constructor() {
    this.x = START_X;
    this.w = DINO_W;
    this.h = DINO_H;
    this.reset();
  }

  get groundY() {
    return GROUND_TOP - this.h;
  }

  reset() {
    this.y = this.groundY;
    this.vy = 0;
    this.onGround = true;
    this.dead = false;
    this._legFrame = 0;
    this._legTimer = 0;
  }

  jump(speed = 6) {
    if (!this.onGround || this.dead) return;
    this.vy = -(600 + (speed - 6) * 20);
    this.onGround = false;
  }

  die() {
    this.dead = true;
  }

  update(delta) {
    if (this.dead) return;

    if (!this.onGround) {
      this.vy += GRAVITY * delta;
      this.y += this.vy * delta;
    }

    if (this.y >= this.groundY) {
      this.y = this.groundY;
      this.vy = 0;
      this.onGround = true;
    }

    if (this.onGround) {
      this._legTimer += delta;
      if (this._legTimer > 0.15) {
        this._legTimer = 0;
        this._legFrame = 1 - this._legFrame;
      }
    }
  }

  hitbox() {
    return { x: this.x + 6, y: this.y + 4, w: this.w - 12, h: this.h - 4 };
  }

  render(ctx) {
    const x = this.x;
    const y = this.y;
    const c = '#535353';

    // ── TAIL ──
    ctx.fillStyle = c;
    ctx.fillRect(x,      y + 20, 8,  10);
    ctx.fillRect(x + 4,  y + 28, 6,  6);

    // ── BODY (large upright mass) ──
    ctx.fillRect(x + 6,  y + 14, 26, 24);

    // ── NECK ──
    ctx.fillRect(x + 18, y + 8,  14, 10);

    // ── BROW (bump trên đầu) ──
    ctx.fillRect(x + 16, y,      12, 6);

    // ── HEAD ──
    ctx.fillRect(x + 12, y + 4,  30, 18);

    // ── EYE ──
    ctx.fillStyle = '#f7f7f7';
    ctx.fillRect(x + 30, y + 6,  8,  8);
    ctx.fillStyle = c;
    if (this.dead) {
      ctx.fillRect(x + 31, y + 7,  2, 2);
      ctx.fillRect(x + 35, y + 7,  2, 2);
      ctx.fillRect(x + 32, y + 9,  2, 2);
      ctx.fillRect(x + 31, y + 11, 2, 2);
      ctx.fillRect(x + 35, y + 11, 2, 2);
    } else {
      ctx.fillRect(x + 32, y + 8,  4, 4);
    }

    // ── ARM ──
    ctx.fillRect(x + 18, y + 22, 12, 4);
    ctx.fillRect(x + 24, y + 24, 8,  6);

    this._renderLegs(ctx, x, y);
  }

  _renderLegs(ctx, x, y) {
    ctx.fillStyle = '#535353';
    const legY = y + 36;

    if (!this.onGround) {
      ctx.fillRect(x + 8,  legY,     10, 6);
      ctx.fillRect(x + 4,  legY + 4, 8,  4);
      ctx.fillRect(x + 20, legY + 2, 10, 8);
      ctx.fillRect(x + 20, legY + 8, 6,  4);
      return;
    }

    if (this._legFrame === 0) {
      ctx.fillRect(x + 18, legY,     10, 12);
      ctx.fillRect(x + 14, legY + 8, 12, 4);
      ctx.fillRect(x + 8,  legY + 6, 10, 6);
    } else {
      ctx.fillRect(x + 18, legY + 6, 10, 6);
      ctx.fillRect(x + 8,  legY,     10, 12);
      ctx.fillRect(x + 4,  legY + 8, 12, 4);
    }
  }
}
