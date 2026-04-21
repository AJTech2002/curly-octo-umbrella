import GameObject from "../../engine/GameObject.js";
import type GameScene from "../../engine/Scene.js";
import * as THREE from 'three/webgpu';

export default class Planet extends GameObject {

    private readonly cube: THREE.Mesh;
    private elapsedTime = 0;

    constructor(scene: GameScene) {
        super(scene);

        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshStandardMaterial({
            color: 0x00ff00,
            metalness: 0.8,
            roughness: 0.2,
            envMapIntensity: 1.0,
        });

        this.cube = new THREE.Mesh(geometry, material);
        this.add(this.cube);
    }

    public start(): void {
        super.start();
    }

    public update(dt: number): void {
        super.update(dt);
        this.elapsedTime += dt;

        this.cube.rotation.x += 0.6 * dt;
        this.cube.rotation.y += 0.6 * dt;

        const pulse = Math.sin(this.elapsedTime) * 0.5 + 1;
        this.cube.scale.set(pulse, pulse, pulse);
    }
}