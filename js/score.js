const HI_KEY = 'dino_hi_score';

export class ScoreManager {
  constructor() {
    this.score = 0;
    this.hi = parseInt(localStorage.getItem(HI_KEY) || '0', 10);
    this._prevMilestone = 0;
  }

  reset() {
    this.score = 0;
    this._prevMilestone = 0;
  }

  update(delta) {
    this.score += delta * 10;
    const milestone = Math.floor(this.score / 100);
    if (milestone > this._prevMilestone) {
      this._prevMilestone = milestone;
      return true;
    }
    return false;
  }

  saveHI() {
    if (this.score > this.hi) {
      this.hi = Math.floor(this.score);
      localStorage.setItem(HI_KEY, this.hi);
    }
  }

  render(ctx) {
    const s = String(Math.floor(this.score)).padStart(5, '0');
    const h = String(this.hi).padStart(5, '0');
    ctx.fillStyle = '#535353';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`HI ${h}  ${s}`, 790, 30);
  }
}
