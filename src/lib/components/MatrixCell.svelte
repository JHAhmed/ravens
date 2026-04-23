<script>
	import ShapeRenderer from './ShapeRenderer.svelte';

	let { elements = [], isMissing = false, isSelected = false, isCorrect = null } = $props();
</script>

<div
	class="relative flex aspect-square items-center justify-center rounded-[4px] {isMissing
		? 'border border-dashed border-mint/50 bg-canvas'
		: 'border border-hazard-white/30 bg-canvas'} {isSelected && isCorrect === true
		? 'border-mint ring-1 ring-mint'
		: ''} {isSelected && isCorrect === false ? 'opacity-40' : ''}"
>
	{#if isMissing}
		<span class="text-2xl font-semibold text-text-secondary select-none md:text-3xl">?</span>
	{:else}
		<ShapeRenderer {elements} size={100} />
	{/if}
</div>
