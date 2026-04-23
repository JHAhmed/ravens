<script>
	let { text = 'Button', disabled = false, onclick = () => {}, variant = 'primary' } = $props();
</script>

<button
	class="
		cursor-pointer rounded-3xl px-5 py-2.5 text-xs font-semibold tracking-[1.5px] uppercase transition-all duration-[180ms] ease-out
		active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40
		font-mono
		{variant === 'primary'
			? 'border-none bg-mint text-text-inverted hover:bg-white/20 hover:text-black hover:shadow-[0_0_0_1px_#c2c2c2] active:bg-dim-gray/87 active:opacity-50'
			: 'border border-mint bg-transparent text-mint hover:bg-mint hover:text-text-inverted'}
		md:px-6 md:py-3 md:text-sm"
	{onclick}
	{disabled}
>
	{text}
</button>
