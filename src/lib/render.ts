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
	moonMaterial.metalness = 0.1;
	moonMaterial.roughness = 0.5;
	const moon = new THREE.Mesh(moonGeometry, moonMaterial);
	scene.add(moon);

	const light = new THREE.DirectionalLight(0xffffff, 1.4);
	light.position.set(0, 0, 1);
	scene.add(light);

	const axesHelper = new THREE.AxesHelper(5000);
	moon.add(axesHelper);

	const dots = quakes.map((quake: Quake) => {
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

		const mesh = text("Hello, world", 0.05, 0.05, 100, 0xcccccc);
		mesh.position.set(pos.x, pos.y, pos.z);
		dot.add(mesh);

		moon.add(dot);

		return { mesh, dot };
	});

	return {
		light,
		moon,
		skybox,
		axesHelper,
		moonNormalMap,
		dots,
	};
}


function text(txt, hWorldTxt, hWorldAll, hPxTxt, fgcolor, bgcolor) {
	// the routine
	// txt is the text.
	// hWorldTxt is world height of text in the plane.
	// hWorldAll is world height of whole rectangle containing the text.
	// hPxTxt is px height of text in the texture canvas; larger gives sharper text.
	// The plane and texture canvas are created wide enough to hold the text.
	// And wider if hWorldAll/hWorldTxt > 1 which indicates padding is desired.
	const kPxToWorld = hWorldTxt / hPxTxt; // Px to World multplication factor
	// hWorldTxt, hWorldAll, and hPxTxt are given; get hPxAll
	const hPxAll = Math.ceil(hWorldAll / kPxToWorld); // hPxAll: height of the whole texture canvas
	// create the canvas for the texture
	const txtcanvas = document.createElement('canvas'); // create the canvas for the texture
	const ctx = txtcanvas.getContext('2d');
	ctx.font = hPxTxt + 'px sans-serif';
	// now get the widths
	const wPxTxt = ctx.measureText(txt).width; // wPxTxt: width of the text in the texture canvas
	const wWorldTxt = wPxTxt * kPxToWorld; // wWorldTxt: world width of text in the plane
	const wWorldAll = wWorldTxt + (hWorldAll - hWorldTxt); // wWorldAll: world width of the whole plane
	const wPxAll = Math.ceil(wWorldAll / kPxToWorld); // wPxAll: width of the whole texture canvas
	// next, resize the texture canvas and fill the text
	txtcanvas.width = wPxAll;
	txtcanvas.height = hPxAll;
	if (bgcolor != undefined) {
		// fill background if desired (transparent if none)
		ctx.fillStyle = '#' + bgcolor.toString(16).padStart(6, '0');
		ctx.fillRect(0, 0, wPxAll, hPxAll);
	}
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillStyle = '#' + fgcolor.toString(16).padStart(6, '0'); // fgcolor
	ctx.font = hPxTxt + 'px sans-serif'; // needed after resize
	ctx.fillText(txt, wPxAll / 2, hPxAll / 2); // the deed is done
	// next, make the texture
	const texture = new THREE.Texture(txtcanvas); // now make texture
	texture.minFilter = THREE.LinearFilter; // eliminate console message
	texture.needsUpdate = true; // duh
	// and make the world plane with the texture
	const geometry = new THREE.PlaneGeometry(wWorldAll, hWorldAll);
	const material = new THREE.MeshBasicMaterial({
		side: THREE.DoubleSide,
		map: texture,
		transparent: true,
		opacity: 1.0,
	});
	// and finally, the mesh
	const mesh = new THREE.Mesh(geometry, material);
	mesh.wWorldTxt = wWorldTxt; // return the width of the text in the plane
	mesh.wWorldAll = wWorldAll; //    and the width of the whole plane
	mesh.wPxTxt = wPxTxt; //    and the width of the text in the texture canvas
	// (the heights of the above items are known)
	mesh.wPxAll = wPxAll; //    and the width of the whole texture canvas
	mesh.hPxAll = hPxAll; //    and the height of the whole texture canvas
	mesh.ctx = ctx; //    and the 2d texture context, for any glitter
	// console.log(wPxTxt, hPxTxt, wPxAll, hPxAll);
	// console.log(wWorldTxt, hWorldTxt, wWorldAll, hWorldAll);
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
