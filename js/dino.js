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
    ctx.fillStyle = '#535353';
    const x = this.x;
    const y = this.y;

    // Body
    ctx.fillRect(x + 8, y + 4, 28, 20);
    // Head
    ctx.fillRect(x + 20, y, 20, 16);
    // Eye
    ctx.fillStyle = '#f7f7f7';
    ctx.fillRect(x + 34, y + 4, 4, 4);
    ctx.fillStyle = '#535353';
    // Mouth bump
    ctx.fillRect(x + 36, y + 12, 6, 4);
    // Tail
    ctx.fillRect(x, y + 8, 12, 8);

    if (this.dead) {
      // X eyes
      ctx.fillStyle = '#f7f7f7';
      ctx.fillRect(x + 30, y + 2, 8, 8);
      ctx.fillStyle = '#535353';
      ctx.fillRect(x + 31, y + 3, 2, 2);
      ctx.fillRect(x + 35, y + 3, 2, 2);
      ctx.fillRect(x + 31, y + 7, 2, 2);
      ctx.fillRect(x + 35, y + 7, 2, 2);
    }

    // Legs
    if (!this.dead) {
      this._renderLegs(ctx, x, y);
    }
  }

  _renderLegs(ctx, x, y) {
    ctx.fillStyle = '#535353';
    const legY = y + DINO_H - 16;
    if (this.onGround) {
      if (this._legFrame === 0) {
        ctx.fillRect(x + 12, legY, 8, 16);
        ctx.fillRect(x + 24, legY + 8, 8, 8);
      } else {
        ctx.fillRect(x + 12, legY + 8, 8, 8);
        ctx.fillRect(x + 24, legY, 8, 16);
      }
    } else {
      // Jump pose: both legs back
      ctx.fillRect(x + 10, legY + 4, 8, 12);
      ctx.fillRect(x + 22, legY + 4, 8, 12);
    }
  }
}
