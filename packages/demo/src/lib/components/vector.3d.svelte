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
	class="vector-card group"
	in:fly={{ y: 20, duration: 600, delay: Math.random() * 100, easing: cubicOut }}
>
	<div class="card-inner bg-gradient-to-br {config.gradient} border {config.border}">
		<!-- Glow Effect -->
		<div class="card-glow {config.glow}"></div>

		<!-- Content -->
		<div class="card-content">
			<div class="card-header">
				{#if icon}
					<span class="card-icon" style="filter: {config.iconGlow}">{icon}</span>
				{/if}
				<h3 class="card-title">{title}</h3>
			</div>

			<div class="axes-grid">
				{#each ['x', 'y', 'z'] as axis}
					<div class="axis-item">
						<!-- Axis Label -->
						<div class="axis-label">{axis.toUpperCase()}</div>

						<!-- Bar Visualizer -->
						<div class="bar-container">
							<div class="bar-track">
								{#if data}
									<div
										class="bar-fill"
										style="height: {getBarHeight(data[axis as keyof typeof data])}%; background: {config.barColor};"
									></div>
								{/if}
							</div>
						</div>

						<!-- Value -->
						<div class="axis-value" class:updating={updatingAxis[axis]}>
							{data ? data[axis].toFixed(2) : '-'}
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Shine overlay -->
		<div class="shine"></div>
	</div>
</div>

<style>
	.vector-card {
		position: relative;
		height: 100%;
	}

	.card-inner {
		position: relative;
		height: 100%;
		padding: 1.5rem;
		border-radius: 1rem;
		background-color: rgba(15, 23, 42, 0.6);
		backdrop-filter: blur(12px);
		border-width: 1px;
		overflow: hidden;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.vector-card:hover .card-inner {
		transform: translateY(-2px);
	}

	.card-glow {
		position: absolute;
		inset: -20px;
		opacity: 0;
		transition: opacity 0.3s ease;
		pointer-events: none;
	}

	.vector-card:hover .card-glow {
		opacity: 1;
	}

	.card-content {
		position: relative;
		z-index: 10;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		height: 100%;
	}

	.card-header {
		display: flex;
		align-items: center;
		gap: 0.625rem;
	}

	.card-icon {
		font-size: 1.5rem;
		transition: transform 0.3s ease;
	}

	.vector-card:hover .card-icon {
		transform: scale(1.15) rotate(5deg);
	}

	.card-title {
		font-size: 0.8125rem;
		font-weight: 600;
		color: #cbd5e1;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.axes-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
		flex: 1;
	}

	.axis-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.625rem;
	}

	.axis-label {
		font-size: 0.75rem;
		font-weight: 700;
		color: #64748b;
		letter-spacing: 0.05em;
	}

	.bar-container {
		flex: 1;
		width: 100%;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		min-height: 80px;
	}

	.bar-track {
		width: 60%;
		height: 100%;
		background: rgba(30, 41, 59, 0.6);
		border-radius: 0.375rem;
		position: relative;
		overflow: hidden;
		display: flex;
		align-items: flex-end;
		border: 1px solid rgba(71, 85, 105, 0.3);
	}

	.bar-fill {
		width: 100%;
		min-height: 2px;
		border-radius: 0.375rem 0.375rem 0 0;
		transition: height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 0 12px currentColor;
		opacity: 0.8;
	}

	.axis-value {
		font-size: 1.125rem;
		font-weight: 700;
		color: #f1f5f9;
		font-family: 'SF Mono', 'Monaco', 'Cascadia Code', monospace;
		transition: all 0.3s ease;
	}

	.axis-value.updating {
		transform: scale(1.1);
		color: #38bdf8;
	}

	.shine {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			110deg,
			transparent 20%,
			rgba(255, 255, 255, 0.05) 40%,
			rgba(255, 255, 255, 0.1) 50%,
			rgba(255, 255, 255, 0.05) 60%,
			transparent 80%
		);
		transform: translateX(-100%);
		transition: transform 0.6s ease;
		pointer-events: none;
	}

	.vector-card:hover .shine {
		transform: translateX(100%);
	}

	@media (max-width: 768px) {
		.card-inner {
			padding: 1.25rem;
		}

		.axes-grid {
			gap: 0.75rem;
		}

		.bar-container {
			min-height: 60px;
		}

		.axis-value {
			font-size: 1rem;
		}

		.card-icon {
			font-size: 1.25rem;
		}
	}
</style>
