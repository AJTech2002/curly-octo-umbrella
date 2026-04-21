import * as THREE from 'three/webgpu';
import GameScene from './Scene.js';

export default class Renderer {
    public readonly renderer: THREE.WebGPURenderer;
    public readonly scene: GameScene;
    private previousTime = 0;

    constructor(canvas: HTMLCanvasElement, scene: GameScene) {
        this.scene = scene;
        this.renderer = new THREE.WebGPURenderer({ canvas, antialias: true, alpha: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.resize();
    }

    start(): void {
        this.scene.renderer = this;
        this.scene.start();
        this.previousTime = performance.now();
        window.addEventListener('resize', this.handleResize);
        requestAnimationFrame(this.animate);
    }

    private animate = (time: number): void => {
        const dt = (time - this.previousTime) / 1000;
        this.previousTime = time;

        this.scene.update(dt);
        void this.renderer.renderAsync(this.scene, this.scene.activeCamera);

        requestAnimationFrame(this.animate);
    };

    private handleResize = (): void => {
        this.resize();
    };

    private resize(): void {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.renderer.setSize(width, height);
        this.scene.onResize(width / height);
    }
}
