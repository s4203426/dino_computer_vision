import { GROUND_TOP } from './ground.js';

const CACTUS_TYPES = [
  { w: 17, h: 35, arms: false },
  { w: 25, h: 50, arms: true },
  { w: 50, h: 35, arms: false, cluster: 3 },
];

function makeCactus(type) {
  return {
    x: 840,
    y: GROUND_TOP - type.h,
    w: type.w,
    h: type.h,
    arms: type.arms,
    cluster: type.cluster || 1,
    active: true,
  };
}

export class ObstacleManager {
  constructor() {
    this.obstacles = [];
    this._timer = 0;
    this._nextSpawn = 2.3;
  }

  reset() {
    this.obstacles = [];
    this._timer = 0;
    this._nextSpawn = 2.3;
  }

  _baseInterval(score) {
    if (score < 200) return 2.3;
    const steps = Math.min(5, Math.floor((score - 200) / 100) + 1);
    return 3.0 - steps * 0.3;
  }

  update(speed, score) {
    for (const o of this.obstacles) o.x -= speed;
    this.obstacles = this.obstacles.filter((o) => o.x + o.w + 60 > 0);

    this._timer += 1 / 60;
    if (this._timer >= this._nextSpawn) {
      this._timer = 0;
      this._nextSpawn = this._baseInterval(score) + Math.random() * 1.2;
      const type = CACTUS_TYPES[Math.floor(Math.random() * CACTUS_TYPES.length)];
      this.obstacles.push(makeCactus(type));
    }
  }

  checkCollision(dino) {
    const d = dino.hitbox();
    for (const o of this.obstacles) {
      const ox = o.x + 4;
      const ow = o.w - 8;
      if (d.x < ox + ow && d.x + d.w > ox && d.y < o.y + o.h && d.y + d.h > o.y) {
        return true;
      }
    }
    return false;
  }

  render(ctx) {
    ctx.fillStyle = '#535353';
    for (const o of this.obstacles) {
      this._drawCactus(ctx, o);
    }
  }

  _drawCactus(ctx, o) {
    const { x, y, w, h, arms, cluster } = o;

    if (cluster > 1) {
      for (let i = 0; i < cluster; i++) {
        ctx.fillRect(x + i * 18, y, 14, h);
        ctx.fillRect(x + i * 18 + 3, y - 4, 8, 6);
      }
      return;
    }

    // Main trunk
    ctx.fillRect(x + Math.floor(w / 2) - 5, y, 10, h);
    // Top cap
    ctx.fillRect(x + Math.floor(w / 2) - 8, y, 16, 8);

    if (arms) {
      // Left arm
      ctx.fillRect(x, y + 10, Math.floor(w / 2) - 5, 8);
      ctx.fillRect(x, y + 4, 8, 14);
      // Right arm
      ctx.fillRect(x + Math.floor(w / 2) + 5, y + 10, Math.floor(w / 2) - 5, 8);
      ctx.fillRect(x + w - 8, y + 4, 8, 14);
    }
  }
}
