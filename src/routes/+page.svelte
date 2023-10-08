<script lang="ts">
	import Controls from '$lib/components/Controls.svelte';
	import { MONTHS } from '$lib/constants';
	import { createScene } from '$lib/render';
	import { onMount } from 'svelte';
	import * as THREE from 'three';

	let renderCanvas: HTMLCanvasElement;
	let moon: THREE.Mesh;
	let camera: THREE.PerspectiveCamera;
	let light: THREE.DirectionalLight;
	let skybox: THREE.Mesh;
	let renderer: THREE.WebGL1Renderer;
	let axesHelper: THREE.AxesHelper;
	let moonNormalMap: THREE.Texture;

	let lightIntensity: number;
	let showAxes = false;
	let useNormalMap = true;

	let currentTime = new Date();
	let playTimeline = false;
	let timelineValue = 0;
	let lastPlayed: number;

	let innerWidth: number;
	let innerHeight: number;

	let startTime = new Date(0);
	let endTime = new Date(Date.now());

	const TIME_STEPS = 25_000;

	let stepSize = (endTime.getTime() - startTime.getTime()) / TIME_STEPS;

	$: if (light) light.intensity = lightIntensity / 20;
	$: {
		if (playTimeline) updateTimeline();
		else clearTimeline();
	}
	$: if (renderer && camera) {
		renderer.setSize(innerWidth, innerHeight);
		camera.aspect = innerWidth / innerHeight;
		camera.updateProjectionMatrix();
	}
	$: {
		currentTime = new Date(startTime.getTime() + timelineValue * stepSize);
	}
	$: if (moon && axesHelper) {
		if (showAxes) moon.add(axesHelper);
		else moon.remove(axesHelper);
	}
	$: {
		if (moon && moonNormalMap) {
			const material = moon.material as THREE.MeshStandardMaterial;

			if (useNormalMap) {
				material.normalMap = moonNormalMap;
			} else {
				material.normalMap = null;
			}

			material.needsUpdate = true;
		}
	}

	function clearTimeline() {
		clearInterval(lastPlayed);
	}

	function updateTimeline() {
		lastPlayed = setInterval(() => {
			if (timelineValue + 10 >= TIME_STEPS) {
				return clearTimeline();
			}

			timelineValue += 10;
		}, 10);
	}

	onMount(() => {
		const scene = new THREE.Scene();
		renderer = new THREE.WebGL1Renderer({
			canvas: renderCanvas,
			antialias: true,
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
		axesHelper = models.axesHelper;
		moonNormalMap = models.moonNormalMap;
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
						'XYZ'
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

<svelte:window on:wheel={onMouseScroll} bind:innerWidth bind:innerHeight />

<canvas bind:this={renderCanvas} on:mousemove={onMouseMove} />

<Controls bind:lightIntensity bind:showAxes bind:useNormalMap />

<div class="absolute top-2 right-2 text-white rounded-full p-3">
	{MONTHS[currentTime.getMonth()]}
	{currentTime.getDate()}, {currentTime.getFullYear()}
</div>

<div
	class="absolute text-white rounded-full left-0 right-0 bottom-5 grid w-full place-items-center"
>
	<div class="w-full max-w-md flex flex-row gap-2">
		<label class="swap">
			<input type="checkbox" bind:checked={playTimeline} />
			<svg class="fill-current w-6 h-6 swap-off" viewBox="0 0 24 24">
				<path d="M8 5v14l11-7z" />
			</svg>
			<svg class="fill-current w-6 h-6 swap-on" viewBox="0 0 24 24">
				<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
			</svg>
		</label>

		<input
			type="range"
			min={0}
			max={TIME_STEPS}
			bind:value={timelineValue}
			on:focus={() => {
				playTimeline = false;
			}}
			class="range w-full max-w-sm"
		/>
	</div>
</div>
