<script>
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>Raywhen | A progressive raven matrix generator</title>
	<meta
		name="description"
		content="Raywhen is a progressive raven matrix generator. It generates raven matrices based on the rules selected by the user."
	/>
	<meta property="og:image" content="{page.url.origin}/ogimage.png" />
	<meta property="og:url" content="{page.url.origin}/" />
</svelte:head>

<section class="flex h-dvh w-dvw flex-col items-center justify-center bg-canvas p-8 md:p-16">
	<div
		class="relative flex h-full w-full flex-col items-center justify-center space-y-10 rounded-[20px] border border-hazard-white/10 bg-surface p-8 md:p-16"
	>
		<!-- Display headline -->
		<h1 class="text-center font-display text-5xl leading-[0.95] tracking-[1px] text-hazard-white uppercase md:text-7xl lg:text-8xl">
			Raywhen
		</h1>

		<!-- Thin-weight eyebrow -->
		<p class="text-center text-[19px] font-light tracking-[1.9px] text-text-secondary uppercase">
			by Jamal Haneef
		</p>

		<div class="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
			<!-- Primary CTA — Jelly Mint Pill -->
			<a
				href="/generator"
				class="group inline-flex items-center rounded-3xl border-none bg-mint px-6 py-3 font-mono text-xs font-semibold tracking-[1.5px] text-text-inverted uppercase transition-all duration-[180ms] hover:bg-white/20 hover:text-text-inverted hover:shadow-[0_0_0_1px_#c2c2c2] active:scale-[0.97] md:px-8 md:py-3.5 md:text-sm"
			>
				RAVENIZER
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					class="ml-2 transition-transform duration-150 group-hover:translate-x-1"
				>
					<path
						fill="currentColor"
						d="m14 18l-1.4-1.45L16.15 13H4v-2h12.15L12.6 7.45L14 6l6 6z"
					/>
				</svg>
			</a>

			<!-- Secondary — Dark Slate Pill -->
			<a
				href="/test"
				class="group inline-flex items-center rounded-3xl border border-hazard-white/30 bg-transparent px-6 py-3 font-mono text-xs font-semibold tracking-[1.5px] text-text-muted uppercase transition-all duration-[180ms] hover:border-mint hover:text-mint active:scale-[0.97] md:px-8 md:py-3.5 md:text-sm"
			>
				TAKE A TEST
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					class="ml-2 transition-transform duration-150 group-hover:translate-x-1"
				>
					<path
						fill="currentColor"
						d="m14 18l-1.4-1.45L16.15 13H4v-2h12.15L12.6 7.45L14 6l6 6z"
					/>
				</svg>
			</a>
		</div>
	</div>
</section>
