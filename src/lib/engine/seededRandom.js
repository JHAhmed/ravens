/**
 * Seeded pseudo-random number generator (mulberry32).
 *
 * Provides deterministic randomness so the same seed always produces
 * the same test.
 */

/**
 * Create a seeded PRNG using the mulberry32 algorithm.
 * @param {number} seed  – integer seed
 * @returns {() => number}  – function returning values in [0, 1)
 */
export function createRng(seed) {
	let s = seed | 0;
	return function () {
		s = (s + 0x6d2b79f5) | 0;
		let t = Math.imul(s ^ (s >>> 15), 1 | s);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/**
 * Hash a string into a 32-bit integer seed.
 * @param {string} str
 * @returns {number}
 */
export function hashSeed(str) {
	let h = 0;
	for (let i = 0; i < str.length; i++) {
		h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
	}
	return h;
}

/**
 * Generate a random integer seed suitable for display.
 * @returns {number}
 */
export function randomSeed() {
	return Math.floor(Math.random() * 900000) + 100000; // 6-digit
}

// ── Seeded utility wrappers ──────────────────────────────────────────

/**
 * Fisher-Yates shuffle using a seeded RNG.
 * @param {any[]} arr
 * @param {() => number} rng
 * @returns {any[]}
 */
export function seededShuffle(arr, rng) {
	const a = [...arr];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(rng() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

/**
 * Pick a random element from an array using a seeded RNG.
 * @param {any[]} arr
 * @param {() => number} rng
 * @returns {any}
 */
export function seededChoice(arr, rng) {
	return arr[Math.floor(rng() * arr.length)];
}

/**
 * Random integer in [min, max] using a seeded RNG.
 * @param {number} min
 * @param {number} max
 * @param {() => number} rng
 * @returns {number}
 */
export function seededInt(min, max, rng) {
	return Math.floor(rng() * (max - min + 1)) + min;
}
