<script>
	import Icon from '@iconify/svelte';

	let {
		label,
		name = 'Input',
		type = 'text',
		maxlength = 256,
		min = 0,
		max = 100,
		placeholder = 'John Doe',
		required = true,
		icon = 'heroicons:user-circle',
		uploadName = '',
		value = $bindable(),
		validator,
		allowView = false,
		error = '',
		accept = ''
	} = $props();

	const inputId = $derived(name.toLowerCase().replace(/\s+/g, '-'));
</script>

<div class="w-full">
	{#if label}
		<label for={inputId} class="mb-0.5 block text-sm font-medium text-gray-700"
			>{label}
			{#if required && type === 'file'}
				<span class="text-red-500">*</span>
			{/if}
		</label>
	{/if}

	<div class="relative rounded-md">
		<input
			onchange={validator}
			id={inputId}
			{name}
			{type}
			{max}
			{min}
			{maxlength}
			bind:value
			{placeholder}
			class="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pr-10 text-xs text-gray-900 placeholder-gray-400 invalid:border-red-500 focus:border-gray-400 focus:ring-0 focus:outline-none sm:text-sm" />
		{#if icon && !allowView}
			<div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
				<Icon {icon} class="h-6 w-fit text-gray-400" />
			</div>
		{:else if allowView}
			<div class="absolute inset-y-0 right-0 flex items-center pr-3">
				<button
					type="button"
					class="text-gray-400 focus:outline-none"
					onclick={() => {
						type = type === 'password' ? 'text' : 'password';
					}}
					tabindex="-1">
					{#if type === 'password'}
						<Icon icon="heroicons:eye" class="h-6 w-fit" />
					{:else}
						<Icon icon="heroicons:eye-slash" class="h-6 w-fit" />
					{/if}
				</button>
			</div>
		{/if}
	</div>

	{#if error}
		<p class="mt-1 text-xs text-red-500">{error}</p>
	{/if}
</div>

<style>
	input[type='number']::-webkit-inner-spin-button,
	input[type='number']::-webkit-outer-spin-button {
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
		margin: 0;
	}
</style>
