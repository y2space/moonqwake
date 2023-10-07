<script lang="ts">
	import { onMount } from 'svelte';
	import * as THREE from 'three';

	let renderCanvas: HTMLCanvasElement;
	let moon: THREE.Mesh;
	let camera: THREE.PerspectiveCamera;

	let lightIntensity = 1.4;
	let currentTime = new Date();

	const MONTHS = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December',
	];

	onMount(() => {
		const scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);

		const renderer = new THREE.WebGL1Renderer({
			canvas: renderCanvas,
		});

		renderer.setSize(window.innerWidth, window.innerHeight);
		document.body.appendChild(renderer.domElement);

		const texture = new THREE.TextureLoader().load('/moontexture.jpg');
		const normalMap = new THREE.TextureLoader().load('moonnormal.jpg');

		const geometry = new THREE.SphereGeometry();
		const material = new THREE.MeshStandardMaterial({
			map: texture,
			normalMap: normalMap,
		});
		moon = new THREE.Mesh(geometry, material);

		const light = new THREE.DirectionalLight(0xffffff, lightIntensity);
		light.position.set(0, 0, 1);
		scene.add(light);

		scene.add(moon);

		camera.position.z = 2;

		function animate() {
			requestAnimationFrame(animate);
			renderer.render(scene, camera);

			if (!usedManual) {
				moon.rotation.y += 0.001;
				moon.rotation.x += 0.0005;
			}
		}

		animate();
	});

	let usedManual = false;
	let dragStart = { x: 0, y: 0 };

	function onMouseMove(event: MouseEvent) {
		if (event.buttons === 1) {
			const deltaRotationQuaternion = new THREE.Quaternion()
				.setFromEuler(
					new THREE.Euler(
						((event.clientY - dragStart.y) * Math.PI) / 180,
						((event.clientX - dragStart.x) * Math.PI) / 180,
						0,
						'XYZ'
					)
				)
				.normalize();

			moon.quaternion.multiplyQuaternions(
				deltaRotationQuaternion,
				moon.quaternion
			);

			usedManual = true;
		} else {
			usedManual = false;
		}

		dragStart = { x: event.clientX, y: event.clientY };
	}
</script>

<canvas bind:this={renderCanvas} on:mousemove={onMouseMove} />

<div class="absolute top-2 left-2 bg-base-200 rounded-full p-3">
	hello world
</div>

<div class="absolute bottom-2 right-2 text-white rounded-full p-3">
	{MONTHS[currentTime.getMonth()]}
	{currentTime.getDate()}, {currentTime.getFullYear()}
</div>
