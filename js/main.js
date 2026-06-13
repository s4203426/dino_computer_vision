import { Game } from './game.js';
import { Dino } from './dino.js';
import { ObstacleManager } from './obstacle.js';
import { GroundRenderer } from './ground.js';
import { CloudManager } from './cloud.js';
import { ScoreManager } from './score.js';
import { CVController } from './cv-controller.js';

const canvas = document.getElementById('game-canvas');
const video = document.getElementById('webcam');

const dino = new Dino();
const obstacles = new ObstacleManager();
const ground = new GroundRenderer();
const clouds = new CloudManager();
const score = new ScoreManager();

const game = new Game(canvas, dino, obstacles, ground, clouds, score);

const cv = new CVController(video, () => game.triggerJump());
cv.start();

game.run();
