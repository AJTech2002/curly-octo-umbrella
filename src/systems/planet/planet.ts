import GameObject from "../../engine/GameObject.js";
import type GameScene from "../../engine/Scene.js";
import * as THREE from 'three/webgpu';
import PlanetFace from "./planetFace.js";

export default class Planet extends GameObject {

    private faces: PlanetFace[] = [];
    private readonly directions = [
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0, -1, 0),
        new THREE.Vector3(1, 0, 0),
        new THREE.Vector3(-1, 0, 0),
        new THREE.Vector3(0, 0, 1),
        new THREE.Vector3(0, 0, -1)
    ];

    private elapsedTime = 0;

    constructor(scene: GameScene) {
        super(scene);
        const resolution = 10;
        for (const dir of this.directions) {
            this.faces.push(new PlanetFace(scene, resolution, dir));
        }

        for (const face of this.faces) {
            this.addGameObject(face);
        }
    }

    public start(): void {
        super.start();
    }

    public update(dt: number): void {
        super.update(dt);
        this.elapsedTime += dt;
        this.rotateX(0.2 * dt);
        this.rotateY(0.5 * dt);
    }
}