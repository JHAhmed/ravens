<script>
	import { goto } from '$app/navigation';

	let {
		text = 'Button',
		disabled = false,
		loading = false,
		variant = 'primary',
		size = 'md',
		href = '',
		fullWidth = false,
		onclick = () => {}
	} = $props();

	function handleClick() {
		if (href) {
			goto(href);
		} else {
			onclick();
		}
	}

	const sizeClasses = {
		sm: 'px-4 py-2 text-sm h-10',
		md: 'px-6 py-2.5 text-base h-11',
		lg: 'px-8 py-3.5 text-base h-14'
	};
</script>

<button
	{disabled}
	onclick={disabled || loading ? undefined : handleClick}
	class="
		inline-flex cursor-pointer items-center justify-center border-2 font-semibold tracking-tight
		focus:ring-0 focus:outline-none
		disabled:pointer-events-none disabled:opacity-40
		{sizeClasses[size]}
		{fullWidth ? 'w-full' : ''}
		{variant === 'primary'
			? 'border-black bg-black text-white shadow-accent transition-all duration-200 ease-out hover:hard-shadow-base active:translate-0 active:shadow-none'
			: variant === 'ghost'
				? 'border-black bg-white text-black transition-all duration-200 ease-out hover:hard-shadow-base active:translate-0 active:shadow-none'
				: 'border-oat bg-cream text-warm-charcoal transition-colors duration-200 hover:border-black hover:text-black'}
	"
>
	{#if loading}
		<svg
			class="mr-2 h-4 w-4 animate-spin"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
		>
			<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
			<path
				class="opacity-75"
				fill="currentColor"
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
			/>
		</svg>
	{/if}
	{text}
</button>
