<script>
	import {
		polygonPoints,
		starPoints,
		crossPath,
		SIZE_MAP,
		getFillValue,
		getStrokeWidth
	} from '$lib/engine/shapes.js';

	let { elements = [], size = 100, showRotationArrow = false } = $props();

	const patternId = `sp-${Math.random().toString(36).slice(2, 8)}`;
</script>

<svg width={size} height={size} viewBox="0 0 100 100">
	<defs>
		<pattern
			id={patternId}
			patternUnits="userSpaceOnUse"
			width="8"
			height="8"
			patternTransform="rotate(45)"
		>
			<rect width="3" height="8" fill="black" />
		</pattern>
	</defs>

	{#each elements as el}
		{@const cx = el.x * 100}
		{@const cy = el.y * 100}
		{@const radius = SIZE_MAP[el.size] || SIZE_MAP.medium}
		{@const fill = getFillValue(el.fill, patternId)}
		{@const stroke = '#000000'}
		{@const sw = getStrokeWidth(el.fill)}
		{@const rot = el.rotation || 0}

		<g transform="rotate({rot}, {cx}, {cy})">
			{#if el.shape === 'circle'}
				<circle {cx} {cy} r={radius} {fill} {stroke} stroke-width={sw} />
			{:else if el.shape === 'star'}
				<polygon
					points={starPoints(5, cx, cy, radius, radius * 0.4)}
					{fill}
					{stroke}
					stroke-width={sw}
				/>
			{:else if el.shape === 'cross'}
				<path
					d={crossPath(cx, cy, radius * 2, radius * 0.6)}
					{fill}
					{stroke}
					stroke-width={sw}
				/>
			{:else if el.shape === 'diamond'}
				<polygon
					points={polygonPoints(4, cx, cy, radius, 0)}
					{fill}
					{stroke}
					stroke-width={sw}
				/>
			{:else if el.shape === 'square'}
				<polygon
					points={polygonPoints(4, cx, cy, radius, 45)}
					{fill}
					{stroke}
					stroke-width={sw}
				/>
			{:else if el.shape === 'triangle'}
				<polygon
					points={polygonPoints(3, cx, cy, radius)}
					{fill}
					{stroke}
					stroke-width={sw}
				/>
			{:else if el.shape === 'pentagon'}
				<polygon
					points={polygonPoints(5, cx, cy, radius)}
					{fill}
					{stroke}
					stroke-width={sw}
				/>
			{:else if el.shape === 'hexagon'}
				<polygon
					points={polygonPoints(6, cx, cy, radius)}
					{fill}
					{stroke}
					stroke-width={sw}
				/>
			{/if}

			{#if showRotationArrow && rot !== 0}
				{@const arrowSize = Math.max(4, radius * 0.22)}
				{@const arrowY = cy - radius - arrowSize - 2}
				<polygon
					points="{cx},{arrowY - arrowSize} {cx - arrowSize * 0.7},{arrowY + arrowSize * 0.3} {cx + arrowSize * 0.7},{arrowY + arrowSize * 0.3}"
					fill="#d94040"
					stroke="none"
					opacity="0.85"
				/>
			{/if}
		</g>
	{/each}
</svg>
