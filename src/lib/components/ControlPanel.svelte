<script>
	import Button from './Button.svelte';
	import { ALL_RULES, RULE_CATEGORIES, wouldConflict } from '$lib/engine/rules.js';

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

	// group rules by category
	const rulesByCategory = $derived(
		Object.entries(RULE_CATEGORIES).map(([key, cat]) => ({
			...cat,
			key,
			rules: ALL_RULES.filter((r) => r.category === key)
		}))
	);

	function toggleRule(ruleId) {
		if (selectedRules.includes(ruleId)) {
			selectedRules = selectedRules.filter((id) => id !== ruleId);
		} else if (selectedRules.length < maxRules) {
			if (!wouldConflict(selectedRules, ruleId)) {
				selectedRules = [...selectedRules, ruleId];
			}
		}
	}

	function isRuleDisabled(ruleId) {
		const rule = ALL_RULES.find((r) => r.id === ruleId);
		if (!rule) return true;
		if (!rule.gridSizes.includes(gridSize)) return true;
		if (selectedRules.includes(ruleId)) return false;
		if (selectedRules.length >= maxRules) return true;
		return wouldConflict(selectedRules, ruleId);
	}

	// Track previous values for grid size and difficulty to detect changes
	let prevGridSize = gridSize;
	let prevDifficulty = difficulty;

	$effect(() => {
		// Only filter when gridSize actually changes
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
		// Only trim when difficulty actually changes
		if (difficulty !== prevDifficulty) {
			prevDifficulty = difficulty;
			const max = difficulties.find((d) => d.key === difficulty)?.max ?? 1;
			if (selectedRules.length > max) {
				selectedRules = selectedRules.slice(0, max);
			}
		}
	});
</script>

<aside class="flex w-full flex-col gap-6 lg:w-72">
	<!-- Grid Size -->
	<div>
		<h3 class="mb-2 text-xs font-semibold tracking-widest text-gray-400 uppercase">Grid Size</h3>
		<div class="flex gap-1.5">
			{#each gridSizes as gs}
				<button
					onclick={() => (gridSize = gs)}
					class="cursor-pointer rounded-full border-2 px-4 py-1.5 text-sm font-medium tracking-tight transition-all duration-200
						{gridSize === gs
						? 'border-black bg-black text-white'
						: 'border-gray-300 bg-white text-gray-700 hover:border-black'}"
				>
					{gs}×{gs}
				</button>
			{/each}
		</div>
	</div>

	<!-- Difficulty -->
	<div>
		<h3 class="mb-2 text-xs font-semibold tracking-widest text-gray-400 uppercase">Difficulty</h3>
		<div class="flex gap-1.5">
			{#each difficulties as d}
				<button
					onclick={() => (difficulty = d.key)}
					class="cursor-pointer rounded-full border-2 px-4 py-1.5 text-sm font-medium tracking-tight transition-all duration-200
						{difficulty === d.key
						? 'border-black bg-black text-white'
						: 'border-gray-300 bg-white text-gray-700 hover:border-black'}"
				>
					{d.label}
				</button>
			{/each}
		</div>
		<p class="mt-1.5 text-xs text-gray-400">Select up to {maxRules} rule{maxRules > 1 ? 's' : ''}</p>
	</div>

	<!-- Rules -->
	<div class="flex flex-col gap-4">
		<h3 class="text-xs font-semibold tracking-widest text-gray-400 uppercase">Rules</h3>

		{#each rulesByCategory as cat}
			<div>
				<p class="mb-1.5 text-xs font-medium text-gray-500">{cat.name}</p>
				<div class="flex flex-col gap-1">
					{#each cat.rules as rule}
						{@const checked = selectedRules.includes(rule.id)}
						{@const disabled = isRuleDisabled(rule.id)}

						<button
							type="button"
							onclick={() => toggleRule(rule.id)}
							disabled={disabled && !checked}
							class="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors duration-150
								{checked ? 'bg-gray-100' : 'hover:bg-gray-50'}
								{disabled && !checked ? 'cursor-not-allowed opacity-40' : ''}"
						>
							<div
								class="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border-2 transition-all duration-150
									{checked ? 'border-black bg-black' : 'border-gray-300 bg-white'}"
							>
								{#if checked}
									<svg class="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5">
										<path d="M5 13l4 4L19 7" />
									</svg>
								{/if}
							</div>
							<div class="flex flex-col">
								<span class="text-sm font-medium leading-tight">{rule.name}</span>
								<span class="text-[11px] leading-tight text-gray-400">{rule.description}</span>
							</div>
						</button>
					{/each}
				</div>
			</div>
		{/each}
	</div>

	<!-- Actions -->
	<div class="flex flex-col gap-2 pt-2">
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
			<Button text="↓  Download SVG" onclick={onDownload} />
		{/if}
	</div>
</aside>
