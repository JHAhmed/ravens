<script>
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<title>Raywhen | A progressive raven matrix generator</title>
	<meta
		name="description"
		content="Raywhen is a progressive raven matrix generator. It generates raven matrices based on the rules selected by the user."
	/>

	<link rel="icon" href={favicon} />
</svelte:head>

<div>{@render children()}</div>
