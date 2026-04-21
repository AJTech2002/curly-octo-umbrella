import GameObject from "../../engine/GameObject.js";
import type GameScene from "../../engine/Scene.js";

export default class EmptyGameObject extends GameObject {

    constructor(scene: GameScene) {
        super(scene);
    }

    public start(): void {
        super.start();
    }

    public update(dt: number): void {
        super.update(dt);
    }


}