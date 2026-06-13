# PLAN: Dino Computer Vision Game

## Bối cảnh
Game Dino giống Chrome, chạy trên browser (desktop only). Người chơi nhảy thật qua webcam → MediaPipe detect → dino nhảy. Thuần HTML/CSS/JS, deploy static.

## Definition of Done
- [ ] Game chạy: dino chạy, cactus xuất hiện, va chạm → game over, restart được
- [ ] Webcam detect nhảy → dino nhảy (không cần phím Space)
- [ ] Space/click vẫn là fallback nếu webcam bị từ chối
- [ ] HI score lưu localStorage, hiển thị đúng format "HI 00052 00019"
- [ ] Tốc độ tăng dần theo score
- [ ] Giao diện pixel/8-bit đen trắng như Chrome
- [ ] Không lỗi console khi chạy bình thường

---

## Cấu trúc file

```
dino_computer_vision/
├── index.html            # Entry point, load MediaPipe CDN
├── style.css             # Layout, canvas centering, webcam overlay
├── js/
│   ├── main.js           # Khởi tạo game + CV, connect 2 module
│   ├── game.js           # Game loop, state machine, render pipeline
│   ├── dino.js           # Dino physics + animation (run/jump/dead)
│   ├── obstacle.js       # Cactus spawn, scroll, object pool
│   ├── ground.js         # Scrolling ground + terrain bumps
│   ├── cloud.js          # Background clouds
│   ├── score.js          # Score counter + HI localStorage
│   └── cv-controller.js  # MediaPipe Pose, webcam, jump detection
└── CLAUDE.md
```

---

## Các bước thực hiện

### Bước 1 — Project skeleton + CLAUDE.md
- [ ] Tạo `index.html`: canvas 800×300, video element ẩn cho webcam, load MediaPipe CDN, load các JS module
- [ ] Tạo `style.css`: body dark background, canvas centered, webcam preview 160×120 ở góc dưới phải
- [ ] Tạo `CLAUDE.md`
- **Test:** Mở index.html, thấy canvas trắng, không lỗi console

### Bước 2 — Game engine core (`game.js`)
- [ ] GameState enum: `WAITING | PLAYING | GAMEOVER`
- [ ] `requestAnimationFrame` loop với delta time
- [ ] Quản lý state, gọi update/render tương ứng
- [ ] Xử lý input: Space → start/jump/restart; click → start/restart
- [ ] Expose `game.triggerJump()` để CV controller gọi vào
- **Test:** Nhấn Space, state chuyển WAITING → PLAYING

### Bước 3 — Ground + Clouds (`ground.js`, `cloud.js`)
- [ ] `ground.js`: vẽ đường ngang + pattern texture lăn theo speed
- [ ] `cloud.js`: spawn cloud ngẫu nhiên bên phải, scroll sang trái, despawn khi ra khỏi màn hình
- **Test:** Mặt đất chạy, mây trôi

### Bước 4 — Dino character (`dino.js`)
- [ ] Vẽ dino bằng Canvas API (không cần ảnh): hình chữ nhật + chi tiết pixel
- [ ] Physics: gravity, jump velocity, land detection
- [ ] Animation: 2 frame chạy (chân xen kẽ 150ms), frame nhảy, frame chết
- [ ] `jump()`: chỉ nhảy được khi đang đứng đất (không double-jump)
- **Test:** Nhấn Space, dino nhảy đúng vật lý, không double-jump

### Bước 5 — Cactus obstacles (`obstacle.js`)
- [ ] 3 loại cactus: nhỏ đơn, lớn đơn, cụm 3
- [ ] Spawn ngẫu nhiên bên phải với interval giảm theo speed
- [ ] Scroll sang trái, despawn khi ra khỏi màn hình
- [ ] Object pool: tái sử dụng object thay vì tạo mới
- **Test:** Cactus xuất hiện đều đặn, không lag

### Bước 6 — Collision detection
- [ ] AABB collision với hitbox nhỏ hơn sprite 4-6px mỗi phía (forgiving như Chrome)
- [ ] Khi va chạm: state → GAMEOVER, dino chuyển frame chết
- **Test:** Va vào cactus → game over

### Bước 7 — Score system (`score.js`)
- [ ] Score tăng theo thời gian (~10 pts/giây ở speed cơ bản)
- [ ] HI score: đọc từ localStorage lúc load, cập nhật khi game over nếu score cao hơn
- [ ] Hiển thị format "HI 00052 00019" ở góc phải trên canvas
- [ ] Flash toàn màn hình trắng 2-3 lần mỗi 100 điểm (milestone blink)
- **Test:** Score tăng, HI score lưu sau khi tắt/mở lại tab

### Bước 8 — Speed scaling
- [ ] Speed bắt đầu ~6px/frame, tăng dần đến max ~13px/frame
- [ ] Spawn interval cactus giảm theo speed
- **Test:** Sau 200 điểm game rõ ràng nhanh hơn

### Bước 9 — Game over + màn hình chờ
- [ ] WAITING: vẽ text "NHẢY LÊN HOẶC NHẤN SPACE ĐỂ BẮT ĐẦU", dino đứng yên
- [ ] GAMEOVER: vẽ "GAME OVER", text "SPACE / NHẢY ĐỂ CHƠI LẠI", score hiện tại
- **Test:** Flow đầy đủ: chờ → chơi → thua → chơi lại

### Bước 10 — CV Controller (`cv-controller.js`)
- [ ] Xin quyền webcam, stream vào `<video>` element
- [ ] Load MediaPipe Pose từ CDN
- [ ] Calibrate: lấy Y baseline của vai (landmark 11, 12) trong 1 giây đầu
- [ ] Detect jump: Y vai giảm > threshold (20% chiều cao frame) → gọi `game.triggerJump()`
- [ ] Cooldown 500ms tránh trigger nhiều lần
- [ ] Nếu webcam bị từ chối: log warning, game vẫn chạy với Space/click
- [ ] Webcam preview 160×120 ở góc dưới phải, có border, label "CAM"
- **Test:** Nhảy thật trước webcam → dino nhảy

---

## Rủi ro & cách xử lý

| Rủi ro | Cách xử lý |
|--------|-----------|
| MediaPipe load chậm (CDN) | Show "Loading CV..." trên canvas, game chờ |
| Webcam bị từ chối | Fallback Space/click, không block game |
| False positive (tay vẫy, nghiêng người) | Threshold + cooldown đủ lớn |
| MediaPipe nặng CPU | Chạy detection mỗi 3 frame thay vì mỗi frame |
| Canvas blur trên màn hình HiDPI | Set devicePixelRatio scale |
