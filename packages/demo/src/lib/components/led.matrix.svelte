<script lang="ts">
  import { senseHatStore } from "$lib/stores/sensehat.svelte";

  let selectedColor = $state({ r: 255, g: 0, b: 0 })
	let messageText = $state('')
	let scrollSpeed = $state(0.1)

	// Create an 8x8 grid state
	let grid = $state<number[][][]>(
		Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => [0, 0, 0]))
	)

	function handlePixelClick(x: number, y: number) {
		grid[y][x] = [selectedColor.r, selectedColor.g, selectedColor.b]
    senseHatStore.setPixel({x, y}, selectedColor)
	}

	function clearMatrix() {
		grid = Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => [0, 0, 0]))
		senseHatStore.clearLed()
	}

	function applyGrid() {
		// Convert grid to proper RGB object format
		const matrix = grid.map(row =>
			row.map(([r, g, b]) => ({ r, g, b }))
		)
		senseHatStore.setMatrix(matrix)
	}

	function showScrollingMessage() {
		if (messageText.trim()) {
			senseHatStore.showMessage(
				messageText,
				scrollSpeed,
				{ r: selectedColor.r, g: selectedColor.g, b: selectedColor.b }
			)
		}
	}

	function rgbToHex(r: number, g: number, b: number): string {
		return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
	}

	function getPixelColor(x: number, y: number): string {
		const [r, g, b] = grid[y][x]
		return rgbToHex(r, g, b)
	}

	// Gradient presets
	const gradients = [
		{ name: '🌅 Sunset', id: 'sunset' },
		{ name: '🌊 Ocean', id: 'ocean' },
		{ name: '🔥 Fire', id: 'fire' },
		{ name: '🌈 Rainbow', id: 'rainbow' },
		{ name: '💜 Purple Dream', id: 'purple' },
		{ name: '🌲 Forest', id: 'forest' },
		{ name: '🌸 Cherry Blossom', id: 'cherry' },
		{ name: '⚡ Electric', id: 'electric' }
	]

	function interpolateColor(color1: number[], color2: number[], factor: number): number[] {
		return [
			Math.round(color1[0] + (color2[0] - color1[0]) * factor),
			Math.round(color1[1] + (color2[1] - color1[1]) * factor),
			Math.round(color1[2] + (color2[2] - color1[2]) * factor)
		]
	}

	function applyGradient(gradientId: string) {
		const gradientMap: Record<string, number[][]> = {
			sunset: [[255, 100, 50], [255, 180, 100], [255, 220, 150]],
			ocean: [[0, 50, 100], [0, 120, 180], [100, 200, 255]],
			fire: [[255, 0, 0], [255, 100, 0], [255, 200, 0]],
			rainbow: [[255, 0, 0], [255, 127, 0], [255, 255, 0], [0, 255, 0], [0, 0, 255], [75, 0, 130], [148, 0, 211]],
			purple: [[75, 0, 130], [138, 43, 226], [218, 112, 214]],
			forest: [[0, 50, 0], [0, 100, 50], [50, 200, 100]],
			cherry: [[255, 182, 193], [255, 105, 180], [255, 20, 147]],
			electric: [[0, 255, 255], [0, 150, 255], [100, 50, 255]]
		}

		const colors = gradientMap[gradientId]
		if (!colors) return

		// Create gradient across the 8x8 grid
		for (let y = 0; y < 8; y++) {
			for (let x = 0; x < 8; x++) {
				// Calculate position factor (0 to 1) diagonally
				const factor = (x + y) / 14

				// Find which color segment we're in
				const segmentCount = colors.length - 1
				const segment = Math.min(Math.floor(factor * segmentCount), segmentCount - 1)
				const segmentFactor = (factor * segmentCount) - segment

				// Interpolate between the two colors
        grid[y][x] = interpolateColor(colors[segment], colors[segment + 1], segmentFactor)
			}
		}

		// Auto-apply the gradient to the hardware
		applyGrid()
	}
</script>

<div class="flex flex-col gap-6 bg-slate-900/60 backdrop-blur-xl border border-cyan-400/20 rounded-2xl p-6">
	<div class="flex items-center gap-3">
		<div class="text-2xl" style="filter: drop-shadow(0 0 8px rgba(56, 189, 248, 0.4))">💡</div>
		<h2 class="text-xl font-bold text-slate-100 tracking-tight">LED Matrix Control</h2>
	</div>

	<div class="flex flex-col gap-6 items-center">
		<!-- Color Picker -->
		<div class="flex items-center gap-4 w-full max-w-md">
			<label class="flex items-center gap-3 text-slate-300 text-sm font-semibold">
				<span>Pick Color</span>
				<input
					type="color"
					value={rgbToHex(selectedColor.r, selectedColor.g, selectedColor.b)}
					oninput={(e) => {
						const hex = e.currentTarget.value
						selectedColor.r = parseInt(hex.slice(1, 3), 16)
						selectedColor.g = parseInt(hex.slice(3, 5), 16)
						selectedColor.b = parseInt(hex.slice(5, 7), 16)
					}}
					class="w-16 h-10 border-2 border-cyan-400/30 rounded-lg cursor-pointer bg-transparent"
				/>
			</label>
			<div class="w-10 h-10 rounded-lg border-2 border-cyan-400/30 shadow-[0_0_10px_rgba(56,189,248,0.2)]" style="background: {rgbToHex(selectedColor.r, selectedColor.g, selectedColor.b)}"></div>
		</div>

		<!-- 8x8 LED Grid -->
		<div class="grid grid-cols-8 gap-1.5 p-4 bg-[#0a0a0f]/80 rounded-xl border-2 border-cyan-400/30 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
			{#each Array(8) as _, y}
				{#each Array(8) as _, x}
					<button
						class="w-10 h-10 border border-slate-500/30 rounded cursor-pointer transition-all duration-150 ease-out bg-black hover:scale-110 hover:border-cyan-400/60 hover:shadow-[0_0_10px_rgba(56,189,248,0.4)]"
						style="background-color: {getPixelColor(x, y)}"
						onclick={() => handlePixelClick(x, y)}
						aria-label="Pixel {x},{y}"
					></button>
				{/each}
			{/each}
		</div>

		<!-- Control Buttons -->
		<div class="flex gap-4 w-full max-w-md">
			<button class="flex-1 px-6 py-3 border-0 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 shadow-md bg-gradient-to-br from-cyan-400 to-blue-500 text-white hover:-translate-y-0.5 hover:shadow-[0_6px_12px_rgba(56,189,248,0.4)]" onclick={applyGrid}>Apply Grid</button>
			<button class="flex-1 px-6 py-3 border border-slate-500/40 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 shadow-md bg-slate-500/30 text-slate-300 hover:bg-slate-500/40 hover:border-slate-500/60" onclick={clearMatrix}>Clear</button>
		</div>

		<!-- Gradient Presets -->
		<div class="flex flex-col gap-4 w-full max-w-md pt-4 border-t border-cyan-400/20">
			<h3 class="text-base font-semibold text-slate-100 m-0">✨ Gradient Presets</h3>
			<div class="grid grid-cols-2 gap-2">
				{#each gradients as gradient}
					<button
						class="px-4 py-2.5 border-0 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-400/30 text-slate-200 hover:from-purple-500/30 hover:to-pink-500/30 hover:border-purple-400/50 hover:-translate-y-0.5 hover:shadow-lg"
						onclick={() => applyGradient(gradient.id)}
					>
						{gradient.name}
					</button>
				{/each}
			</div>
		</div>

		<!-- Message Scroll -->
		<div class="flex flex-col gap-4 w-full max-w-md pt-4 border-t border-cyan-400/20">
			<h3 class="text-base font-semibold text-slate-100 m-0">Scrolling Message</h3>
			<div class="flex gap-3 items-center max-md:flex-col max-md:items-stretch">
				<input
					type="text"
					bind:value={messageText}
					placeholder="Enter message..."
					class="flex-1 px-3 py-3 bg-slate-900/60 border border-cyan-400/30 rounded-lg text-slate-100 text-sm outline-none transition-[border-color] duration-200 placeholder:text-slate-500 focus:border-cyan-400/60 focus:shadow-[0_0_0_3px_rgba(56,189,248,0.1)]"
				/>
				<label class="flex items-center gap-2 text-slate-300 text-sm font-semibold whitespace-nowrap max-md:justify-between">
					<span>Speed</span>
					<input
						type="number"
						bind:value={scrollSpeed}
						min="0.01"
						max="1"
						step="0.01"
						class="w-20 px-2 py-2 bg-slate-900/60 border border-cyan-400/30 rounded-lg text-slate-100 text-sm outline-none focus:border-cyan-400/60"
					/>
				</label>
			</div>
			<button class="w-full max-w-md px-6 py-3 border-0 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 shadow-md bg-gradient-to-br from-emerald-500 to-emerald-600 text-white hover:-translate-y-0.5 hover:shadow-[0_6px_12px_rgba(16,185,129,0.4)]" onclick={showScrollingMessage}>Show Message</button>
		</div>
	</div>
</div>

