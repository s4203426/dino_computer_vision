# Dino Computer Vision Game

## Dự án này là gì
Game Dino giống Chrome, chạy trên browser (desktop only). Người chơi nhảy thật trước webcam → MediaPipe Pose detect → dino nhảy. Thuần HTML/CSS/JS, không framework, deploy static.

## Stack & cấu trúc
- Không build tool, không bundler — ES modules thẳng trên browser
- Canvas API để render (không dùng ảnh, vẽ bằng code)
- MediaPipe Pose JS load từ CDN

```
index.html / style.css
js/
  main.js          # Entry point
  game.js          # Game loop + state machine (WAITING/PLAYING/GAMEOVER)
  dino.js          # Dino physics + animation
  obstacle.js      # Cactus spawn + collision
  ground.js        # Scrolling ground
  cloud.js         # Background clouds
  score.js         # Score + HI localStorage
  cv-controller.js # MediaPipe webcam + jump detection
```

## Chạy local
Cần HTTP server (không mở file:// trực tiếp vì ES modules):
```
npx serve .
# hoặc
python -m http.server 8080
```

## Convention
- Không có build step — sửa file là chạy được ngay
- GROUND_TOP = 240 (y mặt đất trên canvas 800×300)
- game.triggerJump() là API duy nhất CV controller gọi vào game

## Quy tắc tuyệt đối
- Không thêm npm dependency hay bundler
- Không sửa cv-controller.js nếu chưa test webcam
- Đọc file trước khi kết luận về code
