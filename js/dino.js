import { GROUND_TOP } from './ground.js';

const GRAVITY = 1800;
const JUMP_VELOCITY = -600;
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

  jump() {
    if (!this.onGround || this.dead) return;
    this.vy = JUMP_VELOCITY;
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

    ctx.fillStyle = '#535353';

    // Tail (tapers left)
    ctx.fillRect(x,      y + 22, 12, 7);
    ctx.fillRect(x + 2,  y + 27, 8,  5);
    ctx.fillRect(x + 4,  y + 30, 4,  3);

    // Body
    ctx.fillRect(x + 10, y + 18, 24, 20);

    // Neck
    ctx.fillRect(x + 22, y + 10, 12, 12);

    // Head (extends right)
    ctx.fillRect(x + 16, y,      28, 14);

    // Upper jaw cap
    ctx.fillRect(x + 36, y + 12, 8,  4);

    // Lower jaw
    ctx.fillRect(x + 28, y + 12, 16, 6);

    // Eye (white)
    ctx.fillStyle = '#f7f7f7';
    ctx.fillRect(x + 33, y + 2,  7, 7);

    ctx.fillStyle = '#535353';
    if (this.dead) {
      // X eye when dead
      ctx.fillRect(x + 34, y + 3,  2, 2);
      ctx.fillRect(x + 37, y + 3,  2, 2);
      ctx.fillRect(x + 35, y + 5,  2, 2);
      ctx.fillRect(x + 34, y + 7,  2, 2);
      ctx.fillRect(x + 37, y + 7,  2, 2);
    } else {
      // Normal pupil
      ctx.fillRect(x + 35, y + 4,  3, 3);
    }

    // Tiny T-Rex arm
    ctx.fillRect(x + 24, y + 26, 10, 4);
    ctx.fillRect(x + 30, y + 28, 6,  5);

    this._renderLegs(ctx, x, y);
  }

  _renderLegs(ctx, x, y) {
    ctx.fillStyle = '#535353';
    const legY = y + 36;

    if (!this.onGround) {
      // Jump: legs tucked up
      ctx.fillRect(x + 10, legY,     8, 8);
      ctx.fillRect(x + 6,  legY + 6, 10, 4);
      ctx.fillRect(x + 22, legY + 2, 8, 8);
      ctx.fillRect(x + 22, legY + 8, 6, 4);
      return;
    }

    if (this._legFrame === 0) {
      // Left leg forward, right leg back
      ctx.fillRect(x + 10, legY,      8,  10);
      ctx.fillRect(x + 6,  legY + 8,  12, 4);
      ctx.fillRect(x + 22, legY + 4,  8,  8);
      ctx.fillRect(x + 22, legY + 10, 4,  2);
    } else {
      // Right leg forward, left leg back
      ctx.fillRect(x + 10, legY + 4,  8,  8);
      ctx.fillRect(x + 10, legY + 10, 4,  2);
      ctx.fillRect(x + 22, legY,      8,  10);
      ctx.fillRect(x + 18, legY + 8,  12, 4);
    }
  }
}
