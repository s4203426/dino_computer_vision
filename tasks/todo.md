# Plan: Tích hợp Computer Vision vào Flappy Bird

## Mục tiêu
Khi người chơi nhảy trước webcam, chim sẽ nhảy. Fallback: Space/click vẫn hoạt động.

## Definition of Done
- [ ] Webcam preview hiển thị góc phải dưới (flip ngang)
- [ ] Hiện "Đang hiệu chỉnh..." trong 30 frame đầu
- [ ] Nhảy người → chim nhảy (cooldown 500ms)
- [ ] Nếu từ chối webcam hoặc MediaPipe lỗi → fallback im lặng, game vẫn chơi được
- [ ] Space/click vẫn hoạt động song song với CV

---

## Logic CV (tái sử dụng từ dino/cv-controller.js)
- MediaPipe Pose theo dõi `lm[11]` (vai trái) + `lm[12]` (vai phải)
- Calibrate 30 frame đầu → tính `baseline = avg(shoulderY)`
- Mỗi frame: `drop = baseline - shoulderY`
- Nếu `drop > 0.08` (vai di chuyển lên 8% chiều cao frame) → trigger jump
- Cooldown 500ms giữa 2 lần nhảy

---

## Files cần thay đổi

### 1. `flappy-bird-cv.js` (tạo mới)
- Class `CVController` (không dùng ES6 export — file này load bằng `<script src>`)
- Constructor nhận `(videoEl, onJump)`
- `start()`: xin quyền webcam, khởi MediaPipe Pose
- `_onResults()`: calibrate → detect jump → gọi `onJump()`
- Graceful fallback: catch tất cả lỗi, chỉ log warning

### 2. `flappy-bird.html` (sửa)
- Thêm 2 CDN scripts **trước** `flappy-bird.js`:
  - `https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js`
  - `https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js`
- Thêm `<video id="webcam" playsinline>` (ẩn)
- Thêm `<div id="cam-wrap"><span>CAM</span></div>` (preview overlay)
- Thêm `<script src="flappy-bird-cv.js">` sau `flappy-bird.js`

### 3. `flappy-bird.css` (sửa)
- `#webcam`: 160×120px, flip ngang (`scaleX(-1)`), bo góc
- `#cam-wrap`: fixed bottom-right, chứa video + label "CAM"
- `.calibrating`: text "Đang hiệu chỉnh..." hiện lên trên preview
- Ẩn `#webcam` bằng `visibility: hidden` khi chưa ready (giữ layout)

### 4. `flappy-bird.js` (sửa nhỏ)
- Expose hàm `window.cvJump = function() { if (state === 'PLAYING') bird.jump(); }`
- CV chỉ trigger jump khi đang chơi (không start game từ gesture)

---

## Thứ tự implement
1. Tạo `flappy-bird-cv.js`
2. Sửa `flappy-bird.js` — thêm `window.cvJump`
3. Sửa `flappy-bird.html` — thêm CDN + video + script
4. Sửa `flappy-bird.css` — thêm webcam preview styles
