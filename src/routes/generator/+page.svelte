<script>
	import ControlPanel from '$lib/components/ControlPanel.svelte';
	import RulesPanel from '$lib/components/RulesPanel.svelte';
	import MatrixGrid from '$lib/components/MatrixGrid.svelte';
	import AnswerOptions from '$lib/components/AnswerOptions.svelte';
	import { generateMatrix, matrixToSVG } from '$lib/engine/generator.js';
	import { ALL_RULES, areRulesCompatible } from '$lib/engine/rules.js';

	let gridSize = $state(3);
	let difficulty = $state('easy');
	let selectedRules = $state([]);
	let matrix = $state(null);
	let showGrid = $state(true);
	let showRotationArrow = $state(false);

	const maxRules = $derived(difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3);

	function generate() {
		if (selectedRules.length === 0) return;
		matrix = generateMatrix(gridSize, selectedRules);
	}

	function download() {
		if (!matrix) return;
		const svg = matrixToSVG(matrix.grid, gridSize);
		const blob = new Blob([svg], { type: 'image/svg+xml' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `raywhen-${gridSize}x${gridSize}.svg`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	function randomize() {
		const available = ALL_RULES.filter((r) => r.gridSizes.includes(gridSize));
		const picked = [];
		const shuffled = [...available].sort(() => Math.random() - 0.5);

		for (const rule of shuffled) {
			if (picked.length >= maxRules) break;
			const candidate = [...picked.map((r) => r.id), rule.id];
			if (areRulesCompatible(candidate)) {
				picked.push(rule);
			}
		}

		if (picked.length > 0) {
			selectedRules = picked.map((r) => r.id);
			matrix = generateMatrix(gridSize, selectedRules);
		}
	}
</script>

<svelte:head>
	<title>Generator | Raywhen</title>
	<meta
		name="description"
		content="Generate custom Raven's Progressive Matrices with configurable rules, grid sizes, and difficulty levels."
	/>
</svelte:head>

<section class="flex min-h-dvh w-full flex-col bg-cream">
	<!-- Header -->
	<header class="shrink-0 border-b border-oat px-4 py-3 md:px-8">
		<div class="mx-auto flex max-w-7xl items-center justify-between">
			<a
				href="/"
				class="flex items-center gap-2 text-sm font-medium text-warm-silver transition-colors duration-150 hover:text-black"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="18"
					height="18"
					viewBox="0 0 24 24"
				>
					<path fill="currentColor" d="m14 18l-6-6l6-6l1.4 1.45L10.85 12l4.55 4.55z" />
				</svg>
				Back
			</a>
			<h1 class="text-sm font-semibold tracking-tight md:text-base">Raywhen Generator</h1>
			<div class="w-14"></div>
		</div>
	</header>

	<!-- Main: responsive layout -->
	<!-- On large screens: 3-col side by side, tries to fit in remaining viewport -->
	<!-- On small screens / scaled: stacks vertically and scrolls naturally -->
	<main
		class="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 px-4 py-4 md:px-8 lg:flex-row lg:gap-6"
	>
		<!-- LEFT: Config + Buttons -->
		<ControlPanel
			bind:gridSize
			bind:difficulty
			bind:selectedRules
			onGenerate={generate}
			onDownload={download}
			onRandom={randomize}
			hasMatrix={matrix !== null}
		/>

		<!-- CENTER: Matrix + Answers -->
		<div class="flex flex-1 flex-col items-center justify-start gap-3">
			{#if matrix}
				<!-- Toolbar -->
				<div class="flex items-center gap-2">
					<button
						onclick={() => (showGrid = !showGrid)}
						class="cursor-pointer border-2 px-3 py-1 text-xs font-semibold transition-all duration-150
							{showGrid
							? 'border-black bg-black text-white'
							: 'border-oat bg-white text-warm-silver hover:border-black hover:text-black'}"
					>
						⊞ Grid Lines
					</button>
					<button
						onclick={() => (showRotationArrow = !showRotationArrow)}
						class="cursor-pointer border-2 px-3 py-1 text-xs font-semibold transition-all duration-150
							{showRotationArrow
							? 'border-black bg-black text-white'
							: 'border-oat bg-white text-warm-silver hover:border-black hover:text-black'}"
					>
						↻ Rotation Arrow
					</button>
				</div>

				<div class="w-full max-w-lg border-2 border-oat bg-white p-4 md:p-6">
					<MatrixGrid grid={matrix.grid} {gridSize} displayGrid={showGrid} {showRotationArrow} />
				</div>

				<AnswerOptions
					options={matrix.options}
					correctIndex={matrix.correctIndex}
					cellSize={120}
					onSelect={(i) => {
						/* could track stats here */
					}}
				/>
			{:else}
				<!-- Empty state -->
				<div
					class="flex aspect-square w-full max-w-sm flex-col items-center justify-center border-2 border-dashed border-oat bg-white p-8"
				>
					<svg
						class="mb-4 h-12 w-12 text-oat"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.5"
					>
						<rect x="3" y="3" width="7" height="7" rx="0" />
						<rect x="14" y="3" width="7" height="7" rx="0" />
						<rect x="3" y="14" width="7" height="7" rx="0" />
						<rect x="14" y="14" width="7" height="7" rx="0" stroke-dasharray="3,2" />
					</svg>
					<p class="text-center text-sm font-medium text-warm-silver">
						Select rules and hit <span class="font-semibold text-black">Generate</span> or
						<span class="font-semibold text-black">Randomize</span>
					</p>
				</div>
			{/if}
		</div>

		<!-- RIGHT: Rules -->
		<RulesPanel {gridSize} bind:selectedRules {maxRules} />
	</main>
</section>
