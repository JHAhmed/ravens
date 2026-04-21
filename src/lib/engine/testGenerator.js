/**
 * Test generation — produces a 15-question test
 * (5 easy, 5 medium, 5 hard) from a numeric seed.
 *
 * Uses seeded randomness so the same seed always yields the same test.
 */

import { ALL_RULES, areRulesCompatible } from './rules.js';
import { SHAPE_TYPES, FILL_TYPES, SIZE_MAP } from './shapes.js';
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
		availableShapes = availableShapes.filter((s) => s !== 'circle');
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

	if (answer.length > 0) {
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
		const otherShapes2 = SHAPE_TYPES.filter(
			(s) => s !== answer[0].shape && s !== d1[0]?.shape
		);
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

// ── Seeded matrix generation ─────────────────────────────────────────

/**
 * Generate a single matrix with seeded randomness.
 * We temporarily override Math.random for rules that use it internally.
 */
function generateMatrixSeeded(gridSize, selectedRuleIds, rng) {
	const rules = selectedRuleIds
		.map((id) => ALL_RULES.find((r) => r.id === id))
		.filter(Boolean);

	const structural = rules.filter((r) => STRUCTURAL_IDS.has(r.id));
	const attribute = rules.filter((r) => !STRUCTURAL_IDS.has(r.id));

	const priority = { shape: 0, fill: 1, size: 2, rotation: 3, position: 4 };
	attribute.sort((a, b) => (priority[a.modifies] ?? 99) - (priority[b.modifies] ?? 99));

	// Temporarily replace Math.random with our seeded version
	const originalRandom = Math.random;
	Math.random = rng;

	let grid;
	try {
		if (structural.length > 0) {
			grid = createDefaultGridSeeded(gridSize, selectedRuleIds, rng);
			structural[0].apply(grid, gridSize);
		} else {
			grid = createDefaultGridSeeded(gridSize, selectedRuleIds, rng);
		}

		for (const rule of attribute) {
			rule.apply(grid, gridSize);
		}
	} finally {
		Math.random = originalRandom;
	}

	const answer = deepClone(grid[gridSize - 1][gridSize - 1]);
	const distractors = createDistractorsSeeded(answer, grid, gridSize, rng);

	const allOptions = [answer, ...distractors];
	const indices = seededShuffle([...Array(allOptions.length).keys()], rng);
	const options = indices.map((i) => allOptions[i]);
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
 * Generate a 15-question test.
 * @param {number} seed – numeric seed
 * @returns {{ seed: number, questions: TestQuestion[] }}
 */
export function generateTest(seed) {
	const rng = createRng(seed);
	const gridSize = 3; // all test questions use 3×3

	const questions = [];

	// Generate 5 easy (1 rule), 5 medium (2 rules), 5 hard (3 rules)
	const blocks = [
		{ difficulty: 'easy', maxRules: 1, count: 5 },
		{ difficulty: 'medium', maxRules: 2, count: 5 },
		{ difficulty: 'hard', maxRules: 3, count: 5 }
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
