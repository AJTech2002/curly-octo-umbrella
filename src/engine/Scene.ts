import * as THREE from 'three/webgpu';
import type GameObject from './GameObject.js';

export default abstract class GameScene extends THREE.Scene {
    protected readonly camera: THREE.PerspectiveCamera;
    protected gameObjects: GameObject[] = [];
    protected started = false;

    constructor() {
        super();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    }


    get activeCamera(): THREE.PerspectiveCamera {
        return this.camera;
    }

    onResize(aspect: number): void {
        this.camera.aspect = aspect;
        this.camera.updateProjectionMatrix();
    }

    start(): void {
        for (const gameObject of this.gameObjects) {
            gameObject.start();
        }
        this.started = true;
    }

    update(dt: number): void {
        for (const gameObject of this.gameObjects) {
            gameObject.update(dt);
        }
    }

    addGameObject(gameObject: GameObject): void {
        this.add(gameObject);
        if (this.started) {
            gameObject.start();
        }
        this.gameObjects.push(gameObject);
    }
}
