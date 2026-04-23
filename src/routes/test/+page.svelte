<script>
	import MatrixGrid from '$lib/components/MatrixGrid.svelte';
	import ShapeRenderer from '$lib/components/ShapeRenderer.svelte';
	import EnlargeModal from '$lib/components/EnlargeModal.svelte';
	import { generateTest } from '$lib/engine/testGenerator.js';
	import { randomSeed } from '$lib/engine/seededRandom.js';

	// ── State machine: 'form' → 'test' → 'results' ──────────────────
	let phase = $state('form');

	// ── Form state ───────────────────────────────────────────────────
	let name = $state('');
	let phone = $state('');
	let seed = $state(randomSeed());
	let showSeedInput = $state(false);
	let customSeedValue = $state('');

	// ── Test state ───────────────────────────────────────────────────
	let test = $state(null);
	let currentIndex = $state(0);
	let selectedOption = $state(-1);
	let submitted = $state(false);
	let answers = $state([]); // { selected, correct, difficulty }[]

	// ── Timer ────────────────────────────────────────────────────────
	let startTime = $state(null);
	let elapsed = $state(0);
	let timerInterval = $state(null);

	// ── Enlarge modal ────────────────────────────────────────────────
	let enlargeOpen = $state(false);
	let enlargeElements = $state([]);

	// ── Derived ──────────────────────────────────────────────────────
	const currentQuestion = $derived(test?.questions[currentIndex] ?? null);
	const totalQuestions = $derived(test?.questions.length ?? 0);
	const formattedTime = $derived(() => {
		const mins = Math.floor(elapsed / 60);
		const secs = elapsed % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	});

	const difficultyColor = $derived(() => {
		if (!currentQuestion) return '';
		switch (currentQuestion.difficulty) {
			case 'easy':
				return 'bg-mint/20 text-mint';
			case 'medium':
				return 'bg-ultraviolet/20 text-[#a78bfa]';
			case 'hard':
				return 'bg-hazard-white/10 text-hazard-white';
			default:
				return 'bg-surface text-text-secondary';
		}
	});

	// ── Results computation ──────────────────────────────────────────
	const results = $derived(() => {
		const total = answers.length;
		const correct = answers.filter((a) => a.selected === a.correct).length;
		const byDifficulty = {
			easy: { total: 0, correct: 0 },
			medium: { total: 0, correct: 0 },
			hard: { total: 0, correct: 0 }
		};
		for (const a of answers) {
			byDifficulty[a.difficulty].total++;
			if (a.selected === a.correct) byDifficulty[a.difficulty].correct++;
		}
		return { total, correct, byDifficulty };
	});

	// ── Actions ──────────────────────────────────────────────────────

	function startTest() {
		if (!name.trim() || !phone.trim()) return;
		test = generateTest(seed);
		currentIndex = 0;
		selectedOption = -1;
		submitted = false;
		answers = [];
		startTime = Date.now();
		elapsed = 0;
		phase = 'test';

		timerInterval = setInterval(() => {
			elapsed = Math.floor((Date.now() - startTime) / 1000);
		}, 1000);
	}

	function selectOption(index) {
		if (submitted) return;
		selectedOption = index;
	}

	function submitAnswer() {
		if (selectedOption === -1 || submitted) return;
		submitted = true;
		answers = [
			...answers,
			{
				selected: selectedOption,
				correct: currentQuestion.matrix.correctIndex,
				difficulty: currentQuestion.difficulty
			}
		];
	}

	function nextQuestion() {
		if (currentIndex < totalQuestions - 1) {
			currentIndex++;
			selectedOption = -1;
			submitted = false;
		} else {
			// Test complete
			clearInterval(timerInterval);
			phase = 'results';
		}
	}

	function openEnlarge(elements) {
		enlargeElements = elements;
		enlargeOpen = true;
	}

	function restartTest() {
		seed = randomSeed();
		phase = 'form';
		name = '';
		phone = '';
		test = null;
		currentIndex = 0;
		selectedOption = -1;
		submitted = false;
		answers = [];
		elapsed = 0;
		showSeedInput = false;
		customSeedValue = '';
		if (timerInterval) clearInterval(timerInterval);
	}

	function handlePhoneInput(e) {
		// Only allow digits, max 14
		const cleaned = e.target.value.replace(/\D/g, '').slice(0, 14);
		phone = cleaned;
		e.target.value = cleaned;
	}

	function toggleSeedInput() {
		showSeedInput = !showSeedInput;
		if (showSeedInput) {
			customSeedValue = String(seed);
		}
	}

	function handleSeedInput(e) {
		const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
		customSeedValue = cleaned;
		e.target.value = cleaned;
		if (cleaned) {
			seed = parseInt(cleaned, 10);
		}
	}

	function regenerateSeed() {
		seed = randomSeed();
		customSeedValue = String(seed);
	}
</script>

<svelte:head>
	<title>Test | Raywhen</title>
	<meta
		name="description"
		content="Take a timed Raven's Progressive Matrix test with 15 questions across three difficulty levels."
	/>
</svelte:head>

<EnlargeModal elements={enlargeElements} open={enlargeOpen} onClose={() => (enlargeOpen = false)} />

<!-- ═══════════════════════════════════════════════════════════════════ -->
<!-- PHASE: FORM                                                        -->
<!-- ═══════════════════════════════════════════════════════════════════ -->
{#if phase === 'form'}
	<section class="flex h-dvh w-full items-center justify-center bg-canvas p-6">
		<div class="w-full max-w-md">
			<!-- Back link -->
			<a
				href="/"
				class="mb-8 inline-flex items-center gap-1.5 font-mono text-[11px] font-medium tracking-[1.1px] text-text-secondary uppercase transition-colors hover:text-mint"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
					<path fill="currentColor" d="m14 18l-6-6l6-6l1.4 1.45L10.85 12l4.55 4.55z" />
				</svg>
				BACK
			</a>

			<div class="rounded-[20px] border border-hazard-white/10 bg-surface p-8 md:p-10">
				<h1 class="mb-1 font-display text-3xl leading-[0.95] tracking-[1px] text-hazard-white uppercase md:text-4xl">
					Raywhen Test
				</h1>
				<p class="mb-8 font-mono text-[11px] tracking-[1.1px] text-text-secondary uppercase">
					15 QUESTIONS · 5 EASY · 5 MEDIUM · 5 HARD
				</p>

				<div class="flex flex-col gap-5">
					<!-- Name -->
					<div>
						<label
							for="test-name"
							class="mb-1.5 block font-mono text-[10px] font-medium tracking-[1.8px] text-text-secondary uppercase"
						>
							NAME
						</label>
						<input
							id="test-name"
							type="text"
							bind:value={name}
							placeholder="Enter your name"
							maxlength="64"
							class="block w-full rounded-[2px] border border-hazard-white/30 bg-canvas px-4 py-2.5 text-sm text-text-primary placeholder-text-secondary transition-colors duration-150 focus:border-mint focus:ring-0 focus:outline-none"
						/>
					</div>

					<!-- Phone -->
					<div>
						<label
							for="test-phone"
							class="mb-1.5 block font-mono text-[10px] font-medium tracking-[1.8px] text-text-secondary uppercase"
						>
							PHONE NUMBER
						</label>
						<input
							id="test-phone"
							type="tel"
							value={phone}
							oninput={handlePhoneInput}
							placeholder="Enter your phone number"
							maxlength="14"
							class="block w-full rounded-[2px] border border-hazard-white/30 bg-canvas px-4 py-2.5 text-sm text-text-primary placeholder-text-secondary transition-colors duration-150 focus:border-mint focus:ring-0 focus:outline-none"
						/>
					</div>

					<!-- Seed display + optional input -->
					<div>
						<div class="flex items-center justify-between rounded-[2px] border border-hazard-white/10 bg-canvas px-4 py-2.5">
							<span class="font-mono text-[10px] font-medium tracking-[1.8px] text-text-secondary uppercase">SEED</span>
							<div class="flex items-center gap-2">
								<span class="font-mono text-sm font-semibold tracking-wider text-mint">{seed}</span>
								<button
									onclick={toggleSeedInput}
									class="cursor-pointer font-mono text-[10px] tracking-[1px] text-text-secondary uppercase transition-colors hover:text-mint"
									type="button"
								>
									{showSeedInput ? 'AUTO' : 'EDIT'}
								</button>
							</div>
						</div>

						{#if showSeedInput}
							<div class="mt-2 flex gap-2">
								<input
									type="text"
									value={customSeedValue}
									oninput={handleSeedInput}
									placeholder="Enter seed"
									maxlength="10"
									class="block flex-1 rounded-[2px] border border-hazard-white/30 bg-canvas px-4 py-2 font-mono text-sm text-text-primary placeholder-text-secondary transition-colors duration-150 focus:border-mint focus:ring-0 focus:outline-none"
								/>
								<button
									onclick={regenerateSeed}
									type="button"
									class="cursor-pointer rounded-3xl border border-hazard-white/30 bg-transparent px-3 py-2 font-mono text-[10px] tracking-[1px] text-text-muted uppercase transition-colors hover:border-mint hover:text-mint"
								>
									⟳
								</button>
							</div>
						{/if}
					</div>

					<!-- Start button -->
					<button
						onclick={startTest}
						disabled={!name.trim() || !phone.trim()}
						class="mt-2 w-full cursor-pointer rounded-3xl bg-mint px-6 py-3 font-mono text-xs font-semibold tracking-[1.5px] text-text-inverted uppercase transition-all duration-[180ms] hover:bg-white/20 hover:text-text-inverted hover:shadow-[0_0_0_1px_#c2c2c2] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
					>
						START TEST
					</button>
				</div>
			</div>
		</div>
	</section>

	<!-- ═══════════════════════════════════════════════════════════════════ -->
	<!-- PHASE: TEST                                                        -->
	<!-- ═══════════════════════════════════════════════════════════════════ -->
{:else if phase === 'test' && currentQuestion}
	<section class="flex h-dvh w-full flex-col overflow-hidden bg-canvas">
		<!-- Top bar -->
		<header class="shrink-0 border-b border-hazard-white/10 px-4 py-3 md:px-8">
			<div class="mx-auto flex max-w-4xl items-center justify-between">
				<!-- Timer -->
				<div class="flex items-center gap-2">
					<svg
						class="h-4 w-4 text-text-secondary"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<circle cx="12" cy="12" r="10" />
						<path d="M12 6v6l4 2" />
					</svg>
					<span class="font-mono text-sm font-semibold tracking-wider text-mint tabular-nums"
						>{formattedTime()}</span
					>
				</div>

				<!-- Question counter -->
				<div class="font-mono text-sm font-semibold tracking-[1px] text-text-primary">
					{currentQuestion.number}<span class="text-text-secondary">/{totalQuestions}</span>
				</div>

				<!-- Difficulty badge -->
				<span class="rounded-3xl px-3 py-1 font-mono text-[10px] font-semibold tracking-[1.5px] uppercase {difficultyColor()}">
					{currentQuestion.difficulty}
				</span>
			</div>
		</header>

		<!-- Question body -->
		<main
			class="mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col items-center gap-4 overflow-y-auto px-4 py-4 md:px-8 md:py-6"
		>
			<!-- Matrix grid -->
			<div
				class="w-full max-w-sm rounded-[20px] border border-hazard-white/10 bg-surface p-4 md:max-w-md md:p-6"
			>
				<MatrixGrid grid={currentQuestion.matrix.grid} gridSize={3} />
			</div>

			<!-- Answer options -->
			<div class="flex w-full max-w-xl flex-col items-center gap-3">
				<p class="font-mono text-[10px] font-medium tracking-[1.5px] text-text-secondary uppercase">
					SELECT THE MISSING PIECE
				</p>

				<div class="flex flex-wrap justify-center gap-2 md:gap-3">
					{#each currentQuestion.matrix.options as opt, i}
						{@const isSelected = i === selectedOption}
						{@const isCorrectOption = i === currentQuestion.matrix.correctIndex}
						{@const showCorrect = submitted && isCorrectOption}
						{@const showWrong = submitted && isSelected && !isCorrectOption}

						<div class="relative">
							<button
								onclick={() => selectOption(i)}
								disabled={submitted}
								class="relative flex aspect-square w-16 cursor-pointer items-center justify-center rounded-[4px] border bg-canvas transition-all duration-200 md:w-20
									{showCorrect
									? 'border-mint ring-1 ring-mint'
									: showWrong
										? 'border-text-secondary/30 opacity-40'
										: isSelected
											? 'border-hazard-white'
											: 'border-hazard-white/30 hover:-translate-y-0.5 hover:border-mint'}
									disabled:cursor-not-allowed"
							>
								<ShapeRenderer elements={opt} size={60} />

								{#if showCorrect}
									<div
										class="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-mint text-text-inverted"
									>
										<svg
											class="h-3 w-3"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="3"
										>
											<path d="M5 13l4 4L19 7" />
										</svg>
									</div>
								{/if}

								{#if showWrong}
									<div
										class="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-ultraviolet text-hazard-white"
									>
										<svg
											class="h-3 w-3"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="3"
										>
											<path d="M6 18L18 6M6 6l12 12" />
										</svg>
									</div>
								{/if}
							</button>

							<!-- Magnifying glass -->
							<button
								onclick={() => openEnlarge(opt)}
								class="absolute -right-1.5 -bottom-1.5 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-hazard-white/20 bg-surface text-text-secondary transition-all hover:scale-110 hover:text-mint"
								aria-label="Enlarge option {i + 1}"
							>
								<svg
									class="h-3.5 w-3.5"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2.5"
								>
									<circle cx="11" cy="11" r="7" />
									<path d="m21 21l-4.35-4.35" />
								</svg>
							</button>
						</div>
					{/each}
				</div>

				<!-- Submit / Next buttons -->
				<div class="flex items-center gap-3 pt-2">
					{#if !submitted}
						<button
							onclick={submitAnswer}
							disabled={selectedOption === -1}
							class="rounded-3xl bg-mint px-6 py-2.5 font-mono text-xs font-semibold tracking-[1.5px] text-text-inverted uppercase transition-all duration-[180ms] hover:bg-white/20 hover:text-text-inverted hover:shadow-[0_0_0_1px_#c2c2c2] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40
								{selectedOption === -1 ? '' : 'cursor-pointer'}"
						>
							SUBMIT ANSWER
						</button>
					{:else}
						<button
							onclick={nextQuestion}
							class="cursor-pointer rounded-3xl bg-mint px-6 py-2.5 font-mono text-xs font-semibold tracking-[1.5px] text-text-inverted uppercase transition-all duration-[180ms] hover:bg-white/20 hover:text-text-inverted hover:shadow-[0_0_0_1px_#c2c2c2] active:scale-[0.97]"
						>
							{currentIndex < totalQuestions - 1 ? 'NEXT QUESTION →' : 'VIEW RESULTS →'}
						</button>
					{/if}
				</div>
			</div>
		</main>
	</section>

	<!-- ═══════════════════════════════════════════════════════════════════ -->
	<!-- PHASE: RESULTS                                                     -->
	<!-- ═══════════════════════════════════════════════════════════════════ -->
{:else if phase === 'results'}
	{@const r = results()}
	<section class="flex min-h-dvh w-full items-center justify-center bg-canvas p-6">
		<div class="w-full max-w-md">
			<div class="rounded-[20px] border border-hazard-white/10 bg-surface p-8 md:p-10">
				<h1 class="mb-1 font-display text-3xl leading-[0.95] tracking-[1px] text-hazard-white uppercase md:text-4xl">
					Test Complete
				</h1>
				<p class="mb-6 font-mono text-[11px] tracking-[1.1px] text-text-secondary uppercase">
					{name} · SEED {seed}
				</p>

				<!-- Score circle -->
				<div class="mb-8 flex flex-col items-center">
					<div
						class="flex h-28 w-28 items-center justify-center rounded-full border-2 border-mint"
					>
						<div class="text-center">
							<span class="text-3xl font-bold text-mint">{r.correct}</span>
							<span class="text-lg text-text-secondary">/{r.total}</span>
						</div>
					</div>
					<p class="mt-3 font-mono text-[11px] font-medium tracking-[1.5px] text-text-secondary uppercase">
						{Math.round((r.correct / r.total) * 100)}% ACCURACY
					</p>
				</div>

				<!-- Per-difficulty breakdown -->
				<div class="mb-6 flex flex-col gap-2">
					{#each ['easy', 'medium', 'hard'] as diff}
						{@const d = r.byDifficulty[diff]}
						{@const color =
							diff === 'easy'
								? 'bg-mint/20 text-mint'
								: diff === 'medium'
									? 'bg-ultraviolet/20 text-[#a78bfa]'
									: 'bg-hazard-white/10 text-hazard-white'}
						<div
							class="flex items-center justify-between rounded-[2px] border border-hazard-white/10 bg-canvas px-4 py-2.5"
						>
							<span class="rounded-3xl px-2.5 py-0.5 font-mono text-[10px] font-semibold tracking-[1.5px] uppercase {color}">
								{diff}
							</span>
							<span class="font-mono text-sm font-semibold tracking-wider text-text-primary">
								{d.correct}/{d.total}
							</span>
						</div>
					{/each}
				</div>

				<!-- Time -->
				<div
					class="mb-6 flex items-center justify-between rounded-[2px] border border-hazard-white/10 bg-canvas px-4 py-2.5"
				>
					<span class="font-mono text-[10px] font-medium tracking-[1.8px] text-text-secondary uppercase">TIME TAKEN</span>
					<span class="font-mono text-sm font-semibold tracking-wider text-mint">{formattedTime()}</span>
				</div>

				<!-- Actions -->
				<div class="flex flex-col gap-2">
					<button
						onclick={restartTest}
						class="w-full cursor-pointer rounded-3xl bg-mint px-6 py-3 font-mono text-xs font-semibold tracking-[1.5px] text-text-inverted uppercase transition-all duration-[180ms] hover:bg-white/20 hover:text-text-inverted hover:shadow-[0_0_0_1px_#c2c2c2] active:scale-[0.97]"
					>
						TAKE ANOTHER TEST
					</button>
					<a
						href="/"
						class="block w-full cursor-pointer rounded-3xl border border-hazard-white/30 bg-transparent px-6 py-3 text-center font-mono text-xs font-semibold tracking-[1.5px] text-text-muted uppercase transition-all duration-[180ms] hover:border-mint hover:text-mint"
					>
						BACK TO HOME
					</a>
				</div>
			</div>
		</div>
	</section>
{/if}
