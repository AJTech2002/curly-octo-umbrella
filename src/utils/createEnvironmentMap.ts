import * as THREE from 'three/webgpu';

export function createEnvironmentMap(): THREE.CubeTexture {
    const cubeTextureLoader = new THREE.CubeTextureLoader();

    return cubeTextureLoader.load([
        new URL('../assets/imgs/skybox/px.png', import.meta.url).href,
        new URL('../assets/imgs/skybox/nx.png', import.meta.url).href,
        new URL('../assets/imgs/skybox/py.png', import.meta.url).href,
        new URL('../assets/imgs/skybox/ny.png', import.meta.url).href,
        new URL('../assets/imgs/skybox/pz.png', import.meta.url).href,
        new URL('../assets/imgs/skybox/nz.png', import.meta.url).href,
    ]);
}
