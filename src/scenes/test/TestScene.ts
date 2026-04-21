import * as THREE from 'three/webgpu';
import GameScene from '../../engine/Scene.js';
import { createEnvironmentMap } from '../../utils/createEnvironmentMap.js';
import Planet from '../../systems/planet/planet.js';

export default class TestScene extends GameScene {
    private elapsedTime = 0;

    private planet: Planet;

    constructor() {
        super();

        this.camera.position.z = 5;

        this.planet = new Planet(this);
    }

    start(): void {
        super.start();
        const environmentMap = createEnvironmentMap();
        this.environment = environmentMap;
        this.background = environmentMap;

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 1, 1).normalize();
        this.add(directionalLight);

        this.addGameObject(this.planet);
    }

    update(dt: number): void {
        super.update(dt);
        this.elapsedTime += dt;
    }
}
