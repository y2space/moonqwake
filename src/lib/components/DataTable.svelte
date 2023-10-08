<script>
	import quakes from "$lib/quakedata";
</script>

<div class="overflow-x-auto">
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
				<tr>
					<th>{index + 1}</th>
					<th>{quake.date}</th>
					<td>{quake.type}</td>
				</tr>
			{/each}
		</tbody>
		<tfoot>
			<tr>
				<th />
				<td>Date</td>
				<td>Name</td>
			</tr>
		</tfoot>
	</table>
</div>
