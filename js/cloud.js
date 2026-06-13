export class CloudManager {
  constructor() {
    this.clouds = [];
    this._spawnTimer = 0;
    this._spawnInterval = 3;
  }

  update(speed) {
    for (const c of this.clouds) c.x -= speed;
    this.clouds = this.clouds.filter((c) => c.x + c.w > 0);

    this._spawnTimer += 1 / 60;
    if (this._spawnTimer >= this._spawnInterval) {
      this._spawnTimer = 0;
      this._spawnInterval = 2 + Math.random() * 4;
      this.clouds.push({
        x: 820,
        y: 60 + Math.random() * 80,
        w: 60 + Math.random() * 40,
        h: 20 + Math.random() * 10,
      });
    }
  }

  render(ctx) {
    ctx.fillStyle = '#d3d3d3';
    for (const c of this.clouds) {
      ctx.fillRect(c.x, c.y, c.w, c.h);
      ctx.fillRect(c.x + 10, c.y - 8, c.w - 20, 10);
    }
  }
}
