/**
 * Rule definitions and application logic for Raven's Matrix generation.
 *
 * Each rule has:
 *   id, name, category, description, modifies (property),
 *   conflictsWith (array of rule ids), gridSizes (allowed grid sizes),
 *   apply(grid, gridSize) – mutates grid cells in place.
 */

import { SHAPE_TYPES, FILL_TYPES, getSizesForGrid } from './shapes.js';

// ── helpers ──────────────────────────────────────────────────────────

function shuffleArray(arr) {
	const a = [...arr];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

function randomChoice(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Build a random Latin square of size n via cyclic construction + shuffling.
 */
function generateLatinSquare(n) {
	// cyclic base
	const base = Array.from({ length: n }, (_, r) =>
		Array.from({ length: n }, (_, c) => (r + c) % n)
	);
	const rowPerm = shuffleArray([...Array(n).keys()]);
	const colPerm = shuffleArray([...Array(n).keys()]);
	const labelPerm = shuffleArray([...Array(n).keys()]);

	const result = Array.from({ length: n }, () => new Array(n));
	for (let r = 0; r < n; r++) {
		for (let c = 0; c < n; c++) {
			result[r][c] = labelPerm[base[rowPerm[r]][colPerm[c]]];
		}
	}
	return result;
}

/**
 * Return nicely-spaced positions for `count` elements inside a 0-1 cell.
 */
function getElementPositions(count) {
	if (count === 1) return [{ x: 0.5, y: 0.5 }];
	if (count === 2)
		return [
			{ x: 0.35, y: 0.5 },
			{ x: 0.65, y: 0.5 }
		];
	if (count === 3)
		return [
			{ x: 0.5, y: 0.28 },
			{ x: 0.3, y: 0.68 },
			{ x: 0.7, y: 0.68 }
		];
	if (count === 4)
		return [
			{ x: 0.32, y: 0.32 },
			{ x: 0.68, y: 0.32 },
			{ x: 0.32, y: 0.68 },
			{ x: 0.68, y: 0.68 }
		];
	if (count === 5)
		return [
			{ x: 0.5, y: 0.22 },
			{ x: 0.26, y: 0.46 },
			{ x: 0.74, y: 0.46 },
			{ x: 0.32, y: 0.74 },
			{ x: 0.68, y: 0.74 }
		];
	// generic grid for 6+
	const cols = Math.ceil(Math.sqrt(count));
	const rows = Math.ceil(count / cols);
	const out = [];
	for (let i = 0; i < count; i++) {
		const row = Math.floor(i / cols);
		const col = i % cols;
		out.push({
			x: 0.2 + (col * 0.6) / Math.max(cols - 1, 1),
			y: 0.2 + (row * 0.6) / Math.max(rows - 1, 1)
		});
	}
	return out;
}

// ── rule categories ──────────────────────────────────────────────────

export const RULE_CATEGORIES = {
	geometric: { name: 'Geometric Transformations' },
	setLogic: { name: 'Set Logic' },
	distribution: { name: 'Distribution & Permutation' },
	arithmetic: { name: 'Arithmetic & Quantitative' }
};

// ── apply functions ──────────────────────────────────────────────────

function applyRotation(grid, gridSize) {
	const increment = randomChoice([45, 90, 120]);
	for (let r = 0; r < gridSize; r++) {
		for (let c = 0; c < gridSize; c++) {
			for (const el of grid[r][c]) {
				el.rotation = (el.rotation || 0) + c * increment;
			}
		}
	}
}

function applySizeProgression(grid, gridSize) {
	const sizes = getSizesForGrid(gridSize);
	for (let r = 0; r < gridSize; r++) {
		for (let c = 0; c < gridSize; c++) {
			for (const el of grid[r][c]) {
				el.size = sizes[c];
			}
		}
	}
}

function applyTranslation(grid, gridSize) {
	const patterns = [
		// diagonal ↘
		Array.from({ length: gridSize }, (_, i) => ({
			x: 0.2 + (0.6 * i) / Math.max(gridSize - 1, 1),
			y: 0.2 + (0.6 * i) / Math.max(gridSize - 1, 1)
		})),
		// diagonal ↗
		Array.from({ length: gridSize }, (_, i) => ({
			x: 0.8 - (0.6 * i) / Math.max(gridSize - 1, 1),
			y: 0.2 + (0.6 * i) / Math.max(gridSize - 1, 1)
		})),
		// horizontal sweep
		Array.from({ length: gridSize }, (_, i) => ({
			x: 0.2 + (0.6 * i) / Math.max(gridSize - 1, 1),
			y: 0.5
		}))
	];
	const positions = randomChoice(patterns);
	for (let r = 0; r < gridSize; r++) {
		for (let c = 0; c < gridSize; c++) {
			for (const el of grid[r][c]) {
				el.x = positions[c].x;
				el.y = positions[c].y;
			}
		}
	}
}

// ── set logic (3×3 only) ─────────────────────────────────────────────

function applySetLogic(grid, gridSize, operation) {
	const subGrid = 3; // 3×3 sub-positions inside each cell
	const allPositions = [];
	for (let sy = 0; sy < subGrid; sy++) {
		for (let sx = 0; sx < subGrid; sx++) {
			allPositions.push({ x: 0.2 + sx * 0.3, y: 0.2 + sy * 0.3 });
		}
	}

	const shapes = shuffleArray([...SHAPE_TYPES]).slice(0, gridSize);

	for (let r = 0; r < gridSize; r++) {
		const shape = shapes[r % shapes.length];

		// Generate random position sets for first two cells
		const numA = randomInt(2, 5);
		const numB = randomInt(2, 5);
		const setA = new Set(shuffleArray([...Array(9).keys()]).slice(0, numA));
		const setB = new Set(shuffleArray([...Array(9).keys()]).slice(0, numB));

		// compute result
		let setC;
		switch (operation) {
			case 'or':
				setC = new Set([...setA, ...setB]);
				break;
			case 'and':
				setC = new Set([...setA].filter((x) => setB.has(x)));
				if (setC.size === 0) {
					const common = [...setA][0];
					setB.add(common);
					setC = new Set([common]);
				}
				break;
			case 'xor':
				setC = new Set([
					...[...setA].filter((x) => !setB.has(x)),
					...[...setB].filter((x) => !setA.has(x))
				]);
				if (setC.size === 0) {
					for (let i = 0; i < 9; i++) {
						if (!setA.has(i) && !setB.has(i)) {
							setA.add(i);
							setC = new Set([i]);
							break;
						}
					}
				}
				break;
			case 'subtract':
				setC = new Set([...setA].filter((x) => !setB.has(x)));
				if (setC.size === 0) {
					for (let i = 0; i < 9; i++) {
						if (!setB.has(i)) {
							setA.add(i);
							setC = new Set([i]);
							break;
						}
					}
				}
				break;
		}

		const makeElements = (posSet) =>
			[...posSet].map((idx) => ({
				shape,
				fill: 'solid',
				size: 'small',
				rotation: 0,
				x: allPositions[idx].x,
				y: allPositions[idx].y
			}));

		grid[r][0] = makeElements(setA);
		grid[r][1] = makeElements(setB);
		grid[r][2] = makeElements(setC);
	}
}

function applySetOR(grid, gridSize) {
	applySetLogic(grid, gridSize, 'or');
}
function applySetAND(grid, gridSize) {
	applySetLogic(grid, gridSize, 'and');
}
function applySetXOR(grid, gridSize) {
	applySetLogic(grid, gridSize, 'xor');
}
function applySetSubtract(grid, gridSize) {
	applySetLogic(grid, gridSize, 'subtract');
}

// ── distribution ─────────────────────────────────────────────────────

function applyDistributionShape(grid, gridSize) {
	const available = shuffleArray([...SHAPE_TYPES]).slice(0, gridSize);
	const latin = generateLatinSquare(gridSize);
	for (let r = 0; r < gridSize; r++) {
		for (let c = 0; c < gridSize; c++) {
			for (const el of grid[r][c]) {
				el.shape = available[latin[r][c]];
			}
		}
	}
}

function applyConstantFill(grid, gridSize) {
	const fills = shuffleArray([...FILL_TYPES]);
	for (let r = 0; r < gridSize; r++) {
		const fill = fills[r % fills.length];
		for (let c = 0; c < gridSize; c++) {
			for (const el of grid[r][c]) {
				el.fill = fill;
			}
		}
	}
}

// ── arithmetic ───────────────────────────────────────────────────────

function applyIncrementalCount(grid, gridSize) {
	for (let r = 0; r < gridSize; r++) {
		const baseShape = grid[r][0]?.[0]?.shape || 'circle';
		const baseFill = grid[r][0]?.[0]?.fill || 'solid';

		for (let c = 0; c < gridSize; c++) {
			const count = c + 1;
			const positions = getElementPositions(count);
			grid[r][c] = positions.map((pos) => ({
				shape: baseShape,
				fill: baseFill,
				size: 'small',
				rotation: 0,
				x: pos.x,
				y: pos.y
			}));
		}
	}
}

function applyProgressiveComplexity(grid, gridSize) {
	const progressive = ['triangle', 'square', 'pentagon', 'hexagon', 'star'];
	const start = randomInt(0, Math.max(0, progressive.length - gridSize));
	for (let r = 0; r < gridSize; r++) {
		for (let c = 0; c < gridSize; c++) {
			for (const el of grid[r][c]) {
				el.shape = progressive[(start + c) % progressive.length];
			}
		}
	}
}

// ── exported rule list + helpers ─────────────────────────────────────

const SET_IDS = ['set_or', 'set_and', 'set_xor', 'set_subtract'];
const STRUCT_IDS = [...SET_IDS, 'incremental_count'];

export const ALL_RULES = [
	// Geometric
	{
		id: 'rotation',
		name: 'Rotation',
		category: 'geometric',
		description: 'Shape rotates by a fixed increment across columns',
		modifies: 'rotation',
		conflictsWith: [],
		gridSizes: [3, 4, 5],
		apply: applyRotation
	},
	{
		id: 'size_progression',
		name: 'Size Progression',
		category: 'geometric',
		description: 'Shape grows from small to large across columns',
		modifies: 'size',
		conflictsWith: [...SET_IDS, 'incremental_count'],
		gridSizes: [3, 4, 5],
		apply: applySizeProgression
	},
	{
		id: 'translation',
		name: 'Translation',
		category: 'geometric',
		description: 'Shape moves to different positions within cells',
		modifies: 'position',
		conflictsWith: [...STRUCT_IDS],
		gridSizes: [3, 4, 5],
		apply: applyTranslation
	},
	// Set Logic
	{
		id: 'set_or',
		name: 'Addition (OR)',
		category: 'setLogic',
		description: 'Third cell contains all elements from the first two',
		modifies: 'structure',
		conflictsWith: [
			'set_and',
			'set_xor',
			'set_subtract',
			'incremental_count',
			'size_progression',
			'translation',
			'distribution_shape',
			'progressive_complexity'
		],
		gridSizes: [3],
		apply: applySetOR
	},
	{
		id: 'set_and',
		name: 'Intersection (AND)',
		category: 'setLogic',
		description: 'Only elements in both first and second cells appear in third',
		modifies: 'structure',
		conflictsWith: [
			'set_or',
			'set_xor',
			'set_subtract',
			'incremental_count',
			'size_progression',
			'translation',
			'distribution_shape',
			'progressive_complexity'
		],
		gridSizes: [3],
		apply: applySetAND
	},
	{
		id: 'set_xor',
		name: 'XOR',
		category: 'setLogic',
		description: 'Elements in both cells are removed; only unique ones remain',
		modifies: 'structure',
		conflictsWith: [
			'set_or',
			'set_and',
			'set_subtract',
			'incremental_count',
			'size_progression',
			'translation',
			'distribution_shape',
			'progressive_complexity'
		],
		gridSizes: [3],
		apply: applySetXOR
	},
	{
		id: 'set_subtract',
		name: 'Subtraction',
		category: 'setLogic',
		description: 'Elements from first cell minus those in second cell',
		modifies: 'structure',
		conflictsWith: [
			'set_or',
			'set_and',
			'set_xor',
			'incremental_count',
			'size_progression',
			'translation',
			'distribution_shape',
			'progressive_complexity'
		],
		gridSizes: [3],
		apply: applySetSubtract
	},
	// Distribution
	{
		id: 'distribution_shape',
		name: 'Distribution of Three',
		category: 'distribution',
		description: 'Each row and column has one of each shape type',
		modifies: 'shape',
		conflictsWith: ['progressive_complexity', ...SET_IDS, 'incremental_count'],
		gridSizes: [3, 4, 5],
		apply: applyDistributionShape
	},
	{
		id: 'constant_fill',
		name: 'Constant Property',
		category: 'distribution',
		description: 'Fill stays constant within each row, varies between rows',
		modifies: 'fill',
		conflictsWith: [],
		gridSizes: [3, 4, 5],
		apply: applyConstantFill
	},
	// Arithmetic
	{
		id: 'incremental_count',
		name: 'Incremental Change',
		category: 'arithmetic',
		description: 'Number of elements increases by 1 in each step',
		modifies: 'count',
		conflictsWith: [...SET_IDS, 'size_progression', 'translation', 'distribution_shape'],
		gridSizes: [3, 4, 5],
		apply: applyIncrementalCount
	},
	{
		id: 'progressive_complexity',
		name: 'Progressive Complexity',
		category: 'arithmetic',
		description: 'Shape gains sides: triangle → square → pentagon → …',
		modifies: 'shape',
		conflictsWith: ['distribution_shape', ...SET_IDS],
		gridSizes: [3, 4, 5],
		apply: applyProgressiveComplexity
	}
];

/**
 * Check whether a set of rule ids is conflict-free.
 */
export function areRulesCompatible(ruleIds) {
	const rules = ruleIds.map((id) => ALL_RULES.find((r) => r.id === id)).filter(Boolean);
	for (let i = 0; i < rules.length; i++) {
		for (let j = i + 1; j < rules.length; j++) {
			if (
				rules[i].conflictsWith.includes(rules[j].id) ||
				rules[j].conflictsWith.includes(rules[i].id)
			) {
				return false;
			}
		}
	}
	return true;
}

/**
 * Would adding `newRuleId` to `existingIds` introduce a conflict?
 */
export function wouldConflict(existingIds, newRuleId) {
	return !areRulesCompatible([...existingIds, newRuleId]);
}
