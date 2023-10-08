<script lang="ts">
	import { goto } from "$app/navigation";
	import quakes from "$lib/quakedata";

	export let selectDate: number = 0;
	function getDate(d: number) {
		let t = new Date(d);
		let d2: string = t.toISOString();
		return d2.slice(0, 9);
	}

	function gotoTime(d: number) {
		selectDate = d;
	}
</script>

<div class="overflow-x-auto max-h-96">
	<table class="table table-xs table-pin-rows table-pin-cols">
		<thead>
			<tr>
				<th />
				<td>Date</td>
				<td>Name</td>
			</tr>
		</thead>
		<tbody>
			{#each quakes as quake, index}
				<tr
					on:click={() => gotoTime(quake.date)}
					class="cursor-pointer hover:bg-white"
				>
					<th>{index + 1}</th>
					<th>{getDate(quake.date)}</th>
					<td>{quake.type}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
