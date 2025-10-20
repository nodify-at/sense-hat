<script lang="ts">
	import { fly } from 'svelte/transition'
	import { cubicOut } from 'svelte/easing'

	interface Props {
		title: string
		data?: { x: number; y: number; z: number } | null
		icon?: string
		variant?: 'primary' | 'secondary' | 'success' | 'warning'
	}

	let { title, data, icon = '', variant = 'primary' }: Props = $props()

	const variantConfig = {
		primary: {
			gradient: 'from-cyan-500/20 to-blue-500/20',
			border: 'border-cyan-500/30',
			glow: 'shadow-cyan-500/20',
			iconGlow: 'drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]',
			barColor: '#22d3ee'
		},
		secondary: {
			gradient: 'from-purple-500/20 to-violet-500/20',
			border: 'border-purple-500/30',
			glow: 'shadow-purple-500/20',
			iconGlow: 'drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]',
			barColor: '#a855f7'
		},
		success: {
			gradient: 'from-emerald-500/20 to-teal-500/20',
			border: 'border-emerald-500/30',
			glow: 'shadow-emerald-500/20',
			iconGlow: 'drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]',
			barColor: '#10b981'
		},
		warning: {
			gradient: 'from-orange-500/20 to-amber-500/20',
			border: 'border-orange-500/30',
			glow: 'shadow-orange-500/20',
			iconGlow: 'drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]',
			barColor: '#f97316'
		}
	}

	const config = variantConfig[variant]

	let previousData = $state(data)
	let updatingAxis = $state<Record<string, boolean>>({ x: false, y: false, z: false })

	$effect(() => {
		if (data && previousData) {
			(['x', 'y', 'z'] as const).forEach(axis => {
				if (data[axis] !== previousData?.[axis]) {
					updatingAxis[axis] = true
					setTimeout(() => { updatingAxis[axis] = false }, 400)
				}
			})
		}
		previousData = data
	})

	function getBarHeight(value: number): number {
		return Math.min(Math.abs(value) * 15, 100)
	}
</script>

<div
	class="relative h-full group"
	in:fly={{ y: 20, duration: 600, delay: Math.random() * 100, easing: cubicOut }}
>
	<div class="relative h-full p-6 rounded-2xl bg-slate-900/60 backdrop-blur-xl border overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] bg-gradient-to-br {config.gradient} {config.border} group-hover:-translate-y-0.5">
		<!-- Glow Effect -->
		<div class="absolute -inset-5 opacity-0 transition-opacity duration-300 ease-out pointer-events-none group-hover:opacity-100 {config.glow}"></div>

		<!-- Content -->
		<div class="relative z-10 flex flex-col gap-5 h-full">
			<div class="flex items-center gap-2.5">
				{#if icon}
					<span class="text-2xl transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-[5deg]" style="filter: {config.iconGlow}">{icon}</span>
				{/if}
				<h3 class="text-[0.8125rem] font-semibold text-slate-300 uppercase tracking-wider">{title}</h3>
			</div>

			<div class="grid grid-cols-3 gap-4 flex-1">
				{#each ['x', 'y', 'z'] as axis}
					<div class="flex flex-col items-center gap-2.5">
						<!-- Axis Label -->
						<div class="text-xs font-bold text-slate-500 tracking-wider">{axis.toUpperCase()}</div>

						<!-- Bar Visualizer -->
						<div class="flex-1 w-full flex items-end justify-center min-h-[80px]">
							<div class="w-3/5 h-full bg-slate-800/60 rounded-md relative overflow-hidden flex items-end border border-slate-600/30">
								{#if data}
									<div
										class="w-full min-h-[2px] rounded-t-md transition-[height] duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] shadow-[0_0_12px_currentColor] opacity-80"
										style="height: {getBarHeight(data[axis as keyof typeof data])}%; background: {config.barColor};"
									></div>
								{/if}
							</div>
						</div>

						<!-- Value -->
						<div class="text-lg font-bold text-slate-100 font-mono transition-all duration-300 ease-out" class:scale-110={updatingAxis[axis]} class:text-cyan-400={updatingAxis[axis]}>
							{data ? data[axis].toFixed(2) : '-'}
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Shine overlay -->
		<div class="absolute inset-0 -translate-x-full transition-transform duration-600 ease-out pointer-events-none group-hover:translate-x-full" style="background: linear-gradient(110deg, transparent 20%, rgba(255, 255, 255, 0.05) 40%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.05) 60%, transparent 80%)"></div>
	</div>
</div>

<style>
	@media (max-width: 768px) {
		:global(.relative.h-full.group > div) {
			padding: 1.25rem;
		}

		:global(.relative.h-full.group .grid.grid-cols-3) {
			gap: 0.75rem;
		}

		:global(.relative.h-full.group .min-h-\[80px\]) {
			min-height: 60px;
		}

		:global(.relative.h-full.group .text-lg) {
			font-size: 1rem;
		}

		:global(.relative.h-full.group .text-2xl) {
			font-size: 1.25rem;
		}
	}
</style>
