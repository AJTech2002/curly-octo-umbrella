import { SimplexNoise } from "three/examples/jsm/Addons.js";
import GameObject from "../../engine/GameObject.js";
import type GameScene from "../../engine/Scene.js";
import * as THREE from "three/webgpu";
import type Planet from "./planet.js";

export default class PlanetFace extends GameObject {

    private mesh: THREE.Mesh | undefined;
    private resolution: number;
    private localUp: THREE.Vector3;
    private axisA: THREE.Vector3;
    private axisB: THREE.Vector3;
    private planet: Planet;

    constructor(scene: GameScene, resolution: number, localUp: THREE.Vector3, planet: Planet) {
        super(scene);
        this.resolution = resolution;
        this.localUp = localUp;
        this.planet = planet;

        if (Math.abs(localUp.x) < 0.9) {
            this.axisA = new THREE.Vector3(1, 0, 0);
        } else {
            this.axisA = new THREE.Vector3(0, 1, 0);
        }

        this.axisA.cross(this.localUp).normalize();
        this.axisB = new THREE.Vector3()
            .crossVectors(this.localUp, this.axisA)
            .normalize();

        this.constructMesh();
    }

    private calculatePointOnPlanet(unitSpherePoint: THREE.Vector3): THREE.Vector3 {
        let noiseValue = 0;
        let frequency = this.planet.settings.baseRoughness;
        let amplitude = 1;

        for (let i = 0; i < this.planet.settings.numLayers; i++) {
            const v = unitSpherePoint.clone().multiplyScalar(frequency).add(this.planet.settings.center);
            const n = this.planet.noise.noise3d(v.x, v.y, v.z) * 0.5 + 0.5;
            noiseValue += n * amplitude;

            frequency *= this.planet.settings.roughness;
            amplitude *= this.planet.settings.persistence;
        }

        let final = unitSpherePoint.multiplyScalar(1 + noiseValue * this.planet.settings.noiseStrength);
        if (final.length() < this.planet.settings.minValue) {
            final = final.normalize().multiplyScalar(this.planet.settings.minValue);
        }
        return final;
    }

    private constructMesh(): void {
        if (this.mesh) {
            this.remove(this.mesh);
            this.mesh.geometry.dispose();

            const material = this.mesh.material;
            if (Array.isArray(material)) {
                material.forEach((entry) => entry.dispose());
            } else {
                material.dispose();
            }
        }

        const geometry = new THREE.BufferGeometry();
        const vertices: number[] = [];
        const indices: number[] = [];

        let triIndex = 0;

        for (let y = 0; y < this.resolution; y++) {
            for (let x = 0; x < this.resolution; x++) {
                var i = (x + y * this.resolution); // 3 floats (x,y,z)

                var perc = new THREE.Vector2(x, y).multiplyScalar(1 / (this.resolution - 1))
                var pointOnUnitCube = this.localUp.clone()
                    .add(
                        this.axisA.clone()
                            .multiplyScalar(
                                (perc.x - 0.5) * 2
                            )
                    )
                    .add(
                        this.axisB.clone()
                            .multiplyScalar(
                                (perc.y - 0.5) * 2
                            )
                    )

                var pointOnUnitSphere = this.calculatePointOnPlanet(pointOnUnitCube.clone().normalize());

                vertices[i * 3] = pointOnUnitSphere.x;
                vertices[i * 3 + 1] = pointOnUnitSphere.y;
                vertices[i * 3 + 2] = pointOnUnitSphere.z;

                if (x != this.resolution - 1 && y != this.resolution - 1) {
                    indices[triIndex] = i;
                    indices[triIndex + 1] = i + this.resolution + 1;
                    indices[triIndex + 2] = i + this.resolution;

                    indices[triIndex + 3] = i;
                    indices[triIndex + 4] = i + 1;
                    indices[triIndex + 5] = i + this.resolution + 1;
                    triIndex += 6;
                }
            }
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();
        geometry.computeBoundingBox();

        // const material = new THREE.MeshNormalMaterial({ color: 0x88ccff, side: THREE.DoubleSide, wireframe: false, wireframeLinewidth: 10 });
        const material = new THREE.MeshStandardMaterial({ color: 0x88ccff, side: THREE.DoubleSide, wireframe: false });
        this.mesh = new THREE.Mesh(geometry, material);
        this.add(this.mesh);
        material.needsUpdate = true;
    }

    public rebuild(resolution = this.resolution): void {
        this.resolution = resolution;
        this.constructMesh();
    }

    public dispose(): void {
        if (!this.mesh) {
            return;
        }

        this.remove(this.mesh);
        this.mesh.geometry.dispose();

        const material = this.mesh.material;
        if (Array.isArray(material)) {
            material.forEach((entry) => entry.dispose());
        } else {
            material.dispose();
        }

        this.mesh = undefined;
    }

    public start(): void {
        super.start();
    }

    public update(dt: number): void {
        super.update(dt);
    }


}