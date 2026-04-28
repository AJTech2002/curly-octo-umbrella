import GameObject from "../../engine/GameObject.js";
import type GameScene from "../../engine/Scene.js";
import * as THREE from 'three/webgpu';
import PlanetFace from "./planetFace.js";
import { SimplexNoise } from "three/examples/jsm/math/SimplexNoise.js";
import { DrawDebugRay, DebugDrawLine } from "../../engine/utils/DebugUtils.js";

export interface PlanetSettings {
    resolution: number;

    // noise settings
    noiseStrength: number;
    numLayers: number;
    baseRoughness: number;
    roughness: number;
    persistence: number;
    center: THREE.Vector3;
    minValue: number;
    maxValue: number;
}

export default class Planet extends GameObject {

    private faces: PlanetFace[] = [];
    public noise: SimplexNoise = new SimplexNoise();
    public settings: PlanetSettings = {
        resolution: 100,
        noiseStrength: 0.36,
        numLayers: 3,
        baseRoughness: 0.6,
        roughness: 2,
        persistence: 0.5,
        center: new THREE.Vector3(0, 0, 0),
        minValue: 1.25,
        maxValue: 1.45,
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

        this.buildFaces();
    }

    private calculatePointOnPlanet(point: THREE.Vector3): THREE.Vector3 {
        let noiseValue = 0;
        let frequency = this.settings.baseRoughness;
        let amplitude = 1;

        for (let i = 0; i < this.settings.numLayers; i++) {
            const v = point.clone().multiplyScalar(frequency).add(this.settings.center);
            const n = this.noise.noise3d(v.x, v.y, v.z) * 0.5 + 0.5;
            noiseValue += n * amplitude;

            frequency *= this.settings.roughness;
            amplitude *= this.settings.persistence;
        }

        let final = point.clone().multiplyScalar(1 + noiseValue * this.settings.noiseStrength);
        if (final.length() < this.settings.minValue) {
            final = final.normalize().multiplyScalar(this.settings.minValue);
        }
        return final;
    }

    private buildFaces(): void {
        const resolution = this.settings.resolution;
        for (const dir of this.directions) {
            this.faces.push(new PlanetFace(this.getScene(), resolution, dir, this));
        }

        for (const face of this.faces) {
            this.add(face);
        }
    }

    public rebuild(): void {
        for (const face of this.faces) {
            face.dispose();
            this.remove(face);
        }

        this.faces = [];
        this.gameObjects = [];
        this.buildFaces();
    }

    public start(): void {
        super.start();
    }


    public update(dt: number): void {
        super.update(dt);
        this.elapsedTime += dt;
        // this.rotateX(0.2 * dt);
        // this.rotateY(0.5 * dt);
        // this.position.y = Math.sin(this.elapsedTime * 0.5) * 0.1;

        const mouse = this.getScene().input.mouse;
        const raycaster = this.getScene().input.raycaster;
        raycaster.setFromCamera(mouse, this.getScene().activeCamera);
        const intersects = raycaster.intersectObjects(this.faces, true);

        const closest = intersects[0];
        if (closest !== undefined) {
            const dir = closest.point.normalize();

            // Build a tangent frame at the hit point
            const tangentA = new THREE.Vector3();
            if (Math.abs(dir.x) < 0.9) {
                tangentA.set(1, 0, 0);
            } else {
                tangentA.set(0, 1, 0);
            }
            tangentA.cross(dir).normalize();
            const tangentB = dir.clone().cross(tangentA).normalize();

            // Rotate dir outward by this angle to set the size of the square
            const angle = 0.1;

            // 4 diagonal corners: (+A+B), (+A-B), (-A+B), (-A-B)
            const diagonal = tangentA.clone().add(tangentB).normalize();
            const diagonal2 = tangentA.clone().sub(tangentB).normalize();
            const p1 = dir.clone().applyAxisAngle(diagonal, angle).normalize();
            const p2 = dir.clone().applyAxisAngle(diagonal.clone().negate(), angle).normalize();
            const p3 = dir.clone().applyAxisAngle(diagonal2, angle).normalize();
            const p4 = dir.clone().applyAxisAngle(diagonal2.clone().negate(), angle).normalize();

            // DrawDebugRay(closest.point, p1, 0.4, 0xffff00, 0);
            // DrawDebugRay(closest.point, p2, 0.4, 0xff0000, 0);
            // DrawDebugRay(closest.point, p3, 0.4, 0x0000ff, 0);
            // DrawDebugRay(closest.point, p4, 0.4, 0x00ff00, 0);

            DebugDrawLine(this.calculatePointOnPlanet(p1), this.calculatePointOnPlanet(p1).add(p1.clone().multiplyScalar(0.2)), 0xffff00, 0);
            DebugDrawLine(this.calculatePointOnPlanet(p2), this.calculatePointOnPlanet(p2).add(p2.clone().multiplyScalar(0.2)), 0xff0000, 0);
            DebugDrawLine(this.calculatePointOnPlanet(p3), this.calculatePointOnPlanet(p3).add(p3.clone().multiplyScalar(0.2)), 0x0000ff, 0);
            DebugDrawLine(this.calculatePointOnPlanet(p4), this.calculatePointOnPlanet(p4).add(p4.clone().multiplyScalar(0.2)), 0x00ff00, 0);
        }

    }
}