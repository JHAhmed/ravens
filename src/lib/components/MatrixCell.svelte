<script>
	import ShapeRenderer from './ShapeRenderer.svelte';

	let { elements = [], isMissing = false, isSelected = false, isCorrect = null } = $props();
</script>

<div
	class="relative flex aspect-square items-center justify-center bg-white {isMissing
		? 'border-2 border-dashed border-gray-300'
		: 'border-2 border-black'} {isSelected && isCorrect === true
		? 'ring-2 ring-black ring-offset-2'
		: ''} {isSelected && isCorrect === false ? 'opacity-50' : ''}"
>
	{#if isMissing}
		<span class="text-2xl font-semibold text-gray-300 select-none md:text-3xl">?</span>
	{:else}
		<ShapeRenderer {elements} size={100} />
	{/if}
</div>
