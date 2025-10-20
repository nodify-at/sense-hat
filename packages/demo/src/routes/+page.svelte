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

<div class="fixed inset-0 bg-[#0a0a0f] overflow-hidden">
	<!-- Animated Mesh Gradient Background -->
	<div class="mesh-gradient absolute inset-0 animate-mesh-move"></div>

	<!-- Grid Pattern Overlay -->
	<div class="grid-pattern absolute inset-0 bg-[length:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" style="background-image: linear-gradient(rgba(56, 189, 248, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.03) 1px, transparent 1px)"></div>

	<!-- Content -->
	<div class="relative h-full flex flex-col overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-cyan-400/30 scrollbar-track-transparent">
		<!-- Compact Header -->
		<header class="flex flex-col gap-4 mb-8" in:fly={{ y: -30, duration: 800, easing: cubicOut }}>
			<div class="flex justify-between items-center flex-wrap gap-4">
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 flex items-center justify-center text-2xl bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl shadow-[0_0_20px_rgba(56,189,248,0.4)]">⚡</div>
					<h1 class="text-[1.75rem] font-bold bg-gradient-to-br from-cyan-400 to-blue-500 bg-clip-text text-transparent tracking-tight">SenseHat</h1>
				</div>

				<div class="flex items-center gap-3">
					<div class="flex items-center gap-2 px-4 py-2 bg-slate-900/60 backdrop-blur-xl border border-cyan-400/20 rounded-full text-sm font-semibold text-slate-200">
						<div class="w-2 h-2 rounded-full {senseHatStore.isConnected ? 'bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse' : 'bg-red-500'}"></div>
						<span>{senseHatStore.isConnected ? 'Live' : 'Offline'}</span>
					</div>

					{#if senseHatStore.connectionStatus}
						<div class="flex items-center gap-2 px-4 py-2 bg-slate-900/40 backdrop-blur-xl border border-slate-500/20 rounded-full text-sm text-slate-300" transition:scale={{ duration: 300 }}>
							<span class="text-base">{senseHatStore.connectionStatus ? '✓' : '✗'}</span>
							<span>Hardware</span>
						</div>
					{/if}
				</div>
			</div>

			{#if senseHatStore.error}
				<div class="flex items-center gap-3 px-5 py-3 bg-red-500/10 backdrop-blur-xl border border-red-500/30 rounded-xl text-red-300 text-sm" transition:fly={{ y: -10, duration: 300 }}>
					<span class="text-xl">⚠</span>
					<span>{senseHatStore.error}</span>
				</div>
			{/if}
		</header>

		<!-- Main Content -->
		<main class="flex-1 max-w-[1600px] mx-auto w-full">
			{#if senseHatStore.sensorData}
				<div class="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6" in:fade={{ duration: 600, delay: 200 }}>
					<!-- Left Column: LED Matrix Control -->
					<div class="flex flex-col gap-6">
						<LedMatrix />
					</div>

					<!-- Right Column: Sensor Data -->
					<div class="flex flex-col gap-6">
						<!-- Environmental Section -->
						<div class="flex flex-col gap-4">
							<div class="flex items-center gap-3 px-1">
								<div class="text-2xl" style="filter: drop-shadow(0 0 8px rgba(56, 189, 248, 0.4))">🌡</div>
								<h2 class="text-xl font-bold text-slate-100 tracking-tight">Environment</h2>
							</div>
							<div class="grid grid-cols-1 md:grid-cols-3 gap-5">
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
						<div class="flex flex-col gap-4">
							<div class="flex items-center gap-3 px-1">
								<div class="text-2xl" style="filter: drop-shadow(0 0 8px rgba(56, 189, 248, 0.4))">🎯</div>
								<h2 class="text-xl font-bold text-slate-100 tracking-tight">Motion</h2>
							</div>
							<div class="grid grid-cols-1 md:grid-cols-3 gap-5">
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
					</div>
				</div>
        <div class="flex justify-center">
          <div class="flex items-center gap-3 px-5 py-2.5 bg-slate-900/40 backdrop-blur-xl border border-cyan-400/15 rounded-full text-[0.8125rem]">
            <span class="text-slate-400 font-medium">Last sync</span>
            <span class="text-slate-300 font-semibold font-mono">{formatTimestamp(senseHatStore.sensorData.timestamp)}</span>
          </div>
        </div>
			{:else}
				<div class="flex flex-col items-center justify-center min-h-[60vh] gap-6" in:fade={{ duration: 400 }}>
					<div class="w-16 h-16 border-[3px] border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin"></div>
					<p class="text-2xl font-bold text-slate-100">Connecting to SenseHat</p>
					<p class="text-sm text-slate-500">Establishing WebSocket connection...</p>
				</div>
			{/if}
		</main>
	</div>
</div>

<style>
	.mesh-gradient {
		background:
			radial-gradient(ellipse at 20% 20%, rgba(56, 189, 248, 0.15) 0%, transparent 50%),
			radial-gradient(ellipse at 80% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
			radial-gradient(ellipse at 50% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%);
	}

	@keyframes meshMove {
		0%, 100% { transform: translate(0, 0) scale(1); }
		33% { transform: translate(2%, -2%) scale(1.02); }
		66% { transform: translate(-2%, 2%) scale(0.98); }
	}

	.animate-mesh-move {
		animation: meshMove 20s ease-in-out infinite;
	}

	/* Scrollbar styling */
	.scrollbar-thin::-webkit-scrollbar {
		width: 6px;
	}

	.scrollbar-thin::-webkit-scrollbar-track {
		background: transparent;
	}

	.scrollbar-thumb-cyan-400\/30::-webkit-scrollbar-thumb {
		background: rgba(56, 189, 248, 0.3);
		border-radius: 3px;
	}

	.scrollbar-thumb-cyan-400\/30::-webkit-scrollbar-thumb:hover {
		background: rgba(56, 189, 248, 0.5);
	}

	/* Responsive */
	@media (max-width: 768px) {
		:global(.relative.h-full.flex.flex-col) {
			padding: 1rem;
		}

		:global(h1.text-\[1\.75rem\]) {
			font-size: 1.5rem;
		}

		:global(.w-10.h-10.flex.items-center.justify-center) {
			width: 2rem;
			height: 2rem;
			font-size: 1.25rem;
		}

		:global(h2.text-xl) {
			font-size: 1.125rem;
		}
	}
</style>
