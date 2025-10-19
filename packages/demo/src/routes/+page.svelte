<script lang="ts">
	import { onMount, onDestroy } from 'svelte'
	import { scale, fade, fly } from 'svelte/transition'
	import { cubicOut } from 'svelte/easing'
	import { senseHatStore } from '$lib/stores/sensehat.svelte'
	import SensorCard from '$lib/components/sensor.card.svelte'
	import Vector3D from '$lib/components/vector.3d.svelte'
	import LedMatrix from '$lib/components/led.matrix.svelte'

	onMount(() => {
		senseHatStore.connect()
	})

	onDestroy(() => {
		senseHatStore.disconnect()
	})

	function formatTimestamp(timestamp: number | undefined): string {
		if (!timestamp) return '-'
		return new Date(timestamp).toLocaleTimeString()
	}
</script>

<div class="dashboard-container">
	<!-- Animated Mesh Gradient Background -->
	<div class="mesh-gradient"></div>

	<!-- Grid Pattern Overlay -->
	<div class="grid-pattern"></div>

	<!-- Content -->
	<div class="content-wrapper">
		<!-- Compact Header -->
		<header class="header" in:fly={{ y: -30, duration: 800, easing: cubicOut }}>
			<div class="header-content">
				<div class="logo-section">
					<div class="logo-icon">⚡</div>
					<h1 class="logo-text">SenseHat</h1>
				</div>

				<div class="status-section">
					<div class="status-badge {senseHatStore.isConnected ? 'connected' : 'disconnected'}">
						<div class="status-dot"></div>
						<span>{senseHatStore.isConnected ? 'Live' : 'Offline'}</span>
					</div>

					{#if senseHatStore.connectionStatus}
						<div class="hw-badge" transition:scale={{ duration: 300 }}>
							<span class="hw-icon">{senseHatStore.connectionStatus ? '✓' : '✗'}</span>
							<span class="hw-text">Hardware</span>
						</div>
					{/if}
				</div>
			</div>

			{#if senseHatStore.error}
				<div class="error-banner" transition:fly={{ y: -10, duration: 300 }}>
					<span class="error-icon">⚠</span>
					<span class="error-text">{senseHatStore.error}</span>
				</div>
			{/if}
		</header>

		<!-- Main Content -->
		<main class="main-content">
			{#if senseHatStore.sensorData}
				<div class="sensors-grid" in:fade={{ duration: 600, delay: 200 }}>
					<!-- Environmental Section -->
					<div class="section-group">
						<div class="section-header">
							<div class="section-icon">🌡</div>
							<h2 class="section-title">Environment</h2>
						</div>
						<div class="cards-row">
							<SensorCard
								title="Temperature"
								value={senseHatStore.sensorData?.temperature?.toFixed(1) ?? 0}
								unit="°C"
								icon="🌡️"
								variant="warning"
							/>
							<SensorCard
								title="Humidity"
								value={senseHatStore.sensorData?.humidity?.toFixed(1) ?? 0}
								unit="%"
								icon="💧"
								variant="primary"
							/>
							<SensorCard
								title="Pressure"
								value={senseHatStore.sensorData?.pressure?.toFixed(1) ?? 0}
								unit="hPa"
								icon="🌀"
								variant="secondary"
							/>
						</div>
					</div>

					<!-- Motion Section -->
					<div class="section-group">
						<div class="section-header">
							<div class="section-icon">🎯</div>
							<h2 class="section-title">Motion</h2>
						</div>
						<div class="cards-row">
							<Vector3D
								title="Accelerometer"
								data={senseHatStore.sensorData.accelerometer}
								icon="🚀"
								variant="success"
							/>
							<Vector3D
								title="Gyroscope"
								data={senseHatStore.sensorData.gyroscope}
								icon="🔄"
								variant="primary"
							/>
							<Vector3D
								title="Magnetometer"
								data={senseHatStore.sensorData.magnetometer}
								icon="🧲"
								variant="secondary"
							/>
						</div>
					</div>

					<!-- LED Matrix Section -->
					<div class="section-group">
						<LedMatrix />
					</div>

					<!-- Footer -->
					<div class="footer-info">
						<div class="update-badge">
							<span class="update-label">Last sync</span>
							<span class="update-time">{formatTimestamp(senseHatStore.sensorData.timestamp)}</span>
						</div>
					</div>
				</div>
			{:else}
				<div class="loading-state" in:fade={{ duration: 400 }}>
					<div class="loading-spinner"></div>
					<p class="loading-title">Connecting to SenseHat</p>
					<p class="loading-subtitle">Establishing WebSocket connection...</p>
				</div>
			{/if}
		</main>
	</div>
</div>

<style>
	.dashboard-container {
		position: fixed;
		inset: 0;
		background: #0a0a0f;
		overflow: hidden;
	}

	/* Animated Mesh Gradient */
	.mesh-gradient {
		position: absolute;
		inset: 0;
		background:
			radial-gradient(ellipse at 20% 20%, rgba(56, 189, 248, 0.15) 0%, transparent 50%),
			radial-gradient(ellipse at 80% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
			radial-gradient(ellipse at 50% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%);
		animation: meshMove 20s ease-in-out infinite;
	}

	@keyframes meshMove {
		0%, 100% { transform: translate(0, 0) scale(1); }
		33% { transform: translate(2%, -2%) scale(1.02); }
		66% { transform: translate(-2%, 2%) scale(0.98); }
	}

	/* Grid Pattern */
	.grid-pattern {
		position: absolute;
		inset: 0;
		background-image:
			linear-gradient(rgba(56, 189, 248, 0.03) 1px, transparent 1px),
			linear-gradient(90deg, rgba(56, 189, 248, 0.03) 1px, transparent 1px);
		background-size: 50px 50px;
		mask-image: radial-gradient(ellipse at center, black 40%, transparent 80%);
	}

	.content-wrapper {
		position: relative;
		height: 100%;
		display: flex;
		flex-direction: column;
		overflow-y: auto;
		padding: 1.5rem;
		scrollbar-width: thin;
		scrollbar-color: rgba(56, 189, 248, 0.3) transparent;
	}

	.content-wrapper::-webkit-scrollbar {
		width: 6px;
	}

	.content-wrapper::-webkit-scrollbar-track {
		background: transparent;
	}

	.content-wrapper::-webkit-scrollbar-thumb {
		background: rgba(56, 189, 248, 0.3);
		border-radius: 3px;
	}

	.content-wrapper::-webkit-scrollbar-thumb:hover {
		background: rgba(56, 189, 248, 0.5);
	}

	/* Header */
	.header {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.logo-section {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.logo-icon {
		width: 2.5rem;
		height: 2.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.5rem;
		background: linear-gradient(135deg, #38bdf8, #3b82f6);
		border-radius: 0.75rem;
		box-shadow: 0 0 20px rgba(56, 189, 248, 0.4);
	}

	.logo-text {
		font-size: 1.75rem;
		font-weight: 700;
		background: linear-gradient(135deg, #38bdf8, #3b82f6);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		letter-spacing: -0.02em;
	}

	.status-section {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.status-badge {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: rgba(15, 23, 42, 0.6);
		backdrop-filter: blur(12px);
		border: 1px solid rgba(56, 189, 248, 0.2);
		border-radius: 9999px;
		font-size: 0.875rem;
		font-weight: 600;
		color: #e2e8f0;
	}

	.status-dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		background: #10b981;
	}

	.status-badge.connected .status-dot {
		background: #10b981;
		box-shadow: 0 0 10px #10b981;
		animation: pulse 2s ease-in-out infinite;
	}

	.status-badge.disconnected .status-dot {
		background: #ef4444;
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.6; }
	}

	.hw-badge {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: rgba(15, 23, 42, 0.4);
		backdrop-filter: blur(12px);
		border: 1px solid rgba(100, 116, 139, 0.2);
		border-radius: 9999px;
		font-size: 0.875rem;
		color: #cbd5e1;
	}

	.hw-icon {
		font-size: 1rem;
	}

	.error-banner {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1.25rem;
		background: rgba(239, 68, 68, 0.1);
		backdrop-filter: blur(12px);
		border: 1px solid rgba(239, 68, 68, 0.3);
		border-radius: 0.75rem;
		color: #fca5a5;
		font-size: 0.875rem;
	}

	.error-icon {
		font-size: 1.25rem;
	}

	/* Main Content */
	.main-content {
		flex: 1;
		max-width: 1400px;
		margin: 0 auto;
		width: 100%;
	}

	.sensors-grid {
		display: flex;
		flex-direction: column;
		gap: 2.5rem;
	}

	.section-group {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.section-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0 0.25rem;
	}

	.section-icon {
		font-size: 1.5rem;
		filter: drop-shadow(0 0 8px rgba(56, 189, 248, 0.4));
	}

	.section-title {
		font-size: 1.25rem;
		font-weight: 700;
		color: #f1f5f9;
		letter-spacing: -0.02em;
	}

	.cards-row {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1.25rem;
	}

	.footer-info {
		display: flex;
		justify-content: center;
		padding: 1.5rem 0;
	}

	.update-badge {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.625rem 1.25rem;
		background: rgba(15, 23, 42, 0.4);
		backdrop-filter: blur(12px);
		border: 1px solid rgba(56, 189, 248, 0.15);
		border-radius: 9999px;
		font-size: 0.8125rem;
	}

	.update-label {
		color: #94a3b8;
		font-weight: 500;
	}

	.update-time {
		color: #cbd5e1;
		font-weight: 600;
		font-family: 'SF Mono', 'Monaco', 'Cascadia Code', monospace;
	}

	/* Loading State */
	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 60vh;
		gap: 1.5rem;
	}

	.loading-spinner {
		width: 4rem;
		height: 4rem;
		border: 3px solid rgba(56, 189, 248, 0.2);
		border-top-color: #38bdf8;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.loading-title {
		font-size: 1.5rem;
		font-weight: 700;
		color: #f1f5f9;
	}

	.loading-subtitle {
		font-size: 0.875rem;
		color: #64748b;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.content-wrapper {
			padding: 1rem;
		}

		.logo-text {
			font-size: 1.5rem;
		}

		.logo-icon {
			width: 2rem;
			height: 2rem;
			font-size: 1.25rem;
		}

		.cards-row {
			grid-template-columns: 1fr;
		}

		.section-title {
			font-size: 1.125rem;
		}
	}
</style>
