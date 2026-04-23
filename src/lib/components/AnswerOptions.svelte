<script>
	import ShapeRenderer from './ShapeRenderer.svelte';

	let { options = [], correctIndex = -1, onSelect = () => {} } = $props();

	let selected = $state(-1);
	let revealed = $state(false);

	function pick(index) {
		if (revealed) return;
		selected = index;
		revealed = true;
		onSelect(index);
	}

	// Reset when new options arrive
	$effect(() => {
		if (options) {
			selected = -1;
			revealed = false;
		}
	});
</script>

<div class="mt-6 flex flex-col items-center gap-3">
	<p class="font-mono text-xs font-medium tracking-[1.5px] text-text-secondary uppercase">
		SELECT THE MISSING PIECE
	</p>

	<div class="flex flex-wrap justify-center gap-2 md:gap-3">
		{#each options as opt, i}
			{@const isCorrectOption = i === correctIndex}
			{@const isSelected = i === selected}

			<button
				onclick={() => pick(i)}
				disabled={revealed && !isSelected && !isCorrectOption}
				class="group relative flex aspect-square w-16 cursor-pointer items-center justify-center rounded-[4px] border bg-canvas transition-all duration-200 md:w-20
					{revealed && isCorrectOption
					? 'border-mint ring-1 ring-mint'
					: revealed && isSelected && !isCorrectOption
						? 'border-text-secondary/30 opacity-40'
						: isSelected
							? 'border-hazard-white'
							: 'border-hazard-white/30 hover:-translate-y-0.5 hover:border-mint'}
					disabled:cursor-not-allowed"
			>
				<ShapeRenderer elements={opt} size={60} />

				{#if revealed && isCorrectOption}
					<div
						class="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-mint text-text-inverted"
					>
						<svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
							<path d="M5 13l4 4L19 7" />
						</svg>
					</div>
				{/if}

				{#if revealed && isSelected && !isCorrectOption}
					<div
						class="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-ultraviolet text-hazard-white"
					>
						<svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
							<path d="M6 18L18 6M6 6l12 12" />
						</svg>
					</div>
				{/if}
			</button>
		{/each}
	</div>
</div>
