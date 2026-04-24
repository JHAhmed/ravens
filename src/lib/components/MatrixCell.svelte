<script>
	import ShapeRenderer from './ShapeRenderer.svelte';

	let {
		elements = [],
		isMissing = false,
		isSelected = false,
		isCorrect = null,
		displayGrid = true,
		showRotationArrow = false
	} = $props();
</script>

<div
	class="relative flex aspect-square items-center justify-center bg-white {isMissing
		? 'border-2 border-dashed border-oat'
		: 'border-2 border-black'} {isSelected && isCorrect === true
		? 'ring-2 ring-accent ring-offset-2'
		: ''} {isSelected && isCorrect === false ? 'opacity-40' : ''}"
>
	{#if displayGrid}
		<div class="absolute inset-0 grid h-full w-full grid-cols-3">
			{#each Array(9) as _}
				<div class="border border-neutral-200"></div>
			{/each}
		</div>
	{/if}
	<div class="z-20">
		{#if isMissing}
			<span class="text-2xl font-semibold text-warm-silver select-none md:text-3xl">?</span>
		{:else}
			<ShapeRenderer {elements} size={100} {showRotationArrow} />
		{/if}
	</div>
</div>
