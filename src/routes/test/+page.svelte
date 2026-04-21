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
				return 'bg-emerald-100 text-emerald-700';
			case 'medium':
				return 'bg-amber-100 text-amber-700';
			case 'hard':
				return 'bg-red-100 text-red-700';
			default:
				return 'bg-gray-100 text-gray-700';
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
		if (timerInterval) clearInterval(timerInterval);
	}

	function handlePhoneInput(e) {
		// Only allow digits, max 14
		const cleaned = e.target.value.replace(/\D/g, '').slice(0, 14);
		phone = cleaned;
		e.target.value = cleaned;
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
	<section class="flex h-dvh w-full items-center justify-center bg-white p-6">
		<div class="w-full max-w-md">
			<!-- Back link -->
			<a
				href="/"
				class="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-gray-400 transition-colors hover:text-black"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
					<path fill="currentColor" d="m14 18l-6-6l6-6l1.4 1.45L10.85 12l4.55 4.55z" />
				</svg>
				Back
			</a>

			<div class="rounded-2xl border border-gray-100 bg-gray-50 p-8 md:p-10">
				<h1 class="mb-1 text-xl font-semibold tracking-tight md:text-2xl">Raywhen Test</h1>
				<p class="mb-8 text-sm text-gray-500">15 questions · 5 Easy · 5 Medium · 5 Hard</p>

				<div class="flex flex-col gap-5">
					<!-- Name -->
					<div>
						<label
							for="test-name"
							class="mb-1.5 block text-xs font-semibold tracking-widest text-gray-400 uppercase"
						>
							Name
						</label>
						<input
							id="test-name"
							type="text"
							bind:value={name}
							placeholder="Enter your name"
							maxlength="64"
							class="block w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-black focus:ring-0 focus:outline-none"
						/>
					</div>

					<!-- Phone -->
					<div>
						<label
							for="test-phone"
							class="mb-1.5 block text-xs font-semibold tracking-widest text-gray-400 uppercase"
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
							class="block w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-black focus:ring-0 focus:outline-none"
						/>
					</div>

					<!-- Seed display -->
					<div class="flex items-center justify-between rounded-lg bg-gray-100 px-4 py-2.5">
						<span class="text-xs font-medium text-gray-500">Seed</span>
						<span class="font-mono text-sm font-semibold tracking-wider text-gray-700">{seed}</span>
					</div>

					<!-- Start button -->
					<button
						onclick={startTest}
						disabled={!name.trim() || !phone.trim()}
						class="mt-2 w-full cursor-pointer rounded-full border-2 border-black bg-black px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-black/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
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
	<section class="flex h-dvh w-full flex-col overflow-hidden bg-white">
		<!-- Top bar -->
		<header class="shrink-0 border-b border-gray-100 px-4 py-3 md:px-8">
			<div class="mx-auto flex max-w-4xl items-center justify-between">
				<!-- Timer -->
				<div class="flex items-center gap-2">
					<svg
						class="h-4 w-4 text-gray-400"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<circle cx="12" cy="12" r="10" />
						<path d="M12 6v6l4 2" />
					</svg>
					<span class="font-mono text-sm font-semibold text-gray-700 tabular-nums"
						>{formattedTime()}</span
					>
				</div>

				<!-- Question counter -->
				<div class="text-sm font-semibold tracking-tight text-gray-800">
					{currentQuestion.number}<span class="text-gray-400">/{totalQuestions}</span>
				</div>

				<!-- Difficulty badge -->
				<span class="rounded-full px-3 py-1 text-xs font-semibold capitalize {difficultyColor()}">
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
				class="w-full max-w-sm rounded-2xl border border-gray-100 bg-gray-50 p-4 md:max-w-md md:p-6"
			>
				<MatrixGrid grid={currentQuestion.matrix.grid} gridSize={3} />
			</div>

			<!-- Answer options -->
			<div class="flex w-full max-w-xl flex-col items-center gap-3">
				<p class="text-xs font-medium tracking-tight text-gray-400">Select the missing piece</p>

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
								class="relative flex aspect-square w-16 cursor-pointer items-center justify-center border-2 bg-white transition-all duration-200 md:w-20
									{showCorrect
									? 'border-black ring-2 ring-black ring-offset-2'
									: showWrong
										? 'border-gray-300 opacity-40'
										: isSelected
											? 'border-black shadow-md'
											: 'border-gray-300 hover:-translate-y-0.5 hover:border-black'}
									disabled:cursor-not-allowed"
							>
								<ShapeRenderer elements={opt} size={60} />

								{#if showCorrect}
									<div
										class="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-black text-white"
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
										class="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-gray-400 text-white"
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
								class="absolute -right-1.5 -bottom-1.5 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition-all hover:scale-110 hover:shadow-md"
								aria-label="Enlarge option {i + 1}"
							>
								<svg
									class="h-3.5 w-3.5 text-gray-500"
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
							class="rounded-full border-2 border-black bg-black px-6 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-black/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40
								{selectedOption === -1 ? '' : 'cursor-pointer'}"
						>
							Submit Answer
						</button>
					{:else}
						<button
							onclick={nextQuestion}
							class="cursor-pointer rounded-full border-2 border-black bg-black px-6 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-black/90 active:scale-[0.98]"
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
	<section class="flex min-h-dvh w-full items-center justify-center bg-white p-6">
		<div class="w-full max-w-md">
			<div class="rounded-2xl border border-gray-100 bg-gray-50 p-8 md:p-10">
				<h1 class="mb-1 text-xl font-semibold tracking-tight md:text-2xl">Test Complete</h1>
				<p class="mb-6 text-sm text-gray-500">
					{name} · Seed {seed}
				</p>

				<!-- Score circle -->
				<div class="mb-8 flex flex-col items-center">
					<div
						class="flex h-28 w-28 items-center justify-center rounded-full border-4 border-black"
					>
						<div class="text-center">
							<span class="text-3xl font-bold">{r.correct}</span>
							<span class="text-lg text-gray-400">/{r.total}</span>
						</div>
					</div>
					<p class="mt-3 text-sm font-medium text-gray-500">
						{Math.round((r.correct / r.total) * 100)}% Accuracy
					</p>
				</div>

				<!-- Per-difficulty breakdown -->
				<div class="mb-6 flex flex-col gap-2">
					{#each ['easy', 'medium', 'hard'] as diff}
						{@const d = r.byDifficulty[diff]}
						{@const color =
							diff === 'easy'
								? 'bg-emerald-100 text-emerald-700'
								: diff === 'medium'
									? 'bg-amber-100 text-amber-700'
									: 'bg-red-100 text-red-700'}
						<div
							class="flex items-center justify-between rounded-lg border border-gray-100 bg-white px-4 py-2.5"
						>
							<span class="rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize {color}">
								{diff}
							</span>
							<span class="text-sm font-semibold text-gray-700">
								{d.correct}/{d.total}
							</span>
						</div>
					{/each}
				</div>

				<!-- Time -->
				<div
					class="mb-6 flex items-center justify-between rounded-lg border border-gray-100 bg-white px-4 py-2.5"
				>
					<span class="text-xs font-medium text-gray-500">Time Taken</span>
					<span class="font-mono text-sm font-semibold text-gray-700">{formattedTime()}</span>
				</div>

				<!-- Actions -->
				<div class="flex flex-col gap-2">
					<button
						onclick={restartTest}
						class="w-full cursor-pointer rounded-full border-2 border-black bg-black px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-black/90 active:scale-[0.98]"
					>
						Take Another Test
					</button>
					<a
						href="/"
						class="block w-full cursor-pointer rounded-full border-2 border-gray-300 bg-white px-6 py-3 text-center text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-black"
					>
						Back to Home
					</a>
				</div>
			</div>
		</div>
	</section>
{/if}
