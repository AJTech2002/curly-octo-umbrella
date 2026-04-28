import * as THREE from "three";



const debugObjects: { mesh: THREE.Object3D; expiry: number }[] = [];

function tickDebugObjects() {
    const now = performance.now();
    for (let i = debugObjects.length - 1; i >= 0; i--) {
        const cur = debugObjects[i];
        if (cur)
            if (now >= cur.expiry) {
                window.scene.remove(cur.mesh);
                debugObjects.splice(i, 1);
            }
    }
    requestAnimationFrame(tickDebugObjects);
}
tickDebugObjects();

function addDebugObject(mesh: THREE.Object3D, duration: number) {
    window.scene.add(mesh);
    debugObjects.push({ mesh, expiry: performance.now() + duration * 1000 });
}

export function DebugDrawLine(
    start: THREE.Vector3 = new THREE.Vector3(0, 0, 0),
    end: THREE.Vector3 = new THREE.Vector3(1, 0, 0),
    color: THREE.ColorRepresentation = 0x00ff00,
    duration: number = 1
): void {
    const material = new THREE.LineBasicMaterial({ color });
    const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
    const line = new THREE.Line(geometry, material);
    addDebugObject(line, duration);
}

export function DrawDebugRay(
    origin: THREE.Vector3 = new THREE.Vector3(0, 0, 0),
    direction: THREE.Vector3 = new THREE.Vector3(1, 0, 0),
    length: number = 1,
    color: THREE.ColorRepresentation = 0xffff00,
    duration: number = 1
): void {
    const end = new THREE.Vector3().addVectors(origin, direction.clone().normalize().multiplyScalar(length));
    DebugDrawLine(origin, end, color, duration);
}

export function DebugDrawSphere(
    position: THREE.Vector3 = new THREE.Vector3(0, 0, 0),
    radius: number = 0.5,
    color: THREE.ColorRepresentation = 0xff0000,
    duration: number = 1
): void {
    const geometry = new THREE.SphereGeometry(radius, 8, 8);
    const material = new THREE.MeshBasicMaterial({ color, wireframe: true });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    addDebugObject(mesh, duration);
}

export function DebugDrawCube(
    position: THREE.Vector3 = new THREE.Vector3(0, 0, 0),
    size: THREE.Vector3 = new THREE.Vector3(1, 1, 1),
    color: THREE.ColorRepresentation = 0x0000ff,
    duration: number = 1
): void {
    const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    const material = new THREE.MeshBasicMaterial({ color, wireframe: true });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    addDebugObject(mesh, duration);
}