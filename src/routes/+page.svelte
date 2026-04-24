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

<section class="flex h-dvh w-dvw flex-col items-center justify-center bg-cream p-8 md:p-16">
	<div
		class="relative flex h-full w-full flex-col items-center justify-center gap-8 border-2 border-oat bg-white p-8 md:p-16"
	>
		<!-- Display headline -->
		<h1
			class="text-center text-5xl leading-[1.00] font-semibold tracking-[-2px] text-black md:text-7xl md:tracking-[-3.2px]"
		>
			Raywhen
		</h1>

		<!-- Eyebrow -->
		<p class="text-center text-lg font-light tracking-tight text-warm-silver">by Jamal Haneef</p>

		<div class="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
			<!-- Primary CTA -->
			<!-- <a
				href="/generator"
				class="group inline-flex items-center border-2 border-black bg-black px-6 py-3 text-sm font-semibold tracking-tight text-white shadow-accent transition-all duration-200 ease-out hover:hard-shadow-base active:translate-0 active:shadow-none md:px-8 md:py-3.5"
			>
				Ravenizer
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
			</a> -->

			<!-- Secondary CTA -->
			<a
				href="/test"
				class="group inline-flex items-center border-2 border-black bg-white px-6 py-3 text-sm font-semibold tracking-tight text-black transition-all duration-200 ease-out hover:hard-shadow-base active:translate-0 active:shadow-none md:px-8 md:py-3.5"
			>
				Take a Test
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					class="ml-2 transition-transform duration-150 group-hover:translate-x-1"
				>
					<path fill="currentColor" d="m14 18l-1.4-1.45L16.15 13H4v-2h12.15L12.6 7.45L14 6l6 6z" />
				</svg>
			</a>
		</div>
	</div>
</section>
