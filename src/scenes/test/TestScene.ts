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

    constructor() {
        super();

        this.camera.position.z = 3.5;

        this.planet = new Planet(this);
    }

    start(): void {
        super.start();
        this.controls = new OrbitControls(this.camera, this.renderer!.renderer.domElement);
        this.controls.enableDamping = true;
        this.settingsGUI = new SettingsGUI(this.planet);

        const environmentMap = createEnvironmentMap();
        this.environment = environmentMap;
        // this.background = environmentMap;

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 1, 1).normalize();
        this.add(directionalLight);

        this.addGameObject(this.planet);
    }

    update(dt: number): void {
        super.update(dt);
        this.controls.update(dt);
        this.elapsedTime += dt;
    }
}
