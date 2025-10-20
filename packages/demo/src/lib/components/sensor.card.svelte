<script lang="ts">
	import { fly } from 'svelte/transition'
	import { cubicOut } from 'svelte/easing'

	interface Props {
		title: string
		value: string | number
		unit?: string
		icon?: string
		variant?: 'primary' | 'secondary' | 'success' | 'warning'
	}

	let { title, value, unit = '', icon = '', variant = 'primary' }: Props = $props()

	const variantConfig = {
		primary: {
			gradient: 'from-cyan-500/20 to-blue-500/20',
			border: 'border-cyan-500/30',
			glow: 'shadow-cyan-500/20',
			iconGlow: 'drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]'
		},
		secondary: {
			gradient: 'from-purple-500/20 to-violet-500/20',
			border: 'border-purple-500/30',
			glow: 'shadow-purple-500/20',
			iconGlow: 'drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]'
		},
		success: {
			gradient: 'from-emerald-500/20 to-teal-500/20',
			border: 'border-emerald-500/30',
			glow: 'shadow-emerald-500/20',
			iconGlow: 'drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]'
		},
		warning: {
			gradient: 'from-orange-500/20 to-amber-500/20',
			border: 'border-orange-500/30',
			glow: 'shadow-orange-500/20',
			iconGlow: 'drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]'
		}
	}

	const config = variantConfig[variant]

	let previousValue = $state(value)
	let isUpdating = $state(false)

	$effect(() => {
		if (value !== previousValue) {
			isUpdating = true
			previousValue = value
			setTimeout(() => {
				isUpdating = false
			}, 400)
		}
	})
</script>

<div
	class="relative h-full group"
	in:fly={{ y: 20, duration: 600, delay: Math.random() * 100, easing: cubicOut }}
>
	<div class="relative h-full p-6 rounded-2xl bg-slate-900/60 backdrop-blur-xl border overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] bg-gradient-to-br {config.gradient} {config.border} group-hover:-translate-y-0.5">
		<!-- Glow Effect -->
		<div class="absolute -inset-5 opacity-0 transition-opacity duration-300 ease-out pointer-events-none group-hover:opacity-100 {config.glow}"></div>

		<!-- Content -->
		<div class="relative z-10 flex flex-col gap-4 h-full">
			<div class="flex items-center justify-between">
				<h3 class="text-[0.8125rem] font-semibold text-slate-300 uppercase tracking-wider">{title}</h3>
				{#if icon}
					<span class="text-[1.75rem] transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-[5deg]" style="filter: {config.iconGlow}">{icon}</span>
				{/if}
			</div>
			<div class="flex items-baseline gap-2 mt-auto">
				<span class="text-[2.5rem] font-bold text-slate-100 leading-none transition-all duration-300 ease-out" class:scale-[1.08]={isUpdating} class:text-cyan-400={isUpdating}>{value}</span>
				{#if unit}
					<span class="text-lg font-semibold text-slate-400 mb-0.5">{unit}</span>
				{/if}
			</div>
		</div>

		<!-- Shine overlay -->
		<div class="shine absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full transition-transform duration-600 ease-out pointer-events-none group-hover:translate-x-full" style="background: linear-gradient(110deg, transparent 20%, rgba(255, 255, 255, 0.05) 40%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.05) 60%, transparent 80%)"></div>
	</div>
</div>

<style>
	@media (max-width: 768px) {
		:global(.relative.h-full.group > div) {
			padding: 1.25rem;
		}

		:global(.relative.h-full.group .text-\[2\.5rem\]) {
			font-size: 2rem;
		}

		:global(.relative.h-full.group .text-\[1\.75rem\]) {
			font-size: 1.5rem;
		}
	}
</style>
