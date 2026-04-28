
import { SplashScreen } from '@capacitor/splash-screen';
import Renderer from './engine/Renderer.js';
import TestScene from './scenes/test/TestScene.js';

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <style src="./css/style.css"></style>

  <!-- FONTS -->
  <style>
  @import url('https://fonts.googleapis.com/css2?family=Monoton&display=swap');
  </style>

  <div id="app-container">
    <canvas id="canvas" ref={canvasRef}></canvas>
    <h1 id="titleCard" class="monoton-regular">MASKING TEST</h1>
  </div>
`;

const canvasRef = document.getElementById("canvas") as HTMLCanvasElement;

const testScene = new TestScene();
const renderer = new Renderer(canvasRef, testScene);
renderer.start();

SplashScreen.hide();