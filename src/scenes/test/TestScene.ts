import * as THREE from 'three/webgpu';
import GameScene from '../../engine/Scene.js';
import { createEnvironmentMap } from '../../utils/createEnvironmentMap.js';
import Planet from '../../systems/planet/planet.js';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import SettingsGUI from '../../ui/SettingsGUI.js';
export default class TestScene extends GameScene {
    private elapsedTime = 0;

    private planet: Planet;
    private controls!: OrbitControls;
    private settingsGUI!: SettingsGUI;

    private light!: THREE.DirectionalLight;

    constructor() {
        super();

        this.camera.position.z = 4.5;
        // this.camera.position.y = 10


        this.planet = new Planet(this);
    }

    start(): void {
        super.start();
        this.controls = new OrbitControls(this.camera, this.renderer!.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.enablePan = false;
        this.controls.minDistance = 2;
        this.controls.maxDistance = 5;

        // this.settingsGUI = new SettingsGUI(this.planet);

        const environmentMap = createEnvironmentMap();
        this.environment = environmentMap;
        // this.background = environmentMap;

        this.light = new THREE.DirectionalLight(0xffffff, 1);
        this.light.position.set(0, 0, 0).normalize();

        this.add(this.light);
        this.add(this.camera);
        this.add(this.planet);
    }

    // TODO: Pass value as uniform to shader 
    dayCycle() {
        const dayDuration = 2; // Duration of a full day in seconds
        const time = (this.elapsedTime / dayDuration) % 1; // Normalize time to [0, 1]

        // Calculate sun position based on time
        const angle = time * 2 * Math.PI; // Full rotation over a day
        const radius = 10; // Distance of the sun from the planet
        const sunX = radius * Math.cos(angle);
        const sunY = radius * Math.sin(angle);
        const sunZ = 0; // Keep the sun in the X-Y plane

        // Update directional light position
        this.light.position.set(sunX, sunY, sunZ);

        this.light.matrixWorldNeedsUpdate = true;
    }

    update(dt: number): void {
        super.update(dt);
        this.controls.update(dt);
        this.controls.target.set(this.planet.position.x, this.planet.position.y, this.planet.position.z);
        this.elapsedTime += dt;
    }
}
