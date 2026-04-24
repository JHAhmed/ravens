<script>
	import Button from './Button.svelte';
	import { ALL_RULES } from '$lib/engine/rules.js';

	let {
		gridSize = $bindable(3),
		difficulty = $bindable('easy'),
		selectedRules = $bindable([]),
		onGenerate = () => {},
		onDownload = () => {},
		onRandom = () => {},
		hasMatrix = false
	} = $props();

	// const gridSizes = [3, 4, 5];
	const gridSizes = [3];
	const difficulties = [
		{ key: 'easy', label: 'Easy', max: 1 },
		{ key: 'medium', label: 'Medium', max: 2 },
		{ key: 'hard', label: 'Hard', max: 3 }
	];

	const maxRules = $derived(difficulties.find((d) => d.key === difficulty)?.max ?? 1);

	// Track previous values for grid size and difficulty to detect changes
	let prevGridSize = gridSize;
	let prevDifficulty = difficulty;

	$effect(() => {
		if (gridSize !== prevGridSize) {
			prevGridSize = gridSize;
			const filtered = selectedRules.filter((id) => {
				const rule = ALL_RULES.find((r) => r.id === id);
				return rule && rule.gridSizes.includes(gridSize);
			});
			if (filtered.length !== selectedRules.length) {
				selectedRules = filtered;
			}
		}
	});

	$effect(() => {
		if (difficulty !== prevDifficulty) {
			prevDifficulty = difficulty;
			const max = difficulties.find((d) => d.key === difficulty)?.max ?? 1;
			if (selectedRules.length > max) {
				selectedRules = selectedRules.slice(0, max);
			}
		}
	});
</script>

<aside class="flex w-full flex-col gap-5 lg:w-48">
	<!-- Grid Size -->
	<div>
		<h3 class="mb-2 text-[12px] font-semibold tracking-[1.08px] text-warm-silver uppercase">Grid Size</h3>
		<div class="flex gap-1.5">
			{#each gridSizes as gs}
				<button
					onclick={() => (gridSize = gs)}
					class="cursor-pointer border-2 border-black px-4 py-1.5 text-sm font-semibold tracking-tight transition-all duration-200 ease-out
						{gridSize === gs
						? 'hard-shadow-sm bg-black text-white'
						: 'bg-white text-black hover:hard-shadow-sm'}"
				>
					{gs}×{gs}
				</button>
			{/each}
		</div>
	</div>

	<!-- Difficulty -->
	<div>
		<h3 class="mb-2 text-[12px] font-semibold tracking-[1.08px] text-warm-silver uppercase">Difficulty</h3>
		<div class="flex flex-wrap gap-1.5">
			{#each difficulties as d}
				<button
					onclick={() => (difficulty = d.key)}
					class="cursor-pointer border-2 border-black px-3 py-1.5 text-sm font-semibold tracking-tight transition-all duration-200 ease-out
						{difficulty === d.key
						? 'hard-shadow-sm bg-black text-white'
						: 'bg-white text-black hover:hard-shadow-sm'}"
				>
					{d.label}
				</button>
			{/each}
		</div>
		<p class="mt-1.5 text-xs text-warm-silver">Up to {maxRules} rule{maxRules > 1 ? 's' : ''}</p>
	</div>

	<!-- Actions -->
	<div class="flex flex-col gap-2">
		<Button
			text="⟳  Randomize"
			onclick={onRandom}
		/>
		<Button
			text="Generate"
			onclick={onGenerate}
			disabled={selectedRules.length === 0}
		/>
		{#if hasMatrix}
			<Button text="↓  Download SVG" onclick={onDownload} variant="ghost" />
		{/if}
	</div>
</aside>
