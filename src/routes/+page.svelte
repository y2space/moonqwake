<script lang="ts">
	import { onMount } from 'svelte';
	import * as THREE from 'three';

	let renderCanvas: HTMLCanvasElement;

	onMount(() => {
		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(
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
		const geometry = new THREE.SphereGeometry();
		const material = new THREE.MeshBasicMaterial({ map: texture });
		const cube = new THREE.Mesh(geometry, material);

		scene.add(cube);
		camera.position.z = 5;

		function animate() {
			requestAnimationFrame(animate);
			renderer.render(scene, camera);
		}

		animate();
	});
</script>

<canvas bind:this={renderCanvas} />

<div class="absolute top-2 left-2 bg-base-200 rounded-full p-3">
	hello world
</div>
