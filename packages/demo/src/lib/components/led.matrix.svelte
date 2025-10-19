<script lang="ts">
	import { senseHatStore } from '$lib/stores/sensehat.svelte'

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
</script>

<div class="led-container">
	<div class="led-header">
		<div class="section-icon">💡</div>
		<h2 class="section-title">LED Matrix Control</h2>
	</div>

	<div class="led-content">
		<!-- Color Picker -->
		<div class="control-group">
			<label class="control-label">
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
					class="color-picker"
				/>
			</label>
			<div class="color-preview" style="background: {rgbToHex(selectedColor.r, selectedColor.g, selectedColor.b)}"></div>
		</div>

		<!-- 8x8 LED Grid -->
		<div class="led-grid">
			{#each Array(8) as _, y}
				{#each Array(8) as _, x}
					<button
						class="led-pixel"
						style="background-color: {getPixelColor(x, y)}"
						onclick={() => handlePixelClick(x, y)}
						aria-label="Pixel {x},{y}"
					></button>
				{/each}
			{/each}
		</div>

		<!-- Control Buttons -->
		<div class="button-group">
			<button class="btn btn-primary" onclick={applyGrid}>Apply Grid</button>
			<button class="btn btn-secondary" onclick={clearMatrix}>Clear</button>
		</div>

		<!-- Message Scroll -->
		<div class="message-group">
			<h3 class="subsection-title">Scrolling Message</h3>
			<div class="input-row">
				<input
					type="text"
					bind:value={messageText}
					placeholder="Enter message..."
					class="text-input"
				/>
				<label class="speed-label">
					<span>Speed</span>
					<input
						type="number"
						bind:value={scrollSpeed}
						min="0.01"
						max="1"
						step="0.01"
						class="speed-input"
					/>
				</label>
			</div>
			<button class="btn btn-success" onclick={showScrollingMessage}>Show Message</button>
		</div>
	</div>
</div>

<style>
	.led-container {
		background: rgba(15, 23, 42, 0.6);
		backdrop-filter: blur(12px);
		border: 1px solid rgba(56, 189, 248, 0.2);
		border-radius: 1rem;
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.led-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
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
		margin: 0;
	}

	.led-content {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		align-items: center;
	}

	.control-group {
		display: flex;
		align-items: center;
		gap: 1rem;
		width: 100%;
		max-width: 400px;
	}

	.control-label {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		color: #cbd5e1;
		font-size: 0.875rem;
		font-weight: 600;
	}

	.color-picker {
		width: 4rem;
		height: 2.5rem;
		border: 2px solid rgba(56, 189, 248, 0.3);
		border-radius: 0.5rem;
		cursor: pointer;
		background: transparent;
	}

	.color-preview {
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 0.5rem;
		border: 2px solid rgba(56, 189, 248, 0.3);
		box-shadow: 0 0 10px rgba(56, 189, 248, 0.2);
	}

	.led-grid {
		display: grid;
		grid-template-columns: repeat(8, 1fr);
		gap: 0.375rem;
		padding: 1rem;
		background: rgba(10, 10, 15, 0.8);
		border-radius: 0.75rem;
		border: 2px solid rgba(56, 189, 248, 0.3);
		box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.5);
	}

	.led-pixel {
		width: 2.5rem;
		height: 2.5rem;
		border: 1px solid rgba(100, 116, 139, 0.3);
		border-radius: 0.25rem;
		cursor: pointer;
		transition: all 0.15s ease;
		background-color: #000;
	}

	.led-pixel:hover {
		transform: scale(1.1);
		border-color: rgba(56, 189, 248, 0.6);
		box-shadow: 0 0 10px rgba(56, 189, 248, 0.4);
	}

	.button-group {
		display: flex;
		gap: 1rem;
		width: 100%;
		max-width: 400px;
	}

	.btn {
		flex: 1;
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}

	.btn-primary {
		background: linear-gradient(135deg, #38bdf8, #3b82f6);
		color: white;
	}

	.btn-primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 12px rgba(56, 189, 248, 0.4);
	}

	.btn-secondary {
		background: rgba(100, 116, 139, 0.3);
		color: #cbd5e1;
		border: 1px solid rgba(100, 116, 139, 0.4);
	}

	.btn-secondary:hover {
		background: rgba(100, 116, 139, 0.4);
		border-color: rgba(100, 116, 139, 0.6);
	}

	.btn-success {
		background: linear-gradient(135deg, #10b981, #059669);
		color: white;
		width: 100%;
		max-width: 400px;
	}

	.btn-success:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 12px rgba(16, 185, 129, 0.4);
	}

	.message-group {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		width: 100%;
		max-width: 400px;
		padding-top: 1rem;
		border-top: 1px solid rgba(56, 189, 248, 0.2);
	}

	.subsection-title {
		font-size: 1rem;
		font-weight: 600;
		color: #f1f5f9;
		margin: 0;
	}

	.input-row {
		display: flex;
		gap: 0.75rem;
		align-items: center;
	}

	.text-input {
		flex: 1;
		padding: 0.75rem;
		background: rgba(15, 23, 42, 0.6);
		border: 1px solid rgba(56, 189, 248, 0.3);
		border-radius: 0.5rem;
		color: #f1f5f9;
		font-size: 0.875rem;
		outline: none;
		transition: border-color 0.2s ease;
	}

	.text-input:focus {
		border-color: rgba(56, 189, 248, 0.6);
		box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.1);
	}

	.text-input::placeholder {
		color: #64748b;
	}

	.speed-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: #cbd5e1;
		font-size: 0.875rem;
		font-weight: 600;
		white-space: nowrap;
	}

	.speed-input {
		width: 5rem;
		padding: 0.5rem;
		background: rgba(15, 23, 42, 0.6);
		border: 1px solid rgba(56, 189, 248, 0.3);
		border-radius: 0.5rem;
		color: #f1f5f9;
		font-size: 0.875rem;
		outline: none;
	}

	.speed-input:focus {
		border-color: rgba(56, 189, 248, 0.6);
	}

	/* Responsive */
	@media (max-width: 768px) {
		.led-grid {
			gap: 0.25rem;
			padding: 0.75rem;
		}

		.led-pixel {
			width: 2rem;
			height: 2rem;
		}

		.input-row {
			flex-direction: column;
			align-items: stretch;
		}

		.speed-label {
			justify-content: space-between;
		}
	}
</style>
