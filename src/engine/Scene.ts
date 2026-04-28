import * as THREE from 'three/webgpu';
import GameObject from './GameObject.js';
import type Renderer from './Renderer.js';
import type { Object3D } from 'three/src/Three.WebGPU.Nodes.js';
import { findAll, findFirst } from './utils/SceneUtils.js';

export default abstract class GameScene extends THREE.Scene {
    public readonly camera: THREE.PerspectiveCamera;
    protected gameObjects: GameObject[] = [];
    protected started = false;
    public renderer?: Renderer;
    public input: {
        mouse: THREE.Vector2;
        raycaster: THREE.Raycaster;
    } = {
            mouse: new THREE.Vector2(),
            raycaster: new THREE.Raycaster()
        }


    constructor() {
        super();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        window.addEventListener('mousemove', (event) => {
            this.input.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.input.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        });

        window.addEventListener('mousedown', (event) => {
            this.input.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.input.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        });

        window.addEventListener('touchstart', (event) => {
            if (event.touches.length > 0) {
                const touch = event.touches[0];

                if (!touch) {
                    return;
                }

                this.input.mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
                this.input.mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
            }
        });

        window.addEventListener('touchmove', (event) => {
            if (event.touches.length > 0) {
                const touch = event.touches[0];

                if (!touch) {
                    return;
                }

                this.input.mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
                this.input.mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
            }

            event.preventDefault();
        });
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
        window.scene = this;
    }

    update(dt: number): void {
        for (const gameObject of this.gameObjects) {
            gameObject.update(dt);
        }
    }

    add(...object: THREE.Object3D[]): this {
        super.add(...object);
        for (const obj of object) {
            if (obj instanceof GameObject) {
                this.gameObjects.push(obj);
                if (this.started) {
                    obj.start();
                }
            }
        }
        return this;
    }


    remove(...object: Object3D[]): this {
        super.remove(...object);
        for (const obj of object) {
            if (obj instanceof GameObject) {
                const index = this.gameObjects.indexOf(obj);
                if (index !== -1) {
                    this.gameObjects.splice(index, 1);
                }
            }
        }
        return this;
    }

    findAll<T extends Object3D>(type: string) {
        return findAll<T>(type, this);
    }

    findFirst<T extends Object3D>(type: string): T | null {
        const result = findFirst<T>(type, this);
        if (!result) {
            console.warn(`No object of type ${type} found in the scene.`);
        }
        return result;
    }

}
