const GROUND_Y = 240;
const BUMP_CHARS = [2, 4, 6, 8];

export const GROUND_TOP = GROUND_Y;

export class GroundRenderer {
  constructor() {
    this.offset = 0;
    this.bumps = this._generateBumps(1600);
  }

  _generateBumps(width) {
    const bumps = [];
    let x = 0;
    while (x < width) {
      const gap = 20 + Math.random() * 60;
      x += gap;
      bumps.push({ x, h: BUMP_CHARS[Math.floor(Math.random() * BUMP_CHARS.length)] });
    }
    return bumps;
  }

  update(speed) {
    this.offset = (this.offset + speed) % 1200;
  }

  render(ctx) {
    ctx.fillStyle = '#535353';
    ctx.fillRect(0, GROUND_Y, 800, 2);

    for (const bump of this.bumps) {
      const x = (bump.x - this.offset + 1200) % 1200;
      if (x < 800) {
        ctx.fillRect(x, GROUND_Y + 3, 2, bump.h > 4 ? 2 : 1);
      }
    }
  }
}
