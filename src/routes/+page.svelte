<script lang="ts">
	import Controls from "$lib/components/Controls.svelte";
	import { MONTHS } from "$lib/constants";
	import { createScene } from "$lib/render";

	import { onMount } from "svelte";
	import * as THREE from "three";

	let renderCanvas: HTMLCanvasElement;
	let moon: THREE.Mesh;
	let camera: THREE.PerspectiveCamera;
	let light: THREE.DirectionalLight;
	let skybox: THREE.Mesh;

	let lightIntensity: number;
	let currentTime = new Date();

	$: if (light) light.intensity = lightIntensity / 20;

	onMount(() => {
		const scene = new THREE.Scene();
		const renderer = new THREE.WebGL1Renderer({
			canvas: renderCanvas,
		});

		renderer.setSize(window.innerWidth, window.innerHeight);
		document.body.appendChild(renderer.domElement);

		camera = new THREE.PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);

		const models = createScene(scene);

		moon = models.moon;
		light = models.light;
		skybox = models.skybox;
		camera.position.z = 3;

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
	let dragEnd = { x: 0, y: 0 };

	function onMouseScroll(event: WheelEvent) {
		event.preventDefault();
		const zoom = Math.min(
			8,
			Math.max(1.5, camera.position.z + (Math.sign(event.deltaY) * 70) / 1000)
		);
		camera.position.z = zoom;
		console.log(event.deltaY);
	}

	function onMouseMove(event: MouseEvent) {
		if (event.buttons === 1) {
			const deltaRotationQuaternion = new THREE.Quaternion()
				.setFromEuler(
					new THREE.Euler(
						((event.clientY - dragStart.y) * Math.PI) / 180,
						((event.clientX - dragStart.x) * Math.PI) / 180,
						0,
						"XYZ"
					)
				)
				.normalize();

			moon.quaternion.multiplyQuaternions(
				deltaRotationQuaternion,
				moon.quaternion
			);

			skybox.quaternion.multiplyQuaternions(
				deltaRotationQuaternion,
				skybox.quaternion
			);

			dragEnd = { x: skybox.rotation.x, y: skybox.rotation.y };

			usedManual = true;
		} else {
			function clamp(x: number, a: number, b: number) {
				return Math.min(Math.max(x, b), a);
			}

			const parralaxAmount = 100000;
			const maxAmount = 0.02;
			const deltaY = (window.innerHeight / 2 - event.clientY) / parralaxAmount;
			const deltaX = (window.innerWidth / 2 - event.clientX) / parralaxAmount;

			skybox.rotation.y = dragEnd.y - clamp(deltaX, maxAmount, -maxAmount);
			skybox.rotation.x = dragEnd.x - clamp(deltaY, maxAmount, -maxAmount);

			usedManual = false;
		}

		dragStart = { x: event.clientX, y: event.clientY };
	}
</script>

<canvas
	bind:this={renderCanvas}
	on:mousemove={onMouseMove}
	on:wheel={onMouseScroll}
/>

<Controls bind:lightIntensity />

<div class="absolute bottom-2 right-2 text-white rounded-full p-3">
	{MONTHS[currentTime.getMonth()]}
	{currentTime.getDate()}, {currentTime.getFullYear()}
</div>
