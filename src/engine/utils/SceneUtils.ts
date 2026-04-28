import type { Object3D } from "three";
import type GameScene from "../Scene.js";

export function findAll<T extends Object3D>(type: string, start: Object3D): T[] {
    const result: T[] = [];
    function traverse(object: Object3D): void {
        if (object.type === type) {
            result.push(object as T);
        }
        for (const child of object.children) {
            traverse(child);
        }
    }

    traverse(start);
    return result;
}

export function findFirst<T extends Object3D>(type: string, start: Object3D): T | null {
    let result: T | null = null;
    function traverse(object: Object3D): void {
        if (object.type === type) {
            result = object as T;
            return;
        }
        for (const child of object.children) {
            traverse(child);
            if (result) return;
        }
    }

    traverse(start);
    return result;
}