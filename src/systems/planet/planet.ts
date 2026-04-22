import GameObject from "../../engine/GameObject.js";
import type GameScene from "../../engine/Scene.js";
import * as THREE from 'three/webgpu';
import PlanetFace from "./planetFace.js";
import { SimplexNoise } from "three/examples/jsm/math/SimplexNoise.js";

interface PlanetSettings {
    resolution: number;

    // noise settings
    noiseStrength: number;
    numLayers: number;
    baseRoughness: number;
    roughness: number;
    persistence: number;
    center: THREE.Vector3;
    minValue: number;
}

export default class Planet extends GameObject {

    private faces: PlanetFace[] = [];
    public noise: SimplexNoise = new SimplexNoise();
    public readonly settings: PlanetSettings = {
        resolution: 40,
        noiseStrength: 0.2,
        numLayers: 5,
        baseRoughness: 1,
        roughness: 2,
        persistence: 0.5,
        center: new THREE.Vector3(0, 0, 0),
        minValue: 1.2
    };

    private readonly directions = [
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0, -1, 0),
        new THREE.Vector3(1, 0, 0),
        new THREE.Vector3(-1, 0, 0),
        new THREE.Vector3(0, 0, 1),
        new THREE.Vector3(0, 0, -1)
    ];

    private elapsedTime = 0;

    constructor(scene: GameScene, settings?: Partial<PlanetSettings>) {
        super(scene);

        this.settings = { ...this.settings, ...settings };

        const resolution = this.settings.resolution;
        for (const dir of this.directions) {
            this.faces.push(new PlanetFace(scene, resolution, dir, this));
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