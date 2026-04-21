import { Object3D } from "three";
import type GameScene from "./Scene.js";


export default class GameObject extends Object3D {

    public gameObjects: GameObject[] = [];
    protected started = false;

    constructor(scene: GameScene) {
        super();
    }

    public update(dt: number): void {
        for (const gameObject of this.gameObjects) {
            gameObject.update(dt);
        }
    }

    public start(): void {
        for (const gameObject of this.gameObjects) {
            gameObject.start();
        }
        this.started = true;
    }

    public addGameObject(gameObject: GameObject): void {
        this.add(gameObject);
        if (this.started) {
            gameObject.start();
        }
        this.gameObjects.push(gameObject);
    }

}