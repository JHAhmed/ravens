<script>
	let { text = 'Button', disabled = false, onclick = () => {} } = $props();
</script>

<button
	class="
    cursor-pointer rounded-full border-2 border-black bg-white px-3 py-1 text-sm font-medium tracking-tight transition-all duration-200 hover:-translate-y-0.5 hover:bg-black hover:text-white
    hover:shadow-xl active:scale-98 active:bg-black active:text-white focus:bg-black focus:text-white disabled:cursor-not-allowed disabled:opacity-50 md:px-6 md:py-2 md:text-base"
	{onclick}
	{disabled}>
	{text}
</button>
