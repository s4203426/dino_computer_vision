# Plan: Flappy Bird — single HTML file

## Mục tiêu
Tạo `flappy-bird.html` — hoàn chỉnh, chơi được ngay khi mở trình duyệt.

## Definition of Done
- [ ] Màn hình Start → Playing → Game Over hoạt động đúng
- [ ] Bird rơi/nhảy mượt, có rotation theo tốc độ
- [ ] Cánh đập theo nhịp (2 frame animation)
- [ ] Pipe spawn ngẫu nhiên, cuộn sang trái, gap ngẫu nhiên
- [ ] Collision: pipe, ceiling, ground → Game Over
- [ ] Score +1 khi qua pipe, hiển thị to giữa trên
- [ ] HI score lưu trong session (biến JS, không localStorage)
- [ ] Nền: trời xanh, mây cuộn parallax, đất cuộn
- [ ] Độ khó tăng dần (pipe speed tăng theo score)
- [ ] Input: Space / click / touch

---

## Cấu trúc file `flappy-bird.html`

```
<html>
  <head> CSS </head>
  <body>
    <canvas id="c">          ← toàn bộ game vẽ ở đây
    <div id="overlay-*">     ← 3 screen overlay (start/playing/gameover)
  </body>
  <script>
    Constants
    Bird class
    Pipe class
    Cloud class
    Ground (scrolling)
    Game state machine
    Game loop (rAF + delta)
    Input handlers
    Render pipeline
  </script>
</html>
```

---

## Các bước implement (theo thứ tự)

### Bước 1 — Scaffold HTML + CSS
- Canvas 400×600px, centered, background #87CEEB
- 3 overlay div: `#screen-start`, `#screen-gameover` (ẩn/hiện bằng CSS class)
- Font pixel-style (Google Fonts: Press Start 2P hoặc system monospace)

### Bước 2 — Constants & helpers
```js
const GRAVITY = 1400      // px/s²
const JUMP_FORCE = -420   // px/s (âm = lên)
const PIPE_SPEED_BASE = 180  // px/s
const PIPE_GAP = 130      // px khe hở
const PIPE_INTERVAL = 1.8 // giây giữa 2 cặp pipe
const BIRD_X = 80         // x cố định của bird
```

### Bước 3 — Bird class
- `x, y, vy` — position + velocity
- `rotation` = clamp(vy / 400 * 90, -25, 90) deg
- `wingFrame` — 0/1, toggle 150ms
- `hitbox()` — hình tròn r=14 (dễ collision hơn rect)
- `render(ctx)` — vẽ thân vàng, cánh (2 frame), mắt, mỏ cam

### Bước 4 — Pipe class
- `x, gapY` (Y trung tâm khe hở)
- `passed = false` (để tính điểm)
- `render(ctx)` — ống xanh lá với viền tối, miệng ống nhô ra (cap)
- Despawn khi `x < -60`

### Bước 5 — Background
- Sky: `ctx.fillRect` màu #87CEEB (hoặc gradient sáng trên)
- Clouds: mảng `{x, y, w}`, cuộn speed × 0.2, wrap-around
- Ground: `scrollX` tăng theo speed, vẽ 2 rect màu #DEB887 + #8B6914

### Bước 6 — Game loop + state machine
```
States: START | PLAYING | DEAD | GAMEOVER
```
- `DEAD`: bird rơi tự do 1s, score flash → chuyển GAMEOVER
- Game loop: `requestAnimationFrame`, delta capped ở 50ms

### Bước 7 — Collision
- Bird hitbox: circle r=14 quanh tâm bird
- Pipe hitbox: 2 rect (top + bottom), inset 2px (forgiving)
- Ceiling (y < 0) và ground (y > GROUND_Y) → DEAD

### Bước 8 — Score & effects
- Score tăng khi `bird.x > pipe.x + pipeWidth/2 && !pipe.passed`
- Score flash: scale lớn 0.2s khi +1
- Death: canvas shake nhẹ (translateX ±4px, 3 lần, 80ms)
- Difficulty: `pipeSpeed = BASE + score * 2` (tối đa BASE + 80)

### Bước 9 — Input
```js
document.addEventListener('keydown', e => e.code==='Space' && action())
canvas.addEventListener('click', action)
canvas.addEventListener('touchstart', action)
```
- `action()`: START → bắt đầu chơi, PLAYING → jump, GAMEOVER → restart

### Bước 10 — Polish
- Màn hình Start: logo text, "Nhấn SPACE hoặc Tap để bắt đầu"
- Màn hình Game Over: score vừa đạt, HI score, "Chơi lại"
- Pipe spawn có delay 1s sau khi bắt đầu (tránh spawn ngay mặt)

---

## Rủi ro
| Rủi ro | Mitigation |
|--------|------------|
| Delta quá lớn (tab background) | Cap delta ở 50ms |
| Touch event double-trigger với click | Dùng `touchstart` + `e.preventDefault()` |
| Pipe gap sát ceiling/ground | Clamp `gapY` trong khoảng [150, canvasH - 200] |
