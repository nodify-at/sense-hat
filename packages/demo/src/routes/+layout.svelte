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

	<footer class="fixed bottom-0 left-0 right-0 bg-white shadow-lg z-50">
		<div class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
			<p class="text-center text-sm text-gray-500">
				Svelte 5 + SvelteKit + TypeScript + Tailwind CSS
			</p>
		</div>
	</footer>
</div>
