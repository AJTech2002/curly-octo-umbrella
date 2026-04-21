import GameObject from "../../engine/GameObject.js";
import type GameScene from "../../engine/Scene.js";
import * as THREE from "three/webgpu";

export default class PlanetFace extends GameObject {

    private mesh: THREE.Mesh;
    private resolution: number;
    private localUp: THREE.Vector3;
    private axisA: THREE.Vector3;
    private axisB: THREE.Vector3;

    constructor(scene: GameScene, resolution: number, localUp: THREE.Vector3) {
        super(scene);
        this.resolution = resolution;
        this.localUp = localUp;

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

    private constructMesh(): void {
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

                var pointOnUnitSphere = pointOnUnitCube.clone().normalize();

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

        const material = new THREE.MeshNormalMaterial({ color: 0x88ccff, side: THREE.DoubleSide, wireframe: true, wireframeLinewidth: 10 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.add(this.mesh);
        material.needsUpdate = true;


        console.log(this.mesh);
    }

    public start(): void {
        super.start();
    }

    public update(dt: number): void {
        super.update(dt);
    }


}