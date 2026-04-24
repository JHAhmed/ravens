<script>
	import { ALL_RULES, RULE_CATEGORIES, wouldConflict } from '$lib/engine/rules.js';

	let {
		gridSize = 3,
		selectedRules = $bindable([]),
		maxRules = 1
	} = $props();

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
</script>

<aside class="flex w-full flex-col gap-3 lg:w-56">
	<h3 class="text-[12px] font-semibold tracking-[1.08px] text-warm-silver uppercase">Rules</h3>

	{#each rulesByCategory as cat}
		<div>
			<p class="mb-1 text-xs font-medium text-dark-charcoal">{cat.name}</p>
			<div class="flex flex-col gap-0.5">
				{#each cat.rules as rule}
					{@const checked = selectedRules.includes(rule.id)}
					{@const disabled = isRuleDisabled(rule.id)}

					<button
						type="button"
						onclick={() => toggleRule(rule.id)}
						disabled={disabled && !checked}
						class="flex cursor-pointer items-center gap-2 px-2 py-1.5 text-left transition-colors duration-150
							{checked ? 'bg-oat-light' : 'hover:bg-oat-light/50'}
							{disabled && !checked ? 'cursor-not-allowed opacity-30' : ''}"
					>
						<div
							class="flex h-4 w-4 shrink-0 items-center justify-center border-2 transition-all duration-150
								{checked ? 'border-black bg-black' : 'border-oat bg-white'}"
						>
							{#if checked}
								<svg class="h-2.5 w-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5">
									<path d="M5 13l4 4L19 7" />
								</svg>
							{/if}
						</div>
						<div class="flex flex-col">
							<span class="text-[13px] font-medium leading-tight text-black">{rule.name}</span>
							<span class="text-[10px] leading-tight text-warm-silver">{rule.description}</span>
						</div>
					</button>
				{/each}
			</div>
		</div>
	{/each}
</aside>
