/**
 * Numerical equation matrix generator.
 *
 * Produces 3×3 grids where each row (or column) follows
 * the linear equation  A·x + B·y = C.
 *
 * To keep puzzles accessible, one of A or B is always 1.
 * The missing cell is always grid[2][2].
 */

import { seededShuffle, seededInt, seededChoice } from './seededRandom.js';

/**
 * Generate a single numerical matrix question.
 *
 * @param {() => number} rng – seeded random function
 * @returns {{
 *   grid: (number|null)[][],
 *   correctAnswer: number,
 *   options: number[],
 *   correctIndex: number,
 *   orientation: 'row'|'column',
 *   coefficients: { A: number, B: number }
 * }}
 */
export function generateNumericalMatrix(rng) {
	// Pick orientation: row-wise or column-wise
	const orientation = rng() < 0.5 ? 'row' : 'column';

	// Pick coefficients — one is always 1, the other in [2, 5]
	let A, B;
	if (rng() < 0.5) {
		A = 1;
		B = seededInt(2, 5, rng);
	} else {
		A = seededInt(2, 5, rng);
		B = 1;
	}

	let grid;

	if (orientation === 'row') {
		// Each row: A * col0 + B * col1 = col2
		// Generate 3 rows of (x, y) values
		const rows = [];
		for (let r = 0; r < 3; r++) {
			const x = seededInt(1, 9, rng);
			const y = seededInt(1, 9, rng);
			const c = A * x + B * y;
			rows.push([x, y, c]);
		}
		grid = rows;
	} else {
		// Each column: A * row0 + B * row1 = row2
		// Generate 3 columns of (v1, v2) values
		const col0v1 = seededInt(1, 9, rng);
		const col0v2 = seededInt(1, 9, rng);
		const col1v1 = seededInt(1, 9, rng);
		const col1v2 = seededInt(1, 9, rng);
		const col2v1 = seededInt(1, 9, rng);
		const col2v2 = seededInt(1, 9, rng);

		grid = [
			[col0v1, col1v1, col2v1],
			[col0v2, col1v2, col2v2],
			[A * col0v1 + B * col0v2, A * col1v1 + B * col1v2, A * col2v1 + B * col2v2]
		];
	}

	const correctAnswer = grid[2][2];

	// Null out the missing cell
	grid[2][2] = null;

	// Generate distractors
	const distractors = generateDistractors(correctAnswer, A, B, grid, orientation, rng);

	// Combine and shuffle
	const allOptions = [correctAnswer, ...distractors];
	const indices = seededShuffle([...Array(allOptions.length).keys()], rng);
	const options = indices.map((i) => allOptions[i]);
	const correctIndex = indices.indexOf(0);

	return {
		grid,
		correctAnswer,
		options,
		correctIndex,
		orientation,
		coefficients: { A, B }
	};
}

/**
 * Generate 5 plausible distractor values.
 */
function generateDistractors(correct, A, B, grid, orientation, rng) {
	const distractors = new Set();

	// Type 1: Off-by-one
	distractors.add(correct + 1);
	distractors.add(correct - 1);

	// Type 2: Swapped coefficients — apply B to first input, A to second
	if (orientation === 'row') {
		// Row 2: B * col0 + A * col1 instead of A * col0 + B * col1
		const x = grid[2][0];
		const y = grid[2][1];
		distractors.add(B * x + A * y);
	} else {
		// Column 2: B * row0 + A * row1 instead of A * row0 + B * row1
		const v1 = grid[0][2];
		const v2 = grid[1][2];
		distractors.add(B * v1 + A * v2);
	}

	// Type 3: Only multiply by A (ignore B)
	if (orientation === 'row') {
		distractors.add(A * grid[2][0] + grid[2][1]);
	} else {
		distractors.add(A * grid[0][2] + grid[1][2]);
	}

	// Type 4: Only multiply by B (ignore A)
	if (orientation === 'row') {
		distractors.add(grid[2][0] + B * grid[2][1]);
	} else {
		distractors.add(grid[0][2] + B * grid[1][2]);
	}

	// Type 5: Simple sum of the two inputs
	if (orientation === 'row') {
		distractors.add(grid[2][0] + grid[2][1]);
	} else {
		distractors.add(grid[0][2] + grid[1][2]);
	}

	// Type 6: Off by the coefficient
	distractors.add(correct + A);
	distractors.add(correct - B);
	distractors.add(correct + B);

	// Type 7: Double the correct
	distractors.add(correct * 2);

	// Remove the correct answer and any non-positive values
	distractors.delete(correct);

	// Filter to positive integers only, convert to array
	let pool = [...distractors].filter((d) => d > 0 && Number.isInteger(d));

	// If we need more, add random nearby values
	let offset = 2;
	while (pool.length < 5) {
		const candidate = correct + (rng() < 0.5 ? offset : -offset);
		if (candidate > 0 && candidate !== correct && !pool.includes(candidate)) {
			pool.push(candidate);
		}
		offset++;
		if (offset > 20) break; // safety
	}

	// Shuffle and take 5
	return seededShuffle(pool, rng).slice(0, 5);
}
