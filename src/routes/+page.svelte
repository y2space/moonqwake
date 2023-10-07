<script lang="ts">
	import { onMount } from 'svelte';
	import * as THREE from 'three';

    
    onMount(() => {
        
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGL1Renderer();
        const loader = new THREE.TextureLoader();
        let texture = new THREE.TextureLoader().load('/moontexture.jpg');

		camera.position.z = 5;

        const geometry = new THREE.SphereGeometry();
        const material = new THREE.MeshBasicMaterial({map: texture});
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        camera.position.z = 5;

        
        function animate() {
	        requestAnimationFrame( animate);
	        renderer.render( scene, camera );
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;
        }
        animate();
        
    })

</script>


