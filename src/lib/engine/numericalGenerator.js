/**
 * Numerical equation matrix generator.
 *
 * Produces 3×3 grids where each row follows
 * the linear equation  A·x + B·y = C.
 *
 * To keep puzzles accessible, one of A or B is always 1.
 * The missing cell is always grid[2][2].
 *
 * Independence constraint: the first two rows' (x, y) pairs
 * must be linearly independent so the equation is uniquely
 * solvable from the grid (prevents "could be 3A+B or A+3B").
 */

import { seededShuffle, seededInt, seededChoice } from './seededRandom.js';

/**
 * Check that two (x, y) pairs are linearly independent.
 * Two vectors (x1,y1) and (x2,y2) are proportional iff x1*y2 === x2*y1.
 * We also check that (x1,x2) is not proportional to (y1,y2) —
 * i.e. x1*y2 !== x2*y1  AND  x1/x2 !== y1/y2  ⟺  x1*y2 !== y1*x2
 * (same cross-multiply). So really we just need the one check,
 * but we also ensure x1 !== x2 || y1 !== y2 to avoid identical rows.
 */
function areIndependent(x1, y1, x2, y2) {
	// Same row values → not independent
	if (x1 === x2 && y1 === y2) return false;
	// Proportional rows → not independent (cross-multiply avoids division)
	if (x1 * y2 === x2 * y1) return false;
	return true;
}

/**
 * Generate a single numerical matrix question.
 *
 * @param {() => number} rng – seeded random function
 * @returns {{
 *   grid: (number|null)[][],
 *   correctAnswer: number,
 *   options: number[],
 *   correctIndex: number,
 *   orientation: 'row',
 *   coefficients: { A: number, B: number }
 * }}
 */
export function generateNumericalMatrix(rng) {
	const orientation = 'row';

	// Pick coefficients — one is always 1, the other in [2, 5]
	let A, B;
	if (rng() < 0.5) {
		A = 1;
		B = seededInt(2, 5, rng);
	} else {
		A = seededInt(2, 5, rng);
		B = 1;
	}

	// Each row: A * col0 + B * col1 = col2
	// Generate 3 rows of (x, y) values with independence constraint
	const rows = [];
	const MAX_ATTEMPTS = 50;

	for (let r = 0; r < 3; r++) {
		let x, y;
		let attempts = 0;

		do {
			x = seededInt(1, 9, rng);
			y = seededInt(1, 9, rng);
			attempts++;

			// For row 0, any values are fine.
			// For rows 1+, ensure independence against row 0.
			if (r === 0) break;
			if (areIndependent(rows[0][0], rows[0][1], x, y)) break;
		} while (attempts < MAX_ATTEMPTS);

		const c = A * x + B * y;
		rows.push([x, y, c]);
	}

	const grid = rows;
	const correctAnswer = grid[2][2];

	// Null out the missing cell
	grid[2][2] = null;

	// Generate distractors
	const distractors = generateDistractors(correctAnswer, A, B, grid, rng);

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
function generateDistractors(correct, A, B, grid, rng) {
	const distractors = new Set();

	// Type 1: Off-by-one
	distractors.add(correct + 1);
	distractors.add(correct - 1);

	// Type 2: Swapped coefficients — apply B to first input, A to second
	const x = grid[2][0];
	const y = grid[2][1];
	distractors.add(B * x + A * y);

	// Type 3: Only multiply by A (ignore B)
	distractors.add(A * grid[2][0] + grid[2][1]);

	// Type 4: Only multiply by B (ignore A)
	distractors.add(grid[2][0] + B * grid[2][1]);

	// Type 5: Simple sum of the two inputs
	distractors.add(grid[2][0] + grid[2][1]);

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
