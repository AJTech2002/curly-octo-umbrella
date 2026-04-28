import { SimplexNoise } from "three/examples/jsm/Addons.js";
import GameObject from "../../engine/GameObject.js";
import type GameScene from "../../engine/Scene.js";
import * as THREE from "three/webgpu";
import type Planet from "./planet.js";
import { assign, attribute, color, distance, float, floor, Fn, If, length, max, min, mix, normalLocal, normalWorld, positionLocal, positionWorld, pow, rand, sin, time, vec3, vec4, clamp, smoothstep, dot, shadow, normalize, modelViewMatrix, abs, mx_noise_float } from "three/tsl";
import type { ConstNode, VarNode, Vector4 } from "three/webgpu";
import { mx_perlin_noise_float } from "three/src/nodes/materialx/lib/mx_noise.js";

export default class PlanetFace extends GameObject {

    private mesh: THREE.Mesh | undefined;
    private resolution: number;
    private localUp: THREE.Vector3;
    private axisA: THREE.Vector3;
    private axisB: THREE.Vector3;
    private planet: Planet;
    private material: THREE.MeshStandardNodeMaterial | undefined;

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

    }

    private calculatePointOnPlanet(unitSpherePoint: THREE.Vector3, clamp: boolean): THREE.Vector3 {
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

        let perc = (this.planet.settings.maxValue - this.planet.settings.minValue) / (final.length() - this.planet.settings.minValue);
        if (clamp) {
            if (final.length() < this.planet.settings.minValue) {
                final = final.normalize().multiplyScalar(this.planet.settings.minValue);
            } else if (final.length() > this.planet.settings.maxValue) {
                final = final.normalize().multiplyScalar(this.planet.settings.maxValue);
            }
        } else {
            if (final.length() < this.planet.settings.minValue) {
                final = final.normalize().multiplyScalar(this.planet.settings.minValue);
            } else if (final.length() > this.planet.settings.maxValue) {
                final = final.normalize().multiplyScalar(this.planet.settings.maxValue);
            }
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
        const colors: number[] = [];

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

                var pointOnUnitSphere = this.calculatePointOnPlanet(pointOnUnitCube.clone().normalize(), true);
                var unclampedPoint = this.calculatePointOnPlanet(pointOnUnitCube.clone().normalize(), false);
                var unclampedLength = unclampedPoint.length();

                if (unclampedLength > this.planet.settings.minValue) {
                    unclampedLength = this.planet.settings.minValue;
                }

                unclampedLength = (unclampedLength - 1) / (this.planet.settings.minValue - 1);

                vertices[i * 3] = pointOnUnitSphere.x;
                vertices[i * 3 + 1] = pointOnUnitSphere.y;
                vertices[i * 3 + 2] = pointOnUnitSphere.z;

                colors[i * 3] = unclampedLength;
                colors[i * 3 + 1] = unclampedLength;
                colors[i * 3 + 2] = unclampedLength;

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
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.computeVertexNormals();
        geometry.computeBoundingBox();

        // const material = new THREE.MeshNormalMaterial({ color: 0x88ccff, side: THREE.DoubleSide, wireframe: false, wireframeLinewidth: 10 });
        // const material = new THREE.MeshStandardMaterial({ color: 0x88ccff, side: THREE.DoubleSide, wireframe: false });




        this.material = new THREE.MeshStandardNodeMaterial({
            fragmentNode: this.planetShader(),
            positionNode: Fn(() => {
                const height = length(positionLocal);
                const minH = float(this.planet.settings.minValue);
                const maxH = float(this.planet.settings.maxValue);
                const h01 = clamp(height.sub(minH).div(maxH.sub(minH)), 0.0, 1.0).toVar();

                const waterLevel = float(0.4);
                const sandWidth = float(0.05);
                const sandStart = waterLevel.sub(sandWidth);

                const finalPosition = positionLocal.toVar();

                // NOISE PARAMETERS
                const noiseScale = float(2.0);    // Size of the waves
                const noiseSpeed = time.mul(0.2); // How fast they move
                const waveStrength = float(0.05); // Maximum wave height

                // Calculate 3D noise based on position + time
                const noisePos = positionLocal.mul(noiseScale).add(noiseSpeed);
                const noiseVal = mx_noise_float(noisePos);

                // Masking: only apply noise below the sand line, tapering off at the shoreline
                const waveMask = clamp(float(1.0).sub(h01.div(sandStart)), 0.0, 1.0);
                const wave = noiseVal.mul(waveStrength).mul(waveMask);

                // Displace along the normal
                finalPosition.assign(positionLocal.sub(normalLocal.mul(wave)));

                return finalPosition;
            })(),
            lights: true,
        });




        this.mesh = new THREE.Mesh(geometry, this.material);
        this.add(this.mesh);
        this.material.needsUpdate = true;
    }


    private planetShader(): Node<"vec4"> {
        const light = this.scene.findFirst<THREE.DirectionalLight>("DirectionalLight");

        return Fn(() => {
            if (!light) return vec4(1, 0, 0, 1);

            // const lightDir = vec3(light.position.x, light.position.y, light.position.z).normalize();
            // lighting
            const n = normalLocal.normalize();
            let sideFace = normalWorld.dot(positionWorld.normalize()).pow(3)

            const lightDir = vec3(1, 1, 1).normalize();
            const lightIntensity = max(dot(n, lightDir), 0.2);
            const diffuse = max(sideFace.mul(lightIntensity), 0).toVar();

            // --- HEIGHT (THIS IS THE IMPORTANT FIX) ---
            // Use actual sphere height instead of artificial distance offset
            const height = length(positionLocal);

            // normalize height between min/max planet values
            const minH = float(this.planet.settings.minValue);
            const maxH = float(this.planet.settings.maxValue);

            const h01 = clamp((height.sub(minH)).div(maxH.sub(minH)), 0.0, 1.0).toVar();

            // --- COLORS (Sebastian Lague style) ---
            const deepOcean = vec3(0.0, 0.05, 0.2);
            const shallowOcean = vec3(0.1, 0.3, 0.6);
            const land = vec3(0.15, 0.5, 0.1);
            const mountain = vec3(0.5, 0.5, 0.5);
            const snow = vec3(1.0, 1.0, 1.0);
            const sand = vec3(0.76, 0.7, 0.5);
            const waterLevel = float(0.4);
            const sandWidth = float(0.05);
            const mountainFactor = smoothstep(0.6, 0.8, h01);
            const snowFactor = smoothstep(0.8, 1.0, h01);

            // define boundaries
            const sandStart = waterLevel.sub(sandWidth);
            const sandEnd = waterLevel.add(sandWidth);

            // ocean → sand transition
            const oceanToSand = smoothstep(sandStart, waterLevel, h01);

            // sand → land transition
            const sandToLand = smoothstep(waterLevel, sandEnd, h01);

            // base ocean (ONLY below sandStart)
            let col = mix(deepOcean, shallowOcean, clamp(h01.div(sandStart), 0.0, 1.0));

            // blend into sand ONLY in the band
            col = mix(col, sand, oceanToSand);

            // then into land AFTER sand
            col = mix(col, land, sandToLand);

            // higher terrain stays the same
            col = mix(col, mountain, mountainFactor);
            col = mix(col, snow, snowFactor);

            // lighting (simple and clean)
            const finalColor = col.mul(diffuse.add(0.1)); // small ambient

            return vec4(finalColor.x, finalColor.y, finalColor.z, 1);
        })();
    }

    public start(): void {
        super.start();
        this.constructMesh();

    }

    public update(dt: number): void {
        super.update(dt);
        if (this.material) {
            this.material.needsUpdate = true;
        }
    }



}