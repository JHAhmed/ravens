<script>
	import MatrixCell from './MatrixCell.svelte';

	let { grid = [], gridSize = 3, displayGrid = true, showRotationArrow = false } = $props();
</script>

<div
	class="mx-auto grid w-full"
	style="grid-template-columns: repeat({gridSize}, 1fr); max-width: min(90vw, {gridSize * 120}px);"
>
	{#each grid as row, r}
		{#each row as cell, c}
			<MatrixCell
				elements={cell ?? []}
				isMissing={cell === null}
				{displayGrid}
				{showRotationArrow}
			/>
		{/each}
	{/each}
</div>

