<script lang="ts">
	import Controls from '$lib/components/Controls.svelte';
	import DataTable from '$lib/components/DataTable.svelte';
	import { MONTHS } from '$lib/constants';
	import quakes, { quakesCloseTo, landers } from '$lib/quakedata';
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
	let quakeModels: { mesh: THREE.Mesh; dot: THREE.Points }[] = [];
	let moonlines: THREE.LineSegments;
	let landerModels: { mesh: THREE.Mesh; landerMesh: THREE.Group }[] = [];
	let lightParent: THREE.Mesh;
	let scene: THREE.Scene;
	let exclamationPointModel: THREE.Group;

	let lightIntensity: number;
	let showAxes = false;
	let useNormalMap = true;
	let uselonglat = false;
	let showLanders = true;
	let enableTable = false;
	let openWelcomeModal = true;

	let firstPerson = false;
	let currentTime = new Date();
	let playTimeline = false;
	let timelineValue = 0;
	let lastPlayed: NodeJS.Timeout;

	let innerWidth: number;
	let innerHeight: number;

	let startTime = new Date(0);
	let endTime = new Date(Date.now());
	let listener: THREE.AudioListener;

	const TIME_STEPS = 25_000;

	const soundMap = new Map<number, THREE.Audio>();

	$: stepSize = (endTime.getTime() - startTime.getTime()) / TIME_STEPS;

	$: if (landerModels) {
		for (const { landerMesh, mesh } of landerModels) {
			if (showLanders) {
				moon.add(landerMesh);
				moon.add(mesh);
			} else {
				moon.remove(landerMesh);
				moon.remove(mesh);
			}
		}
	}
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
		const unix = startTime.getTime() + timelineValue * stepSize;
		currentTime = new Date(unix);

		if (playTimeline) {
			const quakes = quakesCloseTo(unix, stepSize);

			for (const { index } of quakes) {
				const { mesh, dot } = quakeModels[index];

				if (mesh) {
					mesh.visible = true;

					// spawn an earthquake on the mesh position and animate it
					playEarthquake(mesh, dot, 0.2, index);
				}

				if (dot) {
					dot.visible = true;
				}
			}
		}
	}

	function playEarthquake(
		mesh: THREE.Mesh,
		dot: THREE.Points,
		magnitude: number,
		index: number
	) {
		const cameraStartPosition = camera.position.clone();
		const earthquakeSound = new THREE.Audio(listener);

		soundMap.set(index, earthquakeSound);
		const audioLoader = new THREE.AudioLoader();

		audioLoader.load('/sounds/rumble.mp3', (buffer) => {
			earthquakeSound.setBuffer(buffer);
			earthquakeSound.setLoop(false);
			earthquakeSound.setVolume(1);
			earthquakeSound.play();
		});
		mesh.visible = true;
		dot.visible = true;

		const originalPosition = mesh.position.clone();
		const exclamationPoint = exclamationPointModel.clone();

		const sphere = new THREE.Mesh(
			new THREE.SphereGeometry(magnitude, 32, 32),
			new THREE.MeshBasicMaterial({ color: 0xff0000 })
		);
		dot.add(sphere);
		dot.add(exclamationPoint);

		// move the sphere to the surface of the moon
		// the `dot` is currently a little bit higher than the moon surface,
		// so move it closer to (0, 0, 0) in the correct direction
		const moonSurfacePosition = originalPosition.sub(dot.position).normalize();

		const exclamationPointPosition = moonSurfacePosition
			.clone()
			.multiplyScalar(1.5);
		const startPosition = moonSurfacePosition.clone().multiplyScalar(0.95);

		exclamationPoint.position.set(
			exclamationPointPosition.x,
			exclamationPointPosition.y,
			exclamationPointPosition.z
		);

		exclamationPoint.lookAt(new THREE.Vector3());
		exclamationPoint.rotateX(-Math.PI / 2);

		const animation = setInterval(() => {
			// every iteration, increase the sphere radius until it reaches the magnitude,
			// and shake the sphere

			const x = Math.random() * 0.02;
			const y = Math.random() * 0.02;
			const z = Math.random() * 0.02;

			sphere.position.set(
				startPosition.x + x,
				startPosition.y + y,
				startPosition.z + z
			);

			if (firstPerson) {
				camera.position.set(
					cameraStartPosition.x + x / 2,
					cameraStartPosition.y + y / 2,
					cameraStartPosition.z + z / 2
				);
			}
		}, 10);

		setTimeout(() => {
			clearInterval(animation);
			dot.remove(sphere);
			dot.visible = false;
			earthquakeSound.stop();
		}, 5000);

		setTimeout(() => {
			mesh.visible = false;
			dot.remove(exclamationPoint);
		}, 2500);

		return animation;
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
	$: if (moon && moonlines) {
		if (uselonglat) {
			moon.add(moonlines);
		} else {
			moon.remove(moonlines);
		}
	}

	function clearTimeline() {
		clearInterval(lastPlayed);
	}

	function updateTimeline() {
		lastPlayed = setInterval(() => {
			if (timelineValue + 10 >= TIME_STEPS) {
				playTimeline = false;
				timelineValue = 0;

				return clearTimeline();
			}

			timelineValue += 10;
		}, 10);
	}

	onMount(async () => {
		document.addEventListener('contextmenu', (e) => {
			e.preventDefault();
		});

		scene = new THREE.Scene();
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

		listener = new THREE.AudioListener();
		camera.add(listener);

		const models = await createScene(scene);

		moon = models.moon;
		light = models.light;
		skybox = models.skybox;
		axesHelper = models.axesHelper;
		moonNormalMap = models.moonNormalMap;
		quakeModels = models.dots;
		moonlines = models.moonlines;
		lightParent = models.lightParent;
		camera.position.z = 3;
		landerModels = models.landerMeshes;
		exclamationPointModel = models.exclamationPointModel;

		startTime = new Date(quakes[0].date);
		endTime = new Date(quakes.at(-1).date);

		function animate() {
			requestAnimationFrame(animate);
			renderer.render(scene, camera);

			if (!usedManual && !firstPerson) {
				moon.rotation.y += 0.001;
				moon.rotation.x += 0.0005;
			}

			if (playTimeline) {
				lightParent.rotation.y += 0.05;
				lightParent.rotation.x += 0.008;
			}
			for (const { mesh } of models.dots) {
				let position = new THREE.Vector3();
				position.setFromMatrixPosition(mesh.matrixWorld);
				mesh.lookAt(position.x, position.y, 3);
			}

			for (const { mesh } of models.landerMeshes) {
				let position = new THREE.Vector3();
				position.setFromMatrixPosition(mesh.matrixWorld);
				mesh.lookAt(position.x, position.y, 3);
			}
		}

		animate();
	});

	let usedManual = false;
	let dragStart = { x: 0, y: 0 };
	let dragEnd = { x: 0, y: 0 };

	function onMouseScroll(event: WheelEvent) {
		event.preventDefault();

		if (!firstPerson) {
			const zoom = Math.min(
				8,
				Math.max(1.5, camera.position.z + (Math.sign(event.deltaY) * 70) / 1000)
			);
			camera.position.z = zoom;
		}
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
			lightParent.quaternion.multiplyQuaternions(
				deltaRotationQuaternion,
				lightParent.quaternion
			);

			dragEnd = { x: skybox.rotation.x, y: skybox.rotation.y };

			usedManual = true;
		} else if (!firstPerson && skybox) {
			function clamp(x: number, a: number, b: number) {
				return Math.min(Math.max(x, b), a);
			}

			const parralaxAmount = 50000;
			const maxAmount = 0.5;
			const deltaY = (window.innerHeight / 2 - event.clientY) / parralaxAmount;
			const deltaX = (window.innerWidth / 2 - event.clientX) / parralaxAmount;

			skybox.rotation.y = dragEnd.y - clamp(deltaX, maxAmount, -maxAmount);
			skybox.rotation.x = dragEnd.x - clamp(deltaY, maxAmount, -maxAmount);

			usedManual = false;
		}

		dragStart = { x: event.clientX, y: event.clientY };
	}

	function onMouseDown(event: MouseEvent) {
		if (event.buttons === 2) {
			if (!firstPerson) {
				const raycaster = new THREE.Raycaster();
				const px = (event.clientX / window.innerWidth) * 2 - 1;
				const py = -(event.clientY / window.innerHeight) * 2 + 1;

				const pointer = { x: px, y: py };

				raycaster.setFromCamera(pointer, camera);

				const intersects = raycaster.intersectObjects(scene.children);

				for (let i = 0; i < intersects.length; i++) {
					if (intersects[i].object.uuid === moon.uuid) {
						console.log('Hit moon!');
						console.log(intersects[i]);
						const moonIntersection = intersects[i];

						const pos = new THREE.Vector3(
							moonIntersection.point.x,
							moonIntersection.point.y,
							moonIntersection.point.z
						);

						const posScaled = pos.multiplyScalar(1.15);
						camera.position.set(posScaled.x, posScaled.y, posScaled.z);

						const plane = new THREE.Plane(pos);
						const target = new THREE.Vector3();

						camera.lookAt(plane.coplanarPoint(target));
						camera.rotateX(45);
						firstPerson = true;
					}
				}
			} else {
				firstPerson = false;

				camera.position.set(0, 0, 3);
				camera.lookAt(0, 0, 0);
			}
		}
	}

	function onKeyPress(event: KeyboardEvent) {
		if (event.code === 'Space') {
			playTimeline = !playTimeline;

			if (!playTimeline) {
				for (const sound of soundMap.values()) {
					sound.stop();
				}
			}
		}
	}
</script>

<svelte:window bind:innerWidth bind:innerHeight on:keypress={onKeyPress} />
<!-- Open the modal using ID.showModal() method -->
<!-- The button to open modal -->
<button
	class="btn absolute bottom-0 left-2"
	on:click={() => (openWelcomeModal = true)}>Instructions</button
>

<!-- Put this part before </body> tag -->
<input type="checkbox" id="my_modal_7" class="modal-toggle" />
<div class="modal" class:modal-open={openWelcomeModal}>
	<div class="modal-box">
		<h3 class="text-lg font-bold">Welcome to Moonqwake!</h3>
		<p class="py-4">
			To change settings, go to controls! <br />To enter first person, right
			click on the moon!
		</p>
	</div>
	<button class="modal-backdrop" on:click={() => (openWelcomeModal = false)}
		>Close</button
	>
</div>

<canvas
	bind:this={renderCanvas}
	on:mousemove={onMouseMove}
	on:mousedown={onMouseDown}
	on:wheel={onMouseScroll}
/>

<Controls
	bind:lightIntensity
	bind:showAxes
	bind:useNormalMap
	bind:uselonglat
	bind:showLanders
	bind:enableTable
/>

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

<div class:hidden={!enableTable} class="absolute bottom-0 right-0">
	<DataTable />
</div>
