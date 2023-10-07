import * as THREE from 'three';

export function createScene(scene: THREE.Scene) {
	const skyboxTexture = new THREE.TextureLoader().load('/stars.jpg');
	const skyboxGeometry = new THREE.SphereGeometry(10);
	const skyboxMaterial = new THREE.MeshBasicMaterial({ map: skyboxTexture });
	const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
	skybox.material.side = THREE.DoubleSide;
	scene.add(skybox);

	const moonTexture = new THREE.TextureLoader().load('/lroc_color_poles_4k.jpg');
	const moonNormalMap = new THREE.TextureLoader().load('/ldem_16_uint.jpg');
	const moonGeometry = new THREE.SphereGeometry();
	const moonMaterial = new THREE.MeshStandardMaterial({
		map: moonTexture,
		normalMap: moonNormalMap,
		normalScale: new THREE.Vector2(4, 4),
	});
	const moon = new THREE.Mesh(moonGeometry, moonMaterial);
	scene.add(moon);

	const light = new THREE.DirectionalLight(0xffffff, 1.4);
	light.position.set(0, 0, 1);
	scene.add(light);

	return {
		light,
		moon,
		skybox,
	};
}
