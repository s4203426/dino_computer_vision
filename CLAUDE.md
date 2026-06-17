# dino_computer_vision

## Dự án là gì
Game Dino Runner tích hợp computer vision: người chơi nhảy bằng cử chỉ cơ thể qua webcam (MediaPipe Pose). Fallback: Space / click chuột.

## Stack & lệnh hay dùng
- **Mở game**: cần HTTP server (không dùng `file://`): `python -m http.server 8080` hoặc Live Server (VS Code)
- **Không có build step** — vanilla HTML/CSS/JS, không npm, không bundler
- **Không có test runner** — kiểm tra thủ công trên trình duyệt

## Cấu trúc thư mục
```
index.html          # Entry point, load CDN MediaPipe, mount canvas + video
style.css           # Dark theme, canvas centered, webcam preview góc phải dưới
js/
  main.js           # Bootstrap: khởi tạo tất cả managers, wire CV → game
  game.js           # Game loop (requestAnimationFrame), state machine, collision
  dino.js           # Player: physics, jump, pixel-art render, leg animation
  obstacle.js       # ObstacleManager: 3 loại cactus, spawn theo score
  ground.js         # Scrolling terrain, export GROUND_TOP = 240
  cloud.js          # CloudManager: parallax cloud (speed × 0.3)
  score.js          # ScoreManager: delta×10/frame, localStorage HI score
  cv-controller.js  # MediaPipe Pose: webcam, calibrate 30 frames, jump detect
tasks/
  todo.md           # Plan hiện tại (luôn cập nhật khi có task mới)
```

## Convention bắt buộc
- **Naming**: Class = PascalCase, method = camelCase, private = `_prefix`, hằng = UPPER_SNAKE_CASE
- **Module**: ES6 import/export, mỗi subsystem 1 file
- **Canvas**: pixel-art bằng rectangle (không dùng ảnh PNG), context `ctx` truyền vào render()
- **Physics**: dùng `delta` (giây) cho mọi tính toán — tránh frame-rate dependency
- **Commit**: conventional commits: `feat/fix/refactor/test/docs`

## Hằng số quan trọng
| Hằng | Giá trị | Ý nghĩa |
|------|---------|---------|
| `GROUND_TOP` | 240 | Y mặt đất (export từ ground.js) |
| `GRAVITY` | 1800 px/s² | Trọng lực |
| `JUMP_THRESHOLD` | 0.08 | % frame height để kích hoạt nhảy (CV) |
| `COOLDOWN_MS` | 500 | ms giữa 2 lần nhảy (CV) |
| Canvas | 800×300 px | Kích thước cố định |
| Speed range | 6 → 13 px/frame | Tăng theo `score/200` |

## API công khai giữa các module
- `game.triggerJump()` — CV controller gọi khi phát hiện cử chỉ nhảy
- `game.start()` / `game.restart()` / `game.gameOver()`
- `dino.jump(speed)` — chỉ hoạt động khi `onGround === true` và `!dead`
- `score.getScore()` / `score.getHi()` / `score.reset()`

## Quy tắc TUYỆT ĐỐI
- KHÔNG thêm npm package hay bundler — zero build step là yêu cầu thiết kế
- KHÔNG hardcode path CDN vào logic JS — CDN chỉ ở index.html
- KHÔNG sửa cv-controller.js mà không test webcam thực tế trước
- Đọc file trước khi kết luận — không suy đoán
- Luôn dùng `delta` trong physics, không dùng frame counter cố định

## Cạm bẫy đã biết
- MediaPipe Pose cần CDN load xong trước khi `cv.start()` — đã xử lý bằng CDN script trong index.html
- `file://` protocol sẽ block ES6 module import và webcam API — bắt buộc dùng HTTP server
- Canvas HiDPI: game.js scale theo `devicePixelRatio` để không bị mờ trên Retina
- Obstacle hitbox cố tình rộng hơn sprite 4px (giống Chrome Dino gốc) — đừng "fix"

## Workflow làm việc
Mọi task đều theo 4 pha: **Explore → Plan → Code → Commit**
1. Đọc file liên quan, tóm tắt tình trạng hiện tại
2. Viết plan vào `tasks/todo.md`, DỪNG chờ duyệt
3. Code sau khi được duyệt, từng bước nhỏ
4. Commit với message rõ ràng (conventional commits)
