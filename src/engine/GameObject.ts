import { Object3D } from "three";
import type GameScene from "./Scene.js";
import { findAll, findFirst } from "./utils/SceneUtils.js";


export default class GameObject extends Object3D {

    public gameObjects: GameObject[] = [];
    protected started = false;
    protected scene: GameScene;
    public override type: string = "GameObject";

    constructor(scene: GameScene) {
        super();
        this.scene = scene;
    }

    protected getScene(): GameScene {
        return this.scene;
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

    add(...object: Object3D[]): this {
        super.add(...object);
        for (const obj of object) {
            if (obj instanceof GameObject) {
                this.gameObjects.push(obj);
                if (this.started) {
                    obj.start();
                }
            }
        }
        return this;
    }

    findAll<T extends Object3D>(type: string) {
        return findAll<T>(type, this);
    }

    findFirst<T extends Object3D>(type: string): T | null {
        const result = findFirst<T>(type, this);
        if (!result) {
            console.warn(`No object of type ${type} found in the scene.`);
        }
        return result;
    }

    remove(...object: Object3D[]): this {
        super.remove(...object);
        for (const obj of object) {
            if (obj instanceof GameObject) {
                const index = this.gameObjects.indexOf(obj);
                if (index !== -1) {
                    this.gameObjects.splice(index, 1);
                }

                if (this.started) {
                    obj.started = false;
                }
            }
        }
        return this;
    }

    dispose() {
        for (const gameObject of this.gameObjects) {
            gameObject.dispose();
        }
        this.gameObjects = [];
        this.scene = null as any;
    }

    private addGameObject(gameObject: GameObject): void {
        if (this.started) {
            gameObject.start();
        }
        this.gameObjects.push(gameObject);
    }

}