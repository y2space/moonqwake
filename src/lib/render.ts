import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import quakes, { landers } from '$lib/quakedata';

type Quake = {
	type: string;
	long: number;
	lat: number;
	date: number;
};

export async function createScene(scene: THREE.Scene) {
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
	const moonGeometry = new THREE.SphereGeometry(1, 60, 60);
	const moonMaterial = new THREE.MeshStandardMaterial({
		map: moonTexture,
		normalMap: moonNormalMap,
		normalScale: new THREE.Vector2(4, 4),
	});
	moonMaterial.metalness = 0.1;
	moonMaterial.roughness = 0.5;
	const moon = new THREE.Mesh(moonGeometry, moonMaterial);
	scene.add(moon);

	const light = new THREE.DirectionalLight(0xffffff, 1.4);
	light.position.set(0, 0, 1);
	scene.add(light);

	const axesHelper = new THREE.AxesHelper(5000);
	moon.add(axesHelper);


	const mooninvis = new THREE.SphereGeometry(1.006, 30, 30)
	const moonedges = new THREE.EdgesGeometry(mooninvis, 0.01);
	const moonlines = new THREE.LineSegments(moonedges, new THREE.LineBasicMaterial({color: 0xffffff, linejoin: 'round'}));
	moon.add(moonlines);


	const dots = quakes.map((quake: Quake) => {
		const dotGeometry = new THREE.BufferGeometry();
		const pos = positionToCoordinates(quake.lat, quake.long, 1.03, 0);
		dotGeometry.setAttribute(
			'position',
			new THREE.BufferAttribute(new Float32Array([pos.x, pos.y, pos.z]), 3)
		);
		const dotMaterial = new THREE.PointsMaterial({
			size: 0.01,
			color: 0xffffff,
		});
		const dot = new THREE.Points(dotGeometry, dotMaterial);

		const mesh = text(quake.type, 0.05, 0.05, 100);
		mesh.position.set(pos.x, pos.y + 0.02, pos.z);
		dot.add(mesh);

		dot.visible = false;
		mesh.visible = false;

		dot.add(mesh);
		moon.add(dot);

		return { mesh, dot };
	});

	const landerLoader = new GLTFLoader();
	const landerModel = await new Promise<THREE.Group>(r => landerLoader.load('/models/lunar_lander/scene.gltf', gltf => r(gltf.scene)));

	landerModel.scale.set(0.03, 0.03, 0.03);

	const landerMeshes = landers.map(lander => {
		const pos = positionToCoordinates(lander.lat, lander.long, 1.2, 0);
		const surfacePos = positionToCoordinates(lander.lat, lander.long, 1, 0);

		const landerMesh = landerModel.clone();

		landerMesh.position.set(surfacePos.x, surfacePos.y, surfacePos.z);
		landerMesh.lookAt(0, 0, 0);
		landerMesh.rotateX(Math.PI / 2);

		const mesh = text(lander.type, 0.07, 0.07, 100);
		mesh.position.set(pos.x, pos.y, pos.z);

		moon.add(mesh);
		moon.add(landerMesh);

		return { mesh, landerMesh };
	});

	return {
		light,
		moon,
		skybox,
		axesHelper,
		moonNormalMap,
		dots,
		landerMeshes,
		moonlines,
	};
}

function text(
	text: string,
	hWorldTxt: number,
	hWorldAll: number,
	hPxTxt: number
) {
	const kPxToWorld = hWorldTxt / hPxTxt;
	const hPxAll = Math.ceil(hWorldAll / kPxToWorld);

	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d')!;
	ctx.font = hPxTxt + 'px sans-serif';
	// now get the widths
	const wPxTxt = ctx.measureText(text).width;
	const wWorldTxt = wPxTxt * kPxToWorld;
	const wWorldAll = wWorldTxt + (hWorldAll - hWorldTxt);
	const wPxAll = Math.ceil(wWorldAll / kPxToWorld);

	canvas.width = wPxAll;
	canvas.height = hPxAll;

	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.font = hPxTxt + 'px sans-serif';
	ctx.lineWidth = hPxTxt / 50;
	// offset the line width to be outsid eof the text
	ctx.lineJoin = 'round';

	ctx.fillStyle = 'white';
	ctx.fillText(text, wPxAll / 2, hPxAll / 2);

	const texture = new THREE.Texture(canvas);
	texture.minFilter = THREE.LinearFilter;
	texture.needsUpdate = true;

	const geometry = new THREE.PlaneGeometry(wWorldAll, hWorldAll);
	const material = new THREE.MeshBasicMaterial({
		side: THREE.DoubleSide,
		map: texture,
		transparent: true,
		opacity: 1.0,
	});

	const mesh = new THREE.Mesh(geometry, material);

	mesh.wWorldTxt = wWorldTxt;
	mesh.wWorldAll = wWorldAll;
	mesh.wPxTxt = wPxTxt;

	mesh.wPxAll = wPxAll;
	mesh.hPxAll = hPxAll;
	mesh.ctx = ctx;

	return mesh;
}

function positionToCoordinates(
	lat: number,
	lon: number,
	rad: number,
	alt: number
) {
	const f = 0;
	const ls = Math.atan((1 - f) ** 2 * Math.tan(lat));

	const x =
		rad * Math.cos(ls) * Math.cos(lon) + alt * Math.cos(lat) * Math.cos(lon);
	const y =
		rad * Math.cos(ls) * Math.sin(lon) + alt * Math.cos(lat) * Math.sin(lon);
	const z = rad * Math.sin(ls) + alt * Math.sin(lat);

	return { x: x, y: y, z: z };
}
