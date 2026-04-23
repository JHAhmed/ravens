/**
 * Matrix generation orchestrator.
 *
 * generateMatrix(gridSize, selectedRuleIds) → { grid, answer, options, correctIndex }
 * matrixToSVG(grid, gridSize)               → standalone SVG string for download
 *
 * Supports mixed-symbol rows: when 2+ attribute rules are selected,
 * each row can have 2 shapes with independent rule application.
 */

import { ALL_RULES } from './rules.js';
import { SHAPE_TYPES, FILL_TYPES, ROTATION_SAFE_SHAPES, SIZE_MAP, elementToSVGString } from './shapes.js';
import { getElementPositions } from './rules.js';

// ── helpers ──────────────────────────────────────────────────────────

function shuffleArray(arr) {
	const a = [...arr];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

function deepClone(obj) {
	return JSON.parse(JSON.stringify(obj));
}

function randomChoice(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

// ── grid initialisation ─────────────────────────────────────────────

const STRUCTURAL_IDS = new Set([
	'set_or',
	'set_and',
	'set_xor',
	'set_subtract',
	'incremental_count'
]);

/**
 * Create the default grid (1 element per cell).
 * Each row gets a distinct shape; fills vary per row.
 * Rotationally-symmetric shapes are excluded when rotation is among the selected rules.
 */
function createDefaultGrid(gridSize, selectedRuleIds) {
	let availableShapes = [...SHAPE_TYPES];
	if (selectedRuleIds.includes('rotation')) {
		availableShapes = availableShapes.filter((s) => ROTATION_SAFE_SHAPES.includes(s));
	}
	const shapes = shuffleArray(availableShapes).slice(0, gridSize);
	const fills = shuffleArray([...FILL_TYPES]);

	return Array.from({ length: gridSize }, (_, r) =>
		Array.from({ length: gridSize }, () => [
			{
				shape: shapes[r % shapes.length],
				fill: fills[r % fills.length],
				size: 'medium',
				rotation: 0,
				x: 0.5,
				y: 0.5
			}
		])
	);
}

/**
 * Create a mixed-symbol grid (2 elements per cell).
 * Each row gets 2 different shapes positioned side by side.
 * Rules are applied per-element: rule[0] → element 0, rule[1] → element 1.
 */
function createMixedGrid(gridSize, selectedRuleIds) {
	let availableShapes = [...SHAPE_TYPES];
	if (selectedRuleIds.includes('rotation')) {
		availableShapes = availableShapes.filter((s) => ROTATION_SAFE_SHAPES.includes(s));
	}

	// We need 2 distinct shapes per row, so need at least 2 * gridSize shapes
	// If not enough, we cycle
	const shuffled = shuffleArray(availableShapes);
	const fills = shuffleArray([...FILL_TYPES]);
	const positions = getElementPositions(2);

	return Array.from({ length: gridSize }, (_, r) => {
		const shape1 = shuffled[r % shuffled.length];
		const shape2 = shuffled[(r + 1) % shuffled.length];
		// Ensure distinct shapes
		const finalShape2 = shape2 === shape1
			? shuffled[(r + 2) % shuffled.length] || 'star'
			: shape2;

		return Array.from({ length: gridSize }, () => [
			{
				shape: shape1,
				fill: fills[r % fills.length],
				size: 'medium',
				rotation: 0,
				x: positions[0].x,
				y: positions[0].y
			},
			{
				shape: finalShape2,
				fill: fills[(r + 1) % fills.length],
				size: 'medium',
				rotation: 0,
				x: positions[1].x,
				y: positions[1].y
			}
		]);
	});
}

/**
 * Determine if we should use mixed-symbol mode.
 * Mixed symbols activate when there are 2+ non-structural attribute rules.
 */
function shouldUseMixedGrid(rules) {
	const attribute = rules.filter((r) => !STRUCTURAL_IDS.has(r.id));
	return attribute.length >= 2;
}

// ── distractor generation ────────────────────────────────────────────

function createDistractors(answer, grid, gridSize) {
	const distractors = [];
	const answerStr = JSON.stringify(answer);

	const tryPush = (d) => {
		const s = JSON.stringify(d);
		if (s !== answerStr && !distractors.some((x) => JSON.stringify(x) === s)) {
			distractors.push(d);
		}
	};

	const isMixed = answer.length >= 2;

	if (isMixed) {
		// ── Mixed-symbol distractors ──────────────────────────────

		// Type 1: Swap rule effects between elements
		// (the two shapes have each other's attributes)
		const d1 = deepClone(answer);
		const tmpSize = d1[0].size;
		const tmpRot = d1[0].rotation;
		d1[0].size = d1[1].size;
		d1[0].rotation = d1[1].rotation;
		d1[1].size = tmpSize;
		d1[1].rotation = tmpRot;
		tryPush(d1);

		// Type 2: Wrong step in progression for element 0
		const d2 = deepClone(answer);
		const sizes = ['small', 'medium', 'large'];
		const curSizeIdx = sizes.indexOf(d2[0].size);
		d2[0].size = sizes[(curSizeIdx + 1) % sizes.length];
		tryPush(d2);

		// Type 3: Wrong rotation for element 1
		const d3 = deepClone(answer);
		d3[1].rotation = (d3[1].rotation + 45) % 360;
		tryPush(d3);

		// Type 4: Wrong shape for element 0
		const d4 = deepClone(answer);
		const otherShapes0 = SHAPE_TYPES.filter((s) => s !== answer[0].shape);
		d4[0].shape = randomChoice(otherShapes0);
		tryPush(d4);

		// Type 5: Wrong fill for element 1
		const d5 = deepClone(answer);
		const otherFills1 = FILL_TYPES.filter((f) => f !== answer[1].fill);
		d5[1].fill = randomChoice(otherFills1);
		tryPush(d5);

		// Type 6: Both elements have wrong size (off by one)
		const d6 = deepClone(answer);
		for (const el of d6) {
			const idx = sizes.indexOf(el.size);
			el.size = sizes[Math.max(0, idx - 1)];
		}
		tryPush(d6);

		// Type 7: Element 0 gets element 1's shape (both same shape)
		const d7 = deepClone(answer);
		d7[0].shape = d7[1].shape;
		tryPush(d7);

	} else if (answer.length > 0) {
		// ── Single-symbol distractors (original logic, improved) ──

		// wrong shape
		const d1 = deepClone(answer);
		const otherShapes = SHAPE_TYPES.filter((s) => s !== answer[0].shape);
		d1[0].shape = randomChoice(otherShapes);
		tryPush(d1);

		// wrong fill
		const d2 = deepClone(answer);
		const otherFills = FILL_TYPES.filter((f) => f !== answer[0].fill);
		d2[0].fill = randomChoice(otherFills);
		tryPush(d2);

		// wrong rotation
		const d3 = deepClone(answer);
		d3[0].rotation = (d3[0].rotation + 45) % 360;
		tryPush(d3);

		// wrong size
		const d4 = deepClone(answer);
		const sizes = ['small', 'medium', 'large'];
		const otherSizes = sizes.filter((s) => s !== answer[0].size);
		d4[0].size = randomChoice(otherSizes);
		tryPush(d4);

		// wrong shape variant 2
		const d5 = deepClone(answer);
		const otherShapes2 = SHAPE_TYPES.filter((s) => s !== answer[0].shape && s !== d1[0]?.shape);
		if (otherShapes2.length) d5[0].shape = randomChoice(otherShapes2);
		tryPush(d5);
	}

	// copy from an earlier row
	for (let r = 0; r < gridSize - 1 && distractors.length < 5; r++) {
		const cell = grid[r][gridSize - 1];
		if (cell) tryPush(deepClone(cell));
	}

	// copy from an earlier column in the answer row
	for (let c = 0; c < gridSize - 1 && distractors.length < 5; c++) {
		const cell = grid[gridSize - 1][c];
		if (cell) tryPush(deepClone(cell));
	}

	// pad with rotation variants if still short
	let offset = 1;
	while (distractors.length < 5 && answer.length > 0) {
		const d = deepClone(answer);
		d[0].rotation = (d[0].rotation + offset * 90) % 360;
		tryPush(d);
		offset++;
		if (offset > 8) break; // safety
	}

	return distractors.slice(0, 5);
}

// ── public API ───────────────────────────────────────────────────────

/**
 * Generate a complete Raven's matrix.
 *
 * @param {number} gridSize  3 | 4 | 5
 * @param {string[]} selectedRuleIds  rule id strings
 * @returns {{ grid: Array, answer: object[], options: object[][], correctIndex: number }}
 */
export function generateMatrix(gridSize, selectedRuleIds) {
	const rules = selectedRuleIds.map((id) => ALL_RULES.find((r) => r.id === id)).filter(Boolean);

	const structural = rules.filter((r) => STRUCTURAL_IDS.has(r.id));
	const attribute = rules.filter((r) => !STRUCTURAL_IDS.has(r.id));

	// sort attribute rules: shape → fill → other
	const priority = { shape: 0, fill: 1, size: 2, rotation: 3, position: 4 };
	attribute.sort((a, b) => (priority[a.modifies] ?? 99) - (priority[b.modifies] ?? 99));

	const useMixed = structural.length === 0 && shouldUseMixedGrid(rules);

	// 1. build grid
	let grid;
	if (structural.length > 0) {
		grid = createDefaultGrid(gridSize, selectedRuleIds); // seed shapes/fills
		structural[0].apply(grid, gridSize);
	} else if (useMixed) {
		grid = createMixedGrid(gridSize, selectedRuleIds);
	} else {
		grid = createDefaultGrid(gridSize, selectedRuleIds);
	}

	// 2. apply attribute rules
	if (useMixed && attribute.length >= 2) {
		// Assign rules to elements: rule 0 → element 0, rule 1 → element 1
		// Any additional rules (rule 2+) apply to all elements
		attribute[0].apply(grid, gridSize, 0);
		attribute[1].apply(grid, gridSize, 1);
		for (let i = 2; i < attribute.length; i++) {
			attribute[i].apply(grid, gridSize);
		}
	} else {
		for (const rule of attribute) {
			rule.apply(grid, gridSize);
		}
	}

	// 3. extract & clone answer before we null it
	const answer = deepClone(grid[gridSize - 1][gridSize - 1]);

	// 4. distractors
	const distractors = createDistractors(answer, grid, gridSize);

	// 5. shuffle options
	const allOptions = [answer, ...distractors];
	const indices = shuffleArray([...Array(allOptions.length).keys()]);
	const options = indices.map((i) => allOptions[i]);
	const correctIndex = indices.indexOf(0);

	// 6. mark missing cell
	grid[gridSize - 1][gridSize - 1] = null;

	return { grid, answer, options, correctIndex };
}

// ── SVG export ───────────────────────────────────────────────────────

/**
 * Render the matrix grid to a self-contained SVG string (for download).
 * The missing cell is shown with dashed border and "?".
 * Uses light theme (black on white) for printing.
 */
export function matrixToSVG(grid, gridSize, cellSize = 150) {
	const gap = 3;
	const pad = 6;
	const total = gridSize * cellSize + (gridSize - 1) * gap + pad * 2;

	const parts = [];
	parts.push(
		`<svg xmlns="http://www.w3.org/2000/svg" width="${total}" height="${total}" viewBox="0 0 ${total} ${total}">`
	);

	// defs
	parts.push(`<defs>`);
	parts.push(
		`<pattern id="stripes" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">`
	);
	parts.push(`<rect width="3" height="8" fill="black"/>`);
	parts.push(`</pattern>`);
	parts.push(`</defs>`);

	// white bg
	parts.push(`<rect width="${total}" height="${total}" fill="white"/>`);

	for (let r = 0; r < gridSize; r++) {
		for (let c = 0; c < gridSize; c++) {
			const x = pad + c * (cellSize + gap);
			const y = pad + r * (cellSize + gap);
			const cell = grid[r][c];

			if (cell === null) {
				parts.push(
					`<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="white" stroke="#999" stroke-width="2" stroke-dasharray="8,4"/>`
				);
				parts.push(
					`<text x="${x + cellSize / 2}" y="${y + cellSize * 0.58}" text-anchor="middle" font-size="${cellSize * 0.28}" font-weight="600" fill="#aaa" font-family="system-ui,sans-serif">?</text>`
				);
			} else {
				parts.push(
					`<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="white" stroke="black" stroke-width="2"/>`
				);
				for (const el of cell) {
					const cx = x + el.x * cellSize;
					const cy = y + el.y * cellSize;
					const radius = (SIZE_MAP[el.size] || SIZE_MAP.medium) * (cellSize / 100);
					parts.push(elementToSVGString(el, cx, cy, radius, 'stripes'));
				}
			}
		}
	}

	parts.push('</svg>');
	return parts.join('\n');
}
