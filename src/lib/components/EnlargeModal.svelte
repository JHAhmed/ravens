<script>
	import ShapeRenderer from './ShapeRenderer.svelte';

	let {
		elements = [],
		open = false,
		onClose = () => {},
		showGrid = false,
		showRotationArrow = false
	} = $props();

	function handleKeydown(e) {
		if (e.key === 'Escape') onClose();
	}

	function handleBackdropClick(e) {
		if (e.target === e.currentTarget) onClose();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm transition-all duration-200"
		onclick={handleBackdropClick}>
		<div class="animate-in relative border-2 border-black bg-white p-6 shadow-[6px_6px_0px_#000]">
			<!-- Close button -->
			<button
				onclick={onClose}
				class="absolute -top-4 -right-4 flex h-8 w-8 cursor-pointer items-center justify-center border-2 border-black bg-white text-black transition-all duration-[120ms] hover:bg-wrong hover:text-white hover:shadow-[2px_2px_0px_#000]"
				aria-label="Close">
				<svg
					class="h-4 w-4"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5">
					<path d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>

			<!-- Enlarged shape with optional grid -->
			<div class="relative flex items-center justify-center" style="width:260px; height:260px;">
				{#if showGrid}
					<div class="absolute inset-0 grid h-full w-full grid-cols-3">
						{#each Array(9) as _}
							<div class="border border-neutral-200"></div>
						{/each}
					</div>
				{/if}
				<div class="z-10">
					<ShapeRenderer {elements} size={240} {showRotationArrow} />
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.animate-in {
		animation: modal-pop 0.15s ease-out;
	}

	@keyframes modal-pop {
		from {
			opacity: 0;
			transform: scale(0.95) translate(4px, 4px);
		}
		to {
			opacity: 1;
			transform: scale(1) translate(0, 0);
		}
	}
</style>
