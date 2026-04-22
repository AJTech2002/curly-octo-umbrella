import { GUI } from 'dat.gui';
import Planet from '../systems/planet/planet.js';

export default class SettingsGUI {
    private readonly gui: GUI;
    private readonly planet: Planet;

    constructor(planet: Planet) {
        this.planet = planet;
        this.gui = new GUI();

        this.createPlanetFolder();
    }

    private createPlanetFolder(): void {
        const planetFolder = this.gui.addFolder('Planet');
        const centerFolder = planetFolder.addFolder('Center');
        const settings = this.planet.settings;

        this.addRebuildController(planetFolder, settings, 'resolution', 2, 256, 1);
        this.addRebuildController(planetFolder, settings, 'noiseStrength', 0, 2, 0.01);
        this.addRebuildController(planetFolder, settings, 'numLayers', 1, 10, 1);
        this.addRebuildController(planetFolder, settings, 'baseRoughness', 0.1, 10, 0.1);
        this.addRebuildController(planetFolder, settings, 'roughness', 0.1, 10, 0.1);
        this.addRebuildController(planetFolder, settings, 'persistence', 0, 1, 0.01);
        this.addRebuildController(planetFolder, settings, 'minValue', 0.1, 3, 0.01);

        this.addRebuildController(centerFolder, settings.center, 'x', -5, 5, 0.01);
        this.addRebuildController(centerFolder, settings.center, 'y', -5, 5, 0.01);
        this.addRebuildController(centerFolder, settings.center, 'z', -5, 5, 0.01);

        planetFolder.open();
    }

    private addRebuildController<T extends object, K extends keyof T>(
        folder: GUI,
        target: T,
        property: K,
        min: number,
        max: number,
        step: number,
    ): void {
        folder
            .add(target, property as string, min, max, step)
            .onFinishChange(() => this.planet.rebuild());
    }
}