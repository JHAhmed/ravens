<script>
	import Icon from '@iconify/svelte';

	let { open = false, onDismiss = () => {} } = $props();

	function handleKeydown(e) {
		if (e.key === 'Escape') onDismiss();
	}

	function handleBackdropClick(e) {
		if (e.target === e.currentTarget) onDismiss();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm"
		onclick={handleBackdropClick}>
		<div class="animate-in w-full max-w-lg border-2 border-black bg-white shadow-[6px_6px_0px_#000]">
			<!-- Header -->
			<div class="border-b-2 border-oat px-6 py-5 md:px-8">
				<p class="mb-1 text-[12px] font-semibold tracking-[1.08px] text-warm-silver uppercase">
					Before You Begin
				</p>
				<h2 class="text-xl font-semibold tracking-[-0.64px] text-black md:text-2xl">
					Test Instructions
				</h2>
			</div>

			<!-- Body -->
			<div class="max-h-[60vh] space-y-5 overflow-y-auto px-6 py-5 md:px-8">
				<!-- General rules -->
				<div>
					<div class="mb-2 flex items-center gap-2">
						<Icon icon="material-symbols:quiz-outline" class="size-4 text-warm-silver" />
						<span class="text-[11px] font-semibold tracking-[1.08px] text-warm-silver uppercase"
							>How It Works</span>
					</div>
					<ul class="space-y-1.5 text-sm leading-relaxed text-dark-charcoal">
						<li class="flex gap-2">
							<span class="mt-1 shrink-0 text-warm-silver">·</span>
							<span
								>Each question shows a <strong class="font-semibold text-black">3×3 grid</strong> with
								a missing piece in the bottom-right corner.</span>
						</li>
						<li class="flex gap-2">
							<span class="mt-1 shrink-0 text-warm-silver">·</span>
							<span
								>Identify the <strong class="font-semibold text-black">pattern</strong> across rows
								and columns — it could involve shape, size, rotation, fill, or a numerical equation.</span>
						</li>
						<li class="flex gap-2">
							<span class="mt-1 shrink-0 text-warm-silver">·</span>
							<span
								>Select the correct answer from the <strong class="font-semibold text-black"
									>6 options</strong> provided.</span>
						</li>
					</ul>
				</div>

				<!-- Helpful tips -->
				<div>
					<div class="mb-2 flex items-center gap-2">
						<Icon icon="material-symbols:lightbulb-outline" class="size-4 text-warm-silver" />
						<span class="text-[11px] font-semibold tracking-[1.08px] text-warm-silver uppercase"
							>Helpful Tips</span>
					</div>
					<ul class="space-y-1.5 text-sm leading-relaxed text-dark-charcoal">
						<li class="flex gap-2">
							<span class="mt-1 shrink-0 text-warm-silver">·</span>
							<span
								>Toggle <strong class="font-semibold text-black">grid lines</strong> and
								<strong class="font-semibold text-black">rotation arrows</strong> using the buttons
								above the answer options.</span>
						</li>
						<li class="flex gap-2">
							<span class="mt-1 shrink-0 text-warm-silver">·</span>
							<span
								>Click the <strong class="font-semibold text-black">magnifying glass</strong>
								<Icon
									icon="material-symbols:search"
									class="inline-block size-3.5 align-text-bottom text-warm-silver" /> at the
								bottom-right of each option to enlarge it.</span>
						</li>
					</ul>
				</div>

				<!-- Important rules -->
				<div>
					<div class="mb-2 flex items-center gap-2">
						<Icon icon="material-symbols:warning-outline" class="size-4 text-warm-silver" />
						<span class="text-[11px] font-semibold tracking-[1.08px] text-warm-silver uppercase"
							>Important</span>
					</div>
					<ul class="space-y-1.5 text-sm leading-relaxed text-dark-charcoal">
						<li class="flex gap-2">
							<span class="mt-1 shrink-0 text-warm-silver">·</span>
							<span
								>You can <strong class="font-semibold text-black">skip questions</strong> and return
								to them later.</span>
						</li>
						<li class="flex gap-2">
							<span class="mt-1 shrink-0 text-warm-silver">·</span>
							<span
								>Once you <strong class="font-semibold text-black">lock in an answer</strong>, it
								<strong class="font-semibold text-black">cannot be changed</strong>.</span>
						</li>
						<li class="flex gap-2">
							<span class="mt-1 shrink-0 text-warm-silver">·</span>
							<span
								>You have <strong class="font-semibold text-black">15 minutes</strong> to complete
								the test. If time runs out, it will be
								<strong class="font-semibold text-black">automatically submitted</strong> with only
								the answers you've confirmed.</span>
						</li>
					</ul>
				</div>
			</div>

			<!-- Footer -->
			<div class="border-t-2 border-oat px-6 py-4 md:px-8">
				<button
					onclick={onDismiss}
					class="w-full cursor-pointer border-2 border-black bg-black px-6 py-3 text-sm font-semibold text-white shadow-accent transition-all duration-200 ease-out hover:hard-shadow-base active:translate-0 active:shadow-none">
					I Understand — Begin Test
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.animate-in {
		animation: modal-pop 0.2s ease-out;
	}

	@keyframes modal-pop {
		from {
			opacity: 0;
			transform: scale(0.95) translateY(8px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}
</style>
