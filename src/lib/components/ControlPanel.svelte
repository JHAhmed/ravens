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
		<h3 class="mb-2 font-mono text-[10px] font-medium tracking-[1.8px] text-text-secondary uppercase">
			GRID SIZE
		</h3>
		<div class="flex gap-1.5">
			{#each gridSizes as gs}
				<button
					onclick={() => (gridSize = gs)}
					class="cursor-pointer rounded-3xl border px-4 py-1.5 font-mono text-xs font-medium tracking-wider transition-all duration-[150ms]
						{gridSize === gs
						? 'border-mint bg-mint text-text-inverted'
						: 'border-hazard-white/30 bg-transparent text-text-muted hover:border-mint hover:text-mint'}"
				>
					{gs}×{gs}
				</button>
			{/each}
		</div>
	</div>

	<!-- Difficulty -->
	<div>
		<h3 class="mb-2 font-mono text-[10px] font-medium tracking-[1.8px] text-text-secondary uppercase">
			DIFFICULTY
		</h3>
		<div class="flex flex-wrap gap-1.5">
			{#each difficulties as d}
				<button
					onclick={() => (difficulty = d.key)}
					class="cursor-pointer rounded-3xl border px-3 py-1.5 font-mono text-xs font-medium tracking-wider transition-all duration-[150ms]
						{difficulty === d.key
						? 'border-mint bg-mint text-text-inverted'
						: 'border-hazard-white/30 bg-transparent text-text-muted hover:border-mint hover:text-mint'}"
				>
					{d.label}
				</button>
			{/each}
		</div>
		<p class="mt-1.5 text-xs text-text-secondary">Up to {maxRules} rule{maxRules > 1 ? 's' : ''}</p>
	</div>

	<!-- Actions -->
	<div class="flex flex-col gap-2">
		<Button
			text="⟳  RANDOMIZE"
			onclick={onRandom}
		/>
		<Button
			text="GENERATE"
			onclick={onGenerate}
			disabled={selectedRules.length === 0}
		/>
		{#if hasMatrix}
			<Button text="↓  DOWNLOAD SVG" onclick={onDownload} variant="secondary" />
		{/if}
	</div>
</aside>
