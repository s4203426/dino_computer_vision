export const GameState = {
  WAITING: 'WAITING',
  PLAYING: 'PLAYING',
  GAMEOVER: 'GAMEOVER',
};

export class Game {
  constructor(canvas, dino, obstacleManager, groundRenderer, cloudManager, scoreManager) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.dino = dino;
    this.obstacleManager = obstacleManager;
    this.groundRenderer = groundRenderer;
    this.cloudManager = cloudManager;
    this.scoreManager = scoreManager;

    this.state = GameState.WAITING;
    this.speed = 6;
    this.lastTime = 0;
    this.flashTimer = 0;
    this.rafId = null;

    this._setupCanvas();
    this._bindInput();
  }

  _setupCanvas() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = 800 * dpr;
    this.canvas.height = 300 * dpr;
    this.canvas.style.width = '800px';
    this.canvas.style.height = '300px';
    this.ctx.scale(dpr, dpr);
  }

  _bindInput() {
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        this._handleAction();
      }
    });
    this.canvas.addEventListener('click', () => this._handleAction());
  }

  _handleAction() {
    if (this.state === GameState.WAITING) {
      this.start();
    } else if (this.state === GameState.PLAYING) {
      this.dino.jump();
    } else if (this.state === GameState.GAMEOVER) {
      this.restart();
    }
  }

  triggerJump() {
    if (this.state === GameState.WAITING) {
      this.start();
    } else if (this.state === GameState.PLAYING) {
      this.dino.jump();
    } else if (this.state === GameState.GAMEOVER) {
      this.restart();
    }
  }

  start() {
    this.state = GameState.PLAYING;
    this.speed = 6;
  }

  restart() {
    this.state = GameState.PLAYING;
    this.speed = 6;
    this.dino.reset();
    this.obstacleManager.reset();
    this.scoreManager.reset();
  }

  gameOver() {
    this.state = GameState.GAMEOVER;
    this.dino.die();
    this.scoreManager.saveHI();
  }

  run() {
    this.rafId = requestAnimationFrame((t) => this._loop(t));
  }

  _loop(timestamp) {
    const delta = Math.min((timestamp - this.lastTime) / 1000, 0.05);
    this.lastTime = timestamp;

    this._update(delta);
    this._render();

    this.rafId = requestAnimationFrame((t) => this._loop(t));
  }

  _update(delta) {
    if (this.state !== GameState.PLAYING) return;

    this.groundRenderer.update(this.speed);
    this.cloudManager.update(this.speed * 0.3);
    this.dino.update(delta);
    this.obstacleManager.update(this.speed);

    const milestone = this.scoreManager.update(delta);
    if (milestone) this.flashTimer = 0.4;

    this.speed = Math.min(6 + this.scoreManager.score / 200, 13);

    if (this.obstacleManager.checkCollision(this.dino)) {
      this.gameOver();
    }

    if (this.flashTimer > 0) this.flashTimer -= delta;
  }

  _render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, 800, 300);

    if (this.flashTimer > 0) {
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, 800, 300);
    }

    this.cloudManager.render(ctx);
    this.groundRenderer.render(ctx);
    this.obstacleManager.render(ctx);
    this.dino.render(ctx);
    this.scoreManager.render(ctx);

    if (this.state === GameState.WAITING) {
      this._renderWaiting(ctx);
    } else if (this.state === GameState.GAMEOVER) {
      this._renderGameOver(ctx);
    }
  }

  _renderWaiting(ctx) {
    ctx.fillStyle = '#535353';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('NHAY LEN HOAC NHAN SPACE DE BAT DAU', 400, 150);
  }

  _renderGameOver(ctx) {
    ctx.fillStyle = '#535353';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', 400, 130);
    ctx.font = '14px monospace';
    ctx.fillText('SPACE / NHAY DE CHOI LAI', 400, 160);
  }
}
