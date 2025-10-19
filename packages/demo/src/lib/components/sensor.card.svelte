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
	class="card group"
	in:fly={{ y: 20, duration: 600, delay: Math.random() * 100, easing: cubicOut }}
>
	<div class="card-inner bg-gradient-to-br {config.gradient} border {config.border}">
		<!-- Glow Effect -->
		<div class="card-glow {config.glow}"></div>

		<!-- Content -->
		<div class="card-content">
			<div class="card-header">
				<h3 class="card-title">{title}</h3>
				{#if icon}
					<span class="card-icon" style="filter: {config.iconGlow}">{icon}</span>
				{/if}
			</div>
			<div class="card-value">
				<span class="value-number" class:updating={isUpdating}>{value}</span>
				{#if unit}
					<span class="value-unit">{unit}</span>
				{/if}
			</div>
		</div>

		<!-- Shine overlay -->
		<div class="shine"></div>
	</div>
</div>

<style>
	.card {
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

	.card:hover .card-inner {
		transform: translateY(-2px);
	}

	.card-glow {
		position: absolute;
		inset: -20px;
		opacity: 0;
		transition: opacity 0.3s ease;
		pointer-events: none;
	}

	.card:hover .card-glow {
		opacity: 1;
	}

	.card-content {
		position: relative;
		z-index: 10;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		height: 100%;
	}

	.card-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.card-title {
		font-size: 0.8125rem;
		font-weight: 600;
		color: #cbd5e1;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.card-icon {
		font-size: 1.75rem;
		transition: transform 0.3s ease;
	}

	.card:hover .card-icon {
		transform: scale(1.15) rotate(5deg);
	}

	.card-value {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		margin-top: auto;
	}

	.value-number {
		font-size: 2.5rem;
		font-weight: 700;
		color: #f1f5f9;
		line-height: 1;
		transition: all 0.3s ease;
	}

	.value-number.updating {
		transform: scale(1.08);
		color: #38bdf8;
	}

	.value-unit {
		font-size: 1.125rem;
		font-weight: 600;
		color: #94a3b8;
		margin-bottom: 0.125rem;
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

	.card:hover .shine {
		transform: translateX(100%);
	}

	@media (max-width: 768px) {
		.card-inner {
			padding: 1.25rem;
		}

		.value-number {
			font-size: 2rem;
		}

		.card-icon {
			font-size: 1.5rem;
		}
	}
</style>
