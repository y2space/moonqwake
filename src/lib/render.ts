import * as THREE from 'three';

import quakes from '$lib/quakedata';

type Quake = {
	type: string;
	long: number;
	lat: number;
	date: number;
};

export function createScene(scene: THREE.Scene) {
	const skyboxTexture = new THREE.TextureLoader().load('/stars.jpg');
	const skyboxGeometry = new THREE.SphereGeometry(10);
	const skyboxMaterial = new THREE.MeshBasicMaterial({ map: skyboxTexture });
	const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
	skybox.material.side = THREE.DoubleSide;
	scene.add(skybox);

	const moonTexture = new THREE.TextureLoader().load(
		'/lroc_color_poles_4k.jpg'
	);
	const moonNormalMap = new THREE.TextureLoader().load('/ldem_16_uint.jpg');
	const moonGeometry = new THREE.SphereGeometry(1, 50, 50);
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

	const axesHelper = new THREE.AxesHelper(5000);
	moon.add(axesHelper);

	quakes.forEach((quake: Quake) => {
		const dotGeometry = new THREE.BufferGeometry();
		const pos = positionToCoordinates(quake.lat, quake.long, 1.2, 0);
		dotGeometry.setAttribute(
			'position',
			new THREE.BufferAttribute(new Float32Array([pos.x, pos.y, pos.z]), 3)
		);
		const dotMaterial = new THREE.PointsMaterial({
			size: 0.1,
			color: 0xff0000,
		});
		const dot = new THREE.Points(dotGeometry, dotMaterial);

		moon.add(dot);
	});

	return {
		light,
		moon,
		skybox,
		axesHelper,
		moonNormalMap,
	};
}

function positionToCoordinates(
	lat: number,
	lon: number,
	rad: number,
	alt: number
) {
	let f = 0;
	let ls = Math.atan((1 - f) ** 2 * Math.tan(lat));

	let x =
		rad * Math.cos(ls) * Math.cos(lon) + alt * Math.cos(lat) * Math.cos(lon);
	let y =
		rad * Math.cos(ls) * Math.sin(lon) + alt * Math.cos(lat) * Math.sin(lon);
	let z = rad * Math.sin(ls) + alt * Math.sin(lat);

	return { x: x, y: y, z: z };
}
