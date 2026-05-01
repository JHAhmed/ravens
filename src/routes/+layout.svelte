<script>
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	import { dev } from '$app/environment';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';
	import { UmamiAnalytics } from '@lukulent/svelte-umami';

	injectAnalytics({ mode: dev ? 'development' : 'production' });

	let { children } = $props();
</script>

<UmamiAnalytics
	websiteID="88bd9530-9784-4acd-8736-e7040c8e4147"
	srcURL="https://cloud.umami.is/script.js" />

<svelte:head>
	<title>Raywhen | A logical matrix puzzle test</title>
	<meta
		name="description"
		content="Raywhen is a logical matrix puzzle test. It tests the user's ability to identify patterns in logical matrices." />

	<link rel="icon" href={favicon} />
</svelte:head>

<div class="selection:bg-oat selection:text-black">{@render children()}</div>
