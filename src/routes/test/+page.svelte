<script>
	import MatrixGrid from '$lib/components/MatrixGrid.svelte';
	import ShapeRenderer from '$lib/components/ShapeRenderer.svelte';
	import EnlargeModal from '$lib/components/EnlargeModal.svelte';
	import { generateTest } from '$lib/engine/testGenerator.js';
	import { randomSeed } from '$lib/engine/seededRandom.js';
	import { dev } from '$app/environment';

	// ── State machine: 'form' → 'test' → 'results' ──────────────────
	let phase = $state('form');

	// ── Form state ───────────────────────────────────────────────────
	let name = $state(dev ? 'Jamal' : '');
	let phone = $state(dev ? '9345211256' : '');
	let seed = $state(dev ? 666666 : randomSeed());
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

	// ── Display toggles ──────────────────────────────────────
	let showGrid = $state(true);
	let showRotationArrow = $state(true);

	// ── Derived ──────────────────────────────────────────────────────
	const currentQuestion = $derived(test?.questions[currentIndex] ?? null);
	const totalQuestions = $derived(test?.questions.length ?? 0);
	const formattedTime = $derived(() => {
		const mins = Math.floor(elapsed / 60);
		const secs = elapsed % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	});

	const difficultyStyle = $derived(() => {
		if (!currentQuestion) return '';
		switch (currentQuestion.difficulty) {
			case 'easy':
				return 'border-black bg-white text-black';
			case 'medium':
				return 'border-black bg-black text-white';
			case 'hard':
				return 'border-black bg-black text-white';
			default:
				return 'border-oat bg-white text-warm-charcoal';
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
	<section class="flex h-dvh w-full items-center justify-center bg-cream p-6">
		<div class="w-full max-w-md">
			<!-- Back link -->
			<a
				href="/"
				class="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-warm-silver transition-colors hover:text-black"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
					<path fill="currentColor" d="m14 18l-6-6l6-6l1.4 1.45L10.85 12l4.55 4.55z" />
				</svg>
				Back
			</a>

			<div class="border-2 border-oat bg-white p-8 md:p-10">
				<h1 class="mb-1 text-2xl font-semibold tracking-[-0.64px] md:text-3xl">Raywhen Test</h1>
				<p class="mb-8 text-sm text-warm-silver">15 questions · 5 Easy · 5 Medium · 5 Hard</p>

				<div class="flex flex-col gap-5">
					<!-- Name -->
					<div>
						<label
							for="test-name"
							class="mb-1.5 block text-[12px] font-semibold tracking-[1.08px] text-warm-silver uppercase"
						>
							Name
						</label>
						<input
							id="test-name"
							type="text"
							bind:value={name}
							placeholder="Enter your name"
							maxlength="64"
							class="block w-full border-2 border-oat bg-cream px-4 py-2.5 text-sm text-black placeholder-warm-silver transition-colors focus:border-black focus:ring-0 focus:outline-none"
						/>
					</div>

					<!-- Phone -->
					<div>
						<label
							for="test-phone"
							class="mb-1.5 block text-[12px] font-semibold tracking-[1.08px] text-warm-silver uppercase"
						>
							Phone Number
						</label>
						<input
							id="test-phone"
							type="tel"
							value={phone}
							oninput={handlePhoneInput}
							placeholder="Enter your phone number"
							maxlength="14"
							class="block w-full border-2 border-oat bg-cream px-4 py-2.5 text-sm text-black placeholder-warm-silver transition-colors focus:border-black focus:ring-0 focus:outline-none"
						/>
					</div>

					<!-- Seed display + optional input -->
					<div>
						<div
							class="flex items-center justify-between border-2 border-oat-light bg-cream px-4 py-2.5"
						>
							<span class="text-[12px] font-semibold tracking-[1.08px] text-warm-silver uppercase"
								>Seed</span
							>
							<div class="flex items-center gap-3">
								<span class="font-mono text-sm font-bold tracking-wider text-black">{seed}</span>
								<button
									onclick={toggleSeedInput}
									class="cursor-pointer text-xs font-medium text-warm-silver underline decoration-oat underline-offset-2 transition-colors hover:text-black"
									type="button"
								>
									{showSeedInput ? 'auto' : 'edit'}
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
									class="block flex-1 border-2 border-oat bg-cream px-4 py-2 font-mono text-sm text-black placeholder-warm-silver transition-colors focus:border-black focus:ring-0 focus:outline-none"
								/>
								<button
									onclick={regenerateSeed}
									type="button"
									class="cursor-pointer border-2 border-black bg-white px-3 py-2 text-sm font-bold text-black transition-all duration-[120ms] hover:bg-black hover:text-white"
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
						class="mt-2 w-full cursor-pointer border-2 border-black bg-black px-6 py-3 text-sm font-semibold text-white shadow-accent transition-all duration-200 ease-out hover:hard-shadow-base active:translate-0 active:shadow-none disabled:pointer-events-none disabled:opacity-35"
					>
						Start Test
					</button>
				</div>
			</div>
		</div>
	</section>

	<!-- ═══════════════════════════════════════════════════════════════════ -->
	<!-- PHASE: TEST                                                        -->
	<!-- ═══════════════════════════════════════════════════════════════════ -->
{:else if phase === 'test' && currentQuestion}
	<section class="flex min-h-dvh w-full flex-col bg-cream">
		<!-- Top bar -->
		<header class="shrink-0 border-b border-oat px-4 py-3 md:px-8">
			<div class="mx-auto flex max-w-4xl items-center justify-between">
				<!-- Timer -->
				<div class="flex items-center gap-2">
					<svg
						class="h-4 w-4 text-warm-silver"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<circle cx="12" cy="12" r="10" />
						<path d="M12 6v6l4 2" />
					</svg>
					<span class="font-mono text-sm font-bold text-black tabular-nums">{formattedTime()}</span>
				</div>

				<!-- Question counter -->
				<div class="text-sm font-semibold tracking-tight text-black">
					{currentQuestion.number}<span class="text-warm-silver">/{totalQuestions}</span>
				</div>

				<!-- Difficulty badge -->
				<span class="border-2 px-3 py-1 text-xs font-semibold capitalize {difficultyStyle()}">
					{currentQuestion.difficulty}
				</span>

				<!-- Display toggles -->
				<div class="flex items-center gap-1.5">
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
			</div>
		</header>

		<!-- Question body -->
		<main
			class="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center gap-4 px-4 py-4 md:px-8 md:py-6"
		>
			<!-- Matrix grid -->
			<div class="w-full max-w-sm border-2 border-oat bg-white p-4 md:max-w-md md:p-6">
				<MatrixGrid
					grid={currentQuestion.matrix.grid}
					gridSize={3}
					displayGrid={showGrid}
					{showRotationArrow}
				/>
			</div>

			<!-- Answer options -->
			<div class="flex w-full max-w-xl flex-col items-center gap-3">
				<p class="text-xs font-semibold tracking-[1.08px] text-warm-silver uppercase">
					Select the missing piece
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
								class="relative flex aspect-square cursor-pointer items-center justify-center border-2 bg-white transition-all duration-200 ease-out
									{showCorrect
									? 'border-accent ring-2 ring-accent ring-offset-2'
									: showWrong
										? 'border-oat opacity-40'
										: isSelected
											? 'hard-shadow-sm border-black'
											: 'border-oat hover:hard-shadow-sm hover:border-black'}
									disabled:cursor-not-allowed"
								style="width:120px; height:120px"
							>
								{#if showGrid}
									<div class="absolute inset-0 grid h-full w-full grid-cols-3">
										{#each Array(9) as _}
											<div class="border border-neutral-200"></div>
										{/each}
									</div>
								{/if}
								<div class="z-10">
									<ShapeRenderer elements={opt} size={100} {showRotationArrow} />
								</div>

								{#if showCorrect}
									<div
										class="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center bg-accent text-white"
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
										class="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center bg-wrong text-white"
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
								class="absolute -right-1.5 -bottom-1.5 flex h-6 w-6 cursor-pointer items-center justify-center border border-oat bg-white text-warm-silver transition-all hover:scale-110 hover:border-black hover:text-black"
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
							class="border-2 border-black bg-black px-6 py-2.5 text-sm font-semibold text-white shadow-accent transition-all duration-200 ease-out hover:hard-shadow-base active:translate-0 active:shadow-none disabled:pointer-events-none disabled:opacity-35
								{selectedOption === -1 ? '' : 'cursor-pointer'}"
						>
							Submit Answer
						</button>
					{:else}
						<button
							onclick={nextQuestion}
							class="cursor-pointer border-2 border-black bg-black px-6 py-2.5 text-sm font-semibold text-white shadow-accent transition-all duration-200 ease-out hover:hard-shadow-base active:translate-0 active:shadow-none"
						>
							{currentIndex < totalQuestions - 1 ? 'Next Question →' : 'View Results →'}
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
	<section class="flex min-h-dvh w-full items-center justify-center bg-cream p-6">
		<div class="w-full max-w-md">
			<div class="border-2 border-oat bg-white p-8 md:p-10">
				<h1 class="mb-1 text-2xl font-semibold tracking-[-0.64px] md:text-3xl">Test Complete</h1>
				<p class="mb-6 text-sm text-warm-silver">
					{name} · Seed {seed}
				</p>

				<!-- Score circle -->
				<div class="mb-8 flex flex-col items-center">
					<div class="flex h-28 w-28 items-center justify-center border-4 border-black">
						<div class="text-center">
							<span class="text-3xl font-bold">{r.correct}</span>
							<span class="text-lg text-warm-silver">/{r.total}</span>
						</div>
					</div>
					<p class="mt-3 text-sm font-medium text-warm-silver">
						{Math.round((r.correct / r.total) * 100)}% Accuracy
					</p>
				</div>

				<!-- Per-difficulty breakdown -->
				<div class="mb-6 flex flex-col gap-2">
					{#each ['easy', 'medium', 'hard'] as diff}
						{@const d = r.byDifficulty[diff]}
						<div class="flex items-center justify-between border-2 border-oat bg-cream px-4 py-2.5">
							<span class="text-xs font-semibold text-dark-charcoal capitalize">
								{diff}
							</span>
							<span class="font-mono text-sm font-bold text-black">
								{d.correct}/{d.total}
							</span>
						</div>
					{/each}
				</div>

				<!-- Time -->
				<div
					class="mb-6 flex items-center justify-between border-2 border-oat bg-cream px-4 py-2.5"
				>
					<span class="text-xs font-medium text-warm-silver">Time Taken</span>
					<span class="font-mono text-sm font-bold text-black">{formattedTime()}</span>
				</div>

				<!-- Actions -->
				<div class="flex flex-col gap-2">
					<button
						onclick={restartTest}
						class="w-full cursor-pointer border-2 border-black bg-black px-6 py-3 text-sm font-semibold text-white shadow-accent transition-all duration-200 ease-out hover:hard-shadow-base active:translate-0 active:shadow-none"
					>
						Take Another Test
					</button>
					<a
						href="/"
						class="block w-full cursor-pointer border-2 border-black bg-white px-6 py-3 text-center text-sm font-semibold text-black transition-all duration-200 ease-out hover:hard-shadow-base active:translate-0 active:shadow-none"
					>
						Back to Home
					</a>
				</div>
			</div>
		</div>
	</section>
{/if}
