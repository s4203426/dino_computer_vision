const JUMP_THRESHOLD = 0.08;
const COOLDOWN_MS = 500;
const CALIBRATE_FRAMES = 30;

export class CVController {
  constructor(videoEl, onJump) {
    this.video = videoEl;
    this.onJump = onJump;
    this._baseline = null;
    this._calibrateCount = 0;
    this._calibrateSum = 0;
    this._lastJump = 0;
    this._ready = false;
  }

  async start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.video.srcObject = stream;
      await new Promise((r) => (this.video.onloadedmetadata = r));
      this.video.play();
      this._initPose();
    } catch {
      console.warn('[CV] Webcam không khả dụng, dùng Space/click để chơi.');
    }
  }

  _initPose() {
    if (typeof Pose === 'undefined') {
      console.warn('[CV] MediaPipe Pose chưa load, bỏ qua CV.');
      return;
    }

    const pose = new Pose({
      locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${f}`,
    });

    pose.setOptions({
      modelComplexity: 0,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults((results) => this._onResults(results));

    const camera = new Camera(this.video, {
      onFrame: async () => {
        await pose.send({ image: this.video });
      },
      width: 320,
      height: 240,
    });

    camera.start();
    this._ready = true;
  }

  _onResults(results) {
    if (!results.poseLandmarks) return;

    const lm = results.poseLandmarks;
    const shoulderY = (lm[11].y + lm[12].y) / 2;

    if (this._calibrateCount < CALIBRATE_FRAMES) {
      this._calibrateSum += shoulderY;
      this._calibrateCount++;
      if (this._calibrateCount === CALIBRATE_FRAMES) {
        this._baseline = this._calibrateSum / CALIBRATE_FRAMES;
      }
      return;
    }

    const now = Date.now();
    if (now - this._lastJump < COOLDOWN_MS) return;

    const drop = this._baseline - shoulderY;
    if (drop > JUMP_THRESHOLD) {
      this._lastJump = now;
      this.onJump();
    }
  }
}
