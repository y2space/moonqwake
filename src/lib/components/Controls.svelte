<script lang="ts">
	export let lightIntensity = 10;
	export let showAxes = false;
	export let useNormalMap = true;
	export let uselonglat = false;
	export let showLanders = true;
</script>

<div class="absolute top-2 left-2">
	<details class="dropdown">
		<summary class="btn">Controls</summary>
		<ul
			class="my-2 p-5 text-sm shadow dropdown-content z-[1] bg-base-100 rounded-box w-80 grid grid-cols-4 gap-4"
		>
			<div class="col-span-3">
				World Axes
				<br />X-axis:
				<span class="text-red-400">Red</span>
				<br />Y-axis:
				<span class="text-green-400">Green</span>
				<br />Z-axis:
				<span class="text-blue-400">Blue</span>
			</div>
			<input
				type="checkbox"
				class="toggle toggle-primary self-center"
				bind:checked={showAxes}
			/>
			<div class="col-span-3">Longitude & Latitude</div>
			<input
				type="checkbox"
				class="toggle toggle-success"
				bind:checked={uselonglat}
			/>
			<div class="col-span-3">Height Map</div>
			<input
				type="checkbox"
				class="toggle toggle-warning"
				bind:checked={useNormalMap}
			/>
			<div class="col-span-3">Apollo Landers</div>
			<input
				type="checkbox"
				class="toggle toggle-info"
				bind:checked={showLanders}
			/>
			<div class="col-span-4">
				Light Intensity <br />
				<input
					type="range"
					min="1"
					max="10"
					class="range range-success range-xs"
					bind:value={lightIntensity}
				/>
			</div>
		</ul>
	</details>
</div>
