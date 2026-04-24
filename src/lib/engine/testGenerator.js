/**
 * Test generation — produces a 10-question test
 * (5 medium, 5 hard) from a numeric seed.
 *
 * Uses seeded randomness so the same seed always yields the same test.
 * Supports mixed-symbol rows for medium/hard questions.
 */

import { ALL_RULES, areRulesCompatible, getElementPositions } from './rules.js';
import { SHAPE_TYPES, FILL_TYPES, ROTATION_SAFE_SHAPES, SIZE_MAP } from './shapes.js';
import { createRng, seededShuffle, seededChoice, seededInt } from './seededRandom.js';

// ── Seeded helpers (mirror generator.js helpers but using rng) ───────

function deepClone(obj) {
	return JSON.parse(JSON.stringify(obj));
}

const STRUCTURAL_IDS = new Set([
	'set_or',
	'set_and',
	'set_xor',
	'set_subtract',
	'incremental_count'
]);

// ── Seeded grid creation ─────────────────────────────────────────────

function createDefaultGridSeeded(gridSize, selectedRuleIds, rng) {
	let availableShapes = [...SHAPE_TYPES];
	if (selectedRuleIds.includes('rotation')) {
		availableShapes = availableShapes.filter((s) => ROTATION_SAFE_SHAPES.includes(s));
	}
	const shapes = seededShuffle(availableShapes, rng).slice(0, gridSize);
	const fills = seededShuffle([...FILL_TYPES], rng);

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

function createMixedGridSeeded(gridSize, selectedRuleIds, rng) {
	let availableShapes = [...SHAPE_TYPES];
	if (selectedRuleIds.includes('rotation')) {
		availableShapes = availableShapes.filter((s) => ROTATION_SAFE_SHAPES.includes(s));
	}

	const shuffled = seededShuffle(availableShapes, rng);
	const fills = seededShuffle([...FILL_TYPES], rng);
	const positions = getElementPositions(2);

	return Array.from({ length: gridSize }, (_, r) => {
		const shape1 = shuffled[r % shuffled.length];
		const shape2 = shuffled[(r + 1) % shuffled.length];
		const finalShape2 = shape2 === shape1 ? shuffled[(r + 2) % shuffled.length] || 'star' : shape2;

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

function shouldUseMixedGrid(rules) {
	const attribute = rules.filter((r) => !STRUCTURAL_IDS.has(r.id));
	return attribute.length >= 2;
}

// ── Seeded distractor generation ─────────────────────────────────────

function createDistractorsSeeded(answer, grid, gridSize, rng) {
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
		// Type 1: Swap rule effects between elements
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
		d4[0].shape = seededChoice(otherShapes0, rng);
		tryPush(d4);

		// Type 5: Wrong fill for element 1
		const d5 = deepClone(answer);
		const otherFills1 = FILL_TYPES.filter((f) => f !== answer[1].fill);
		d5[1].fill = seededChoice(otherFills1, rng);
		tryPush(d5);

		// Type 6: Both elements have wrong size
		const d6 = deepClone(answer);
		for (const el of d6) {
			const idx = sizes.indexOf(el.size);
			el.size = sizes[Math.max(0, idx - 1)];
		}
		tryPush(d6);

		// Type 7: Element 0 gets element 1's shape
		const d7 = deepClone(answer);
		d7[0].shape = d7[1].shape;
		tryPush(d7);
	} else if (answer.length > 0) {
		const d1 = deepClone(answer);
		const otherShapes = SHAPE_TYPES.filter((s) => s !== answer[0].shape);
		d1[0].shape = seededChoice(otherShapes, rng);
		tryPush(d1);

		const d2 = deepClone(answer);
		const otherFills = FILL_TYPES.filter((f) => f !== answer[0].fill);
		d2[0].fill = seededChoice(otherFills, rng);
		tryPush(d2);

		const d3 = deepClone(answer);
		d3[0].rotation = (d3[0].rotation + 45) % 360;
		tryPush(d3);

		const d4 = deepClone(answer);
		const sizes = ['small', 'medium', 'large'];
		const otherSizes = sizes.filter((s) => s !== answer[0].size);
		d4[0].size = seededChoice(otherSizes, rng);
		tryPush(d4);

		const d5 = deepClone(answer);
		const otherShapes2 = SHAPE_TYPES.filter((s) => s !== answer[0].shape && s !== d1[0]?.shape);
		if (otherShapes2.length) d5[0].shape = seededChoice(otherShapes2, rng);
		tryPush(d5);
	}

	for (let r = 0; r < gridSize - 1 && distractors.length < 5; r++) {
		const cell = grid[r][gridSize - 1];
		if (cell) tryPush(deepClone(cell));
	}

	for (let c = 0; c < gridSize - 1 && distractors.length < 5; c++) {
		const cell = grid[gridSize - 1][c];
		if (cell) tryPush(deepClone(cell));
	}

	let offset = 1;
	while (distractors.length < 5 && answer.length > 0) {
		const d = deepClone(answer);
		d[0].rotation = (d[0].rotation + offset * 90) % 360;
		tryPush(d);
		offset++;
		if (offset > 8) break;
	}

	return distractors.slice(0, 5);
}

// ── size-only duplicate removal (seeded) ─────────────────────────────

function optionKeyWithoutSize(opt) {
	return JSON.stringify(
		opt.map((el) => {
			const { size, ...rest } = el;
			return rest;
		})
	);
}

function deduplicateSizeOnlySeeded(allOptions, rng) {
	const seen = new Map();
	for (let i = 0; i < allOptions.length; i++) {
		const key = optionKeyWithoutSize(allOptions[i]);
		if (seen.has(key)) {
			const target = i === 0 ? seen.get(key) : i;
			if (target === 0) continue;
			const d = deepClone(allOptions[target]);
			d[0].x = Math.min(0.8, d[0].x + 0.2);
			d[0].y = Math.min(0.8, d[0].y + 0.15);
			const otherFills = FILL_TYPES.filter((f) => f !== d[0].fill);
			if (otherFills.length) d[0].fill = seededChoice(otherFills, rng);
			allOptions[target] = d;
		} else {
			seen.set(key, i);
		}
	}
}

// ── Seeded matrix generation ─────────────────────────────────────────

/**
 * Generate a single matrix with seeded randomness.
 * We temporarily override Math.random for rules that use it internally.
 */
function generateMatrixSeeded(gridSize, selectedRuleIds, rng) {
	const rules = selectedRuleIds.map((id) => ALL_RULES.find((r) => r.id === id)).filter(Boolean);

	const structural = rules.filter((r) => STRUCTURAL_IDS.has(r.id));
	const attribute = rules.filter((r) => !STRUCTURAL_IDS.has(r.id));

	const priority = { shape: 0, fill: 1, size: 2, rotation: 3, position: 4 };
	attribute.sort((a, b) => (priority[a.modifies] ?? 99) - (priority[b.modifies] ?? 99));

	const useMixed = structural.length === 0 && shouldUseMixedGrid(rules);

	// Temporarily replace Math.random with our seeded version
	const originalRandom = Math.random;
	Math.random = rng;

	let grid;
	try {
		if (structural.length > 0) {
			grid = createDefaultGridSeeded(gridSize, selectedRuleIds, rng);
			structural[0].apply(grid, gridSize);
		} else if (useMixed) {
			grid = createMixedGridSeeded(gridSize, selectedRuleIds, rng);
		} else {
			grid = createDefaultGridSeeded(gridSize, selectedRuleIds, rng);
		}

		if (useMixed && attribute.length >= 2) {
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
	} finally {
		Math.random = originalRandom;
	}

	const answer = deepClone(grid[gridSize - 1][gridSize - 1]);
	const distractors = createDistractorsSeeded(answer, grid, gridSize, rng);

	const allRaw = [answer, ...distractors];
	deduplicateSizeOnlySeeded(allRaw, rng);

	const indices = seededShuffle([...Array(allRaw.length).keys()], rng);
	const options = indices.map((i) => allRaw[i]);
	const correctIndex = indices.indexOf(0);

	grid[gridSize - 1][gridSize - 1] = null;

	return { grid, answer, options, correctIndex };
}

// ── Pick compatible rules ────────────────────────────────────────────

function pickRulesSeeded(maxRules, gridSize, rng) {
	const available = ALL_RULES.filter((r) => r.gridSizes.includes(gridSize));
	const shuffled = seededShuffle(available, rng);
	const picked = [];

	for (const rule of shuffled) {
		if (picked.length >= maxRules) break;
		const candidate = [...picked.map((r) => r.id), rule.id];
		if (areRulesCompatible(candidate)) {
			picked.push(rule);
		}
	}

	return picked.map((r) => r.id);
}

// ── Public API ───────────────────────────────────────────────────────

/**
 * @typedef {Object} TestQuestion
 * @property {number} number        – 1-based question number
 * @property {'easy'|'medium'|'hard'} difficulty
 * @property {object} matrix        – { grid, answer, options, correctIndex }
 * @property {string[]} ruleIds     – rules used for this question
 */

/**
 * Generate a 10-question test.
 * @param {number} seed – numeric seed
 * @returns {{ seed: number, questions: TestQuestion[] }}
 */
export function generateTest(seed) {
	const rng = createRng(seed);
	const gridSize = 3; // all test questions use 3×3

	const questions = [];

	// Generate 5 medium (2 rules), 5 hard (3 rules)
	const blocks = [
		{ difficulty: 'medium', maxRules: 2, count: 7 },
		{ difficulty: 'hard', maxRules: 3, count: 8 }
	];

	for (const block of blocks) {
		for (let i = 0; i < block.count; i++) {
			const ruleIds = pickRulesSeeded(block.maxRules, gridSize, rng);
			const matrix = generateMatrixSeeded(gridSize, ruleIds, rng);

			questions.push({
				number: questions.length + 1,
				difficulty: block.difficulty,
				matrix,
				ruleIds
			});
		}
	}

	// Shuffle all 15 questions
	const shuffled = seededShuffle(questions, rng).map((q, i) => ({
		...q,
		number: i + 1
	}));

	return { seed, questions: shuffled };
}
