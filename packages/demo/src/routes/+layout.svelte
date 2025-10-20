<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
	<main class="flex-1 max-w-7xl w-full mx-auto py-12 sm:px-6 lg:px-8 mt-16 mb-16 p-10">
		{@render children?.()}
	</main>
</div>
