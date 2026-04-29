<script>
	let { grid = [], gridSize = 3 } = $props();
</script>

<div
	class="mx-auto grid w-full"
	style="grid-template-columns: repeat({gridSize}, 1fr); max-width: min(90vw, {gridSize * 120}px);">
	{#each grid as row, r}
		{#each row as cell, c}
			{@const isMissing = cell === null}
			<div
				class="flex aspect-square items-center justify-center border-2
					{isMissing
					? 'border-dashed border-warm-silver bg-cream'
					: 'border-oat bg-white'}">
				{#if isMissing}
					<span class="text-3xl font-bold text-warm-silver md:text-4xl">?</span>
				{:else}
					<span class="font-mono text-2xl font-bold text-black md:text-3xl">{cell}</span>
				{/if}
			</div>
		{/each}
	{/each}
</div>
