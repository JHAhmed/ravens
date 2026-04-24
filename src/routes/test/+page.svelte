<script>
	import MatrixGrid from '$lib/components/MatrixGrid.svelte';
	import ShapeRenderer from '$lib/components/ShapeRenderer.svelte';
	import EnlargeModal from '$lib/components/EnlargeModal.svelte';
	import { generateTest } from '$lib/engine/testGenerator.js';
	import { randomSeed } from '$lib/engine/seededRandom.js';
	import { dev } from '$app/environment';
	import Icon from '@iconify/svelte';

	// ── State machine: 'form' → 'test' → 'results' ──────────────────
	let phase = $state('form');

	// ── Form state ───────────────────────────────────────────────────
	let name = $state(dev ? 'Jamal' : '');
	let phone = $state(dev ? '9345211256' : '');
	let seed = $state(dev ? 123456 : randomSeed());
	let showSeedInput = $state(false);
	let customSeedValue = $state('');

	// ── Test state ───────────────────────────────────────────────────
	let test = $state(null);
	let currentIndex = $state(0);
	let selectedOption = $state(-1);

	// answers[i] = { selected, correct, difficulty } | null (unanswered/skipped)
	let answers = $state([]);
	// Track which questions were explicitly skipped
	let skippedSet = $state(new Set());

	// ── Timer (countdown) ────────────────────────────────────────────
	const TOTAL_TIME = 15 * 60; // 15 minutes in seconds
	let startTime = $state(null);
	let elapsed = $state(0);
	let timerInterval = $state(null);

	// ── Enlarge modal ────────────────────────────────────────────────
	let enlargeOpen = $state(false);
	let enlargeElements = $state([]);

	// ── Display toggles ──────────────────────────────────────────────
	let showGrid = $state(true);
	let showRotationArrow = $state(true);

	// ── Derived ──────────────────────────────────────────────────────
	const currentQuestion = $derived(test?.questions[currentIndex] ?? null);
	const totalQuestions = $derived(test?.questions.length ?? 0);
	const remaining = $derived(Math.max(0, TOTAL_TIME - elapsed));

	const formattedRemaining = $derived(() => {
		const mins = Math.floor(remaining / 60);
		const secs = remaining % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	});

	const formattedElapsed = $derived(() => {
		const mins = Math.floor(elapsed / 60);
		const secs = elapsed % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	});

	// Count answered questions
	const answeredCount = $derived(answers.filter((a) => a !== null).length);

	// Check if all questions are answered
	const allAnswered = $derived(answeredCount === totalQuestions && totalQuestions > 0);

	// ── Results computation ──────────────────────────────────────────
	const results = $derived(() => {
		const answered = answers.filter((a) => a !== null);
		const total = totalQuestions;
		const correct = answered.filter((a) => a.selected === a.correct).length;
		const byDifficulty = {
			medium: { total: 0, correct: 0 },
			hard: { total: 0, correct: 0 }
		};
		for (const a of answered) {
			if (byDifficulty[a.difficulty]) {
				byDifficulty[a.difficulty].total++;
				if (a.selected === a.correct) byDifficulty[a.difficulty].correct++;
			}
		}
		return { total, correct, answered: answered.length, byDifficulty };
	});

	// ── Actions ──────────────────────────────────────────────────────

	function startTest() {
		if (!name.trim() || !phone.trim()) return;
		test = generateTest(seed);
		currentIndex = 0;
		selectedOption = -1;
		answers = Array(test.questions.length).fill(null);
		skippedSet = new Set();
		startTime = Date.now();
		elapsed = 0;
		phase = 'test';

		timerInterval = setInterval(() => {
			elapsed = Math.floor((Date.now() - startTime) / 1000);
			// Auto-submit when time runs out
			if (elapsed >= TOTAL_TIME) {
				finishTest();
			}
		}, 1000);
	}

	function selectOption(index) {
		// Can't select if already answered this question
		if (answers[currentIndex] !== null) return;
		selectedOption = index;
	}

	function confirmAnswer() {
		if (selectedOption === -1 || answers[currentIndex] !== null) return;

		// Lock the answer
		const newAnswers = [...answers];
		newAnswers[currentIndex] = {
			selected: selectedOption,
			correct: currentQuestion.matrix.correctIndex,
			difficulty: currentQuestion.difficulty
		};
		answers = newAnswers;

		// Remove from skipped if it was skipped before
		if (skippedSet.has(currentIndex)) {
			const newSet = new Set(skippedSet);
			newSet.delete(currentIndex);
			skippedSet = newSet;
		}

		// Auto-advance to next unanswered question, or finish
		advanceToNext();
	}

	function skipQuestion() {
		if (answers[currentIndex] !== null) return; // already answered, can't skip

		const newSet = new Set(skippedSet);
		newSet.add(currentIndex);
		skippedSet = newSet;

		advanceToNext();
	}

	function advanceToNext() {
		// Find next unanswered question (skipped or untouched)
		for (let offset = 1; offset <= totalQuestions; offset++) {
			const idx = (currentIndex + offset) % totalQuestions;
			if (answers[idx] === null) {
				goToQuestion(idx);
				return;
			}
		}
		// All answered — finish
		finishTest();
	}

	function goToQuestion(idx) {
		if (idx < 0 || idx >= totalQuestions) return;
		// Can navigate to: unanswered, skipped, or already answered (view-only)
		currentIndex = idx;
		selectedOption = -1;
	}

	function finishTest() {
		clearInterval(timerInterval);
		phase = 'results';
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
		answers = [];
		skippedSet = new Set();
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

	// ── CSV generation ───────────────────────────────────────────────
	function downloadCSV() {
		const r = results();
		const lines = [];

		// Metadata header
		lines.push(`Raywhen Test Results`);
		lines.push(`Name,${name}`);
		lines.push(`Phone,${phone}`);
		lines.push(`Seed,${seed}`);
		lines.push(`Time Taken,${formattedElapsed()}`);
		lines.push(`Score,${r.correct}/${r.total}`);
		lines.push(`Accuracy,${Math.round((r.correct / r.total) * 100)}%`);
		lines.push('');

		// Column headers
		lines.push('Question,Difficulty,Selected Option,Correct Option,Result,Rules');

		// Question rows
		for (let i = 0; i < totalQuestions; i++) {
			const q = test.questions[i];
			const a = answers[i];
			const selected = a !== null ? a.selected + 1 : '-';
			const correct = q.matrix.correctIndex + 1;
			let result = 'Skipped';
			if (a !== null) {
				result = a.selected === a.correct ? 'Correct' : 'Wrong';
			}
			const rules = q.ruleIds.join(' + ');
			lines.push(`${q.number},${q.difficulty},${selected},${correct},${result},"${rules}"`);
		}

		const csv = lines.join('\n');
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `raywhen_test_${name.replace(/\s+/g, '_')}_${seed}.csv`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	// ── Question status helper ───────────────────────────────────────
	function getQuestionStatus(idx) {
		if (answers[idx] !== null) return 'answered';
		if (skippedSet.has(idx)) return 'skipped';
		return 'unanswered';
	}
</script>

<svelte:head>
	<title>Test | Raywhen - A progressive raven matrix generator</title>
	<meta
		name="description"
		content="Take a timed Raven's Progressive Matrix test with 15 questions across two difficulty levels." />
	<meta property="og:image" content="{page.url.origin}/ogimage.png" />
	<meta property="og:url" content="{page.url.origin}/test" />
</svelte:head>

<EnlargeModal
	elements={enlargeElements}
	open={enlargeOpen}
	onClose={() => (enlargeOpen = false)}
	{showGrid}
	{showRotationArrow} />

<!-- ═══════════════════════════════════════════════════════════════════ -->
<!-- PHASE: FORM                                                        -->
<!-- ═══════════════════════════════════════════════════════════════════ -->
{#if phase === 'form'}
	<section class="flex h-dvh w-full items-center justify-center bg-cream p-6">
		<div class="w-full max-w-md">
			<!-- Back link -->
			<a
				href="/"
				class="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-warm-silver transition-colors hover:text-black">
				<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
					<path fill="currentColor" d="m14 18l-6-6l6-6l1.4 1.45L10.85 12l4.55 4.55z" />
				</svg>
				Back
			</a>

			<div class="border-2 border-oat bg-white p-8 md:p-10">
				<h1 class="mb-1 text-2xl font-semibold tracking-[-0.64px] md:text-3xl">Raywhen Test</h1>
				<p class="mb-8 text-sm text-warm-silver">15 questions · 15 minutes</p>

				<div class="flex flex-col gap-5">
					<!-- Name -->
					<div>
						<label
							for="test-name"
							class="mb-1.5 block text-[12px] font-semibold tracking-[1.08px] text-warm-silver uppercase">
							Name
						</label>
						<input
							id="test-name"
							type="text"
							bind:value={name}
							placeholder="Enter your name"
							maxlength="64"
							class="block w-full border-2 border-oat bg-cream px-4 py-2.5 text-sm text-black placeholder-warm-silver transition-colors focus:border-black focus:ring-0 focus:outline-none" />
					</div>

					<!-- Phone -->
					<div>
						<label
							for="test-phone"
							class="mb-1.5 block text-[12px] font-semibold tracking-[1.08px] text-warm-silver uppercase">
							Phone Number
						</label>
						<input
							id="test-phone"
							type="tel"
							value={phone}
							oninput={handlePhoneInput}
							placeholder="Enter your phone number"
							maxlength="14"
							class="block w-full border-2 border-oat bg-cream px-4 py-2.5 text-sm text-black placeholder-warm-silver transition-colors focus:border-black focus:ring-0 focus:outline-none" />
					</div>

					<!-- Seed display + optional input -->
					<div>
						<div
							class="flex items-center justify-between border-2 border-oat-light bg-cream px-4 py-2.5">
							<span class="text-[12px] font-semibold tracking-[1.08px] text-warm-silver uppercase"
								>Seed</span>
							<div class="flex items-center gap-3">
								<span class="font-mono text-sm font-bold tracking-wider text-black">{seed}</span>
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
									class="block flex-1 border-2 border-oat bg-cream px-4 py-2 font-mono text-sm text-black placeholder-warm-silver transition-colors focus:border-black focus:ring-0 focus:outline-none" />
								<button
									onclick={regenerateSeed}
									type="button"
									class="cursor-pointer border-2 border-black bg-white px-3 py-2 text-sm font-bold text-black transition-all duration-[120ms] hover:bg-black hover:text-white">
									⟳
								</button>
							</div>
						{/if}
					</div>

					<!-- Start button -->
					<button
						onclick={startTest}
						disabled={!name.trim() || !phone.trim()}
						class="mt-2 w-full cursor-pointer border-2 border-black bg-black px-6 py-3 text-sm font-semibold text-white shadow-accent transition-all duration-200 ease-out hover:hard-shadow-base active:translate-0 active:shadow-none disabled:pointer-events-none disabled:opacity-35">
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
	<section class="flex h-dvh w-full flex-col bg-cream">
		<!-- Top bar -->
		<header class="shrink-0 border-b border-oat px-4 py-3 md:px-8">
			<div class="mx-auto flex max-w-6xl items-center justify-between">
				<!-- Timer (countdown) -->
				<div class="flex items-center gap-2">
					<svg
						class="h-4 w-4 {remaining <= 60 ? 'text-wrong' : 'text-warm-silver'}"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2">
						<circle cx="12" cy="12" r="10" />
						<path d="M12 6v6l4 2" />
					</svg>
					<span
						class="font-mono text-sm font-bold tabular-nums {remaining <= 60
							? 'text-wrong'
							: 'text-black'}">
						{formattedRemaining()}
					</span>
				</div>

				<!-- Question counter -->
				<div class="text-sm font-semibold tracking-tight text-black">
					{currentQuestion.number}<span class="text-warm-silver">/{totalQuestions}</span>
				</div>

				<!-- Finish test button (when all answered) -->
				{#if allAnswered}
					<button
						onclick={finishTest}
						class="cursor-pointer border-2 border-black bg-black px-3 py-1 text-xs font-semibold text-white transition-all duration-150 hover:hard-shadow-sm">
						Finish Test
					</button>
				{:else}
					<div class="text-xs font-medium text-warm-silver">
						{answeredCount}/{totalQuestions} answered
					</div>
				{/if}
			</div>
		</header>

		<!-- Question body — flex-row layout -->
		<main
			class="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-4 overflow-y-auto px-4 py-4 md:flex-row md:gap-8 md:px-8 md:py-6">
			<!-- LEFT: Matrix grid + Question navigation grid -->
			<div class="flex shrink-0 flex-col items-center gap-4 md:w-[45%] md:items-start">
				<!-- Matrix grid -->
				<div class="w-full max-w-sm border-2 border-oat bg-white p-4 md:max-w-md md:p-6">
					<MatrixGrid
						grid={currentQuestion.matrix.grid}
						gridSize={3}
						displayGrid={showGrid}
						{showRotationArrow} />
				</div>

				<!-- Question navigation grid -->
				<div class="w-full max-w-sm md:max-w-md">
					<p class="mb-2 text-[11px] font-semibold tracking-[1.08px] text-warm-silver uppercase">
						Questions
					</p>
					<div class="grid grid-cols-5 gap-1.5 md:grid-cols-10">
						{#each Array(totalQuestions) as _, i}
							{@const status = getQuestionStatus(i)}
							{@const isCurrent = i === currentIndex}
							<button
								onclick={() => goToQuestion(i)}
								class="flex aspect-square cursor-pointer items-center justify-center border-2 text-xs font-bold transition-all duration-150
									{isCurrent
									? 'border-black bg-black text-white'
									: status === 'answered'
										? 'border-oat bg-dark-charcoal text-white'
										: status === 'skipped'
											? 'border-warn bg-wrong-light text-wrong'
											: 'border-oat bg-white text-warm-silver hover:border-black hover:text-black'}">
								{i + 1}
							</button>
						{/each}
					</div>
				</div>
			</div>

			<!-- RIGHT: Answer options + toggles + actions -->
			<div class="flex flex-1 flex-col items-center gap-3 md:items-start">
				<!-- Display toggles (moved here from header) -->
				<div class="flex items-center gap-1.5">
					<button
						onclick={() => (showGrid = !showGrid)}
						class="inline-flex cursor-pointer border-2 px-3 py-1 text-xs font-semibold transition-all duration-150
							{showGrid
							? 'border-black bg-black text-white'
							: 'border-oat bg-white text-warm-silver hover:border-black hover:text-black'}">
						<Icon icon="material-symbols:grid-3x3" class="mr-1 size-4" /> Grid Lines
					</button>
					<button
						onclick={() => (showRotationArrow = !showRotationArrow)}
						class="inline-flex cursor-pointer border-2 px-3 py-1 text-xs font-semibold transition-all duration-150
							{showRotationArrow
							? 'border-black bg-black text-white'
							: 'border-oat bg-white text-warm-silver hover:border-black hover:text-black'}">
						<Icon icon="material-symbols-light:arrow-menu-open" class="mr-1 size-4 -rotate-45" /> Rotation
						Arrow
					</button>
				</div>

				<p class="text-xs font-semibold tracking-[1.08px] text-warm-silver uppercase">
					{#if answers[currentIndex] !== null}
						Answer locked
					{:else}
						Select the missing piece
					{/if}
				</p>

				<!-- Answer options -->
				<div class="flex flex-wrap justify-center gap-2 md:justify-start md:gap-3">
					{#each currentQuestion.matrix.options as opt, i}
						{@const isSelected = i === selectedOption}
						{@const isLocked = answers[currentIndex] !== null}
						{@const isLockedSelection = isLocked && answers[currentIndex].selected === i}

						<div class="relative">
							<button
								onclick={() => selectOption(i)}
								disabled={isLocked}
								class="relative flex aspect-square cursor-pointer items-center justify-center border-2 bg-white transition-all duration-200 ease-out
									{isLockedSelection
									? 'hard-shadow-sm border-black'
									: isLocked
										? 'cursor-not-allowed border-oat opacity-40'
										: isSelected
											? 'hard-shadow-sm border-black'
											: 'border-oat hover:hard-shadow-sm hover:border-black'}
									{isLocked ? 'disabled:cursor-not-allowed' : ''}"
								style="width:120px; height:120px">
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

								{#if isLockedSelection}
									<div
										class="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center bg-black text-white">
										<svg
											class="h-3 w-3"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="3">
											<path d="M5 13l4 4L19 7" />
										</svg>
									</div>
								{/if}
							</button>

							<!-- Magnifying glass -->
							<button
								onclick={() => openEnlarge(opt)}
								class="absolute -right-1.5 -bottom-1.5 flex h-6 w-6 cursor-pointer items-center justify-center border border-oat bg-white text-warm-silver transition-all hover:scale-110 hover:border-black hover:text-black"
								aria-label="Enlarge option {i + 1}">
								<svg
									class="h-3.5 w-3.5"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2.5">
									<circle cx="11" cy="11" r="7" />
									<path d="m21 21l-4.35-4.35" />
								</svg>
							</button>
						</div>
					{/each}
				</div>

				<!-- Action buttons -->
				<div class="flex items-center gap-3 pt-2">
					{#if answers[currentIndex] === null}
						<!-- Not yet answered -->
						<button
							onclick={confirmAnswer}
							disabled={selectedOption === -1}
							class="border-2 border-black bg-black px-6 py-2.5 text-sm font-semibold text-white shadow-accent transition-all duration-200 ease-out hover:hard-shadow-base active:translate-0 active:shadow-none disabled:pointer-events-none disabled:opacity-35
								{selectedOption === -1 ? '' : 'cursor-pointer'}">
							Confirm & Next
						</button>
						<button
							onclick={skipQuestion}
							class="cursor-pointer border-2 border-oat bg-white px-5 py-2.5 text-sm font-semibold text-warm-silver transition-all duration-150 hover:border-black hover:text-black">
							Skip
						</button>
					{:else}
						<!-- Already answered — let them move on -->
						<button
							onclick={advanceToNext}
							class="cursor-pointer border-2 border-black bg-black px-6 py-2.5 text-sm font-semibold text-white shadow-accent transition-all duration-200 ease-out hover:hard-shadow-base active:translate-0 active:shadow-none">
							{allAnswered ? 'View Results →' : 'Next Question →'}
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
				<!-- <div class="mb-6 flex flex-col gap-2">
					{#each ['medium', 'hard'] as diff}
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
				</div> -->

				<!-- Time -->
				<div
					class="mb-6 flex items-center justify-between border-2 border-oat bg-cream px-4 py-2.5">
					<span class="text-xs font-medium text-dark-charcoal">Time Taken</span>
					<span class="font-mono text-sm font-bold text-black">{formattedElapsed()}</span>
				</div>

				<!-- Actions -->
				<div class="flex flex-col gap-2">
					<button
						onclick={downloadCSV}
						class="flex w-full cursor-pointer items-center justify-center gap-2 border-2 border-black bg-black px-6 py-3 text-sm font-semibold text-white shadow-accent transition-all duration-200 ease-out hover:hard-shadow-base active:translate-0 active:shadow-none">
						<svg
							class="h-4 w-4"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5">
							<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
							<polyline points="7 10 12 15 17 10" />
							<line x1="12" y1="15" x2="12" y2="3" />
						</svg>
						Download CSV
					</button>
					<a
						href="/"
						class="block w-full cursor-pointer border-2 border-black bg-white px-6 py-3 text-center text-sm font-semibold text-black transition-all duration-200 ease-out hover:hard-shadow-base active:translate-0 active:shadow-none">
						Back to Home
					</a>
				</div>
			</div>
		</div>
	</section>
{/if}
