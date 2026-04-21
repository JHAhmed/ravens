/**
 * SVG shape rendering utilities for Raven's Matrix
 */

/**
 * Generate SVG polygon points string for a regular polygon
 * @param {number} sides
 * @param {number} cx - Center X
 * @param {number} cy - Center Y
 * @param {number} radius
 * @param {number} rotationDeg - Rotation in degrees (0 = first vertex at top)
 * @returns {string} SVG points attribute value
 */
export function polygonPoints(sides, cx, cy, radius, rotationDeg = 0) {
	const points = [];
	const rotationRad = (rotationDeg * Math.PI) / 180;
	for (let i = 0; i < sides; i++) {
		const angle = (2 * Math.PI * i) / sides - Math.PI / 2 + rotationRad;
		const x = cx + radius * Math.cos(angle);
		const y = cy + radius * Math.sin(angle);
		points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
	}
	return points.join(' ');
}

/**
 * Generate SVG polygon points string for a star shape
 * @param {number} numPoints - Number of star points
 * @param {number} cx - Center X
 * @param {number} cy - Center Y
 * @param {number} outerRadius
 * @param {number} innerRadius
 * @param {number} rotationDeg
 * @returns {string} SVG points attribute value
 */
export function starPoints(numPoints, cx, cy, outerRadius, innerRadius, rotationDeg = 0) {
	const points = [];
	const rotationRad = (rotationDeg * Math.PI) / 180;
	const total = numPoints * 2;
	for (let i = 0; i < total; i++) {
		const angle = (2 * Math.PI * i) / total - Math.PI / 2 + rotationRad;
		const r = i % 2 === 0 ? outerRadius : innerRadius;
		const x = cx + r * Math.cos(angle);
		const y = cy + r * Math.sin(angle);
		points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
	}
	return points.join(' ');
}

/**
 * Generate SVG path data for a cross/plus shape
 * @param {number} cx - Center X
 * @param {number} cy - Center Y
 * @param {number} size - Total size
 * @param {number} thickness - Arm width
 * @returns {string} SVG path d attribute value
 */
export function crossPath(cx, cy, size, thickness) {
	const s = size / 2;
	const t = thickness / 2;
	return [
		`M${cx - t},${cy - s}`,
		`L${cx + t},${cy - s}`,
		`L${cx + t},${cy - t}`,
		`L${cx + s},${cy - t}`,
		`L${cx + s},${cy + t}`,
		`L${cx + t},${cy + t}`,
		`L${cx + t},${cy + s}`,
		`L${cx - t},${cy + s}`,
		`L${cx - t},${cy + t}`,
		`L${cx - s},${cy + t}`,
		`L${cx - s},${cy - t}`,
		`L${cx - t},${cy - t}`,
		'Z'
	].join(' ');
}

/** Size name → radius in a 100×100 viewBox */
export const SIZE_MAP = {
	xsmall: 10,
	small: 15,
	medium: 26,
	large: 36,
	xlarge: 44
};

/**
 * Get valid size names for a given grid dimension
 * @param {number} gridSize
 * @returns {string[]}
 */
export function getSizesForGrid(gridSize) {
	if (gridSize === 3) return ['small', 'medium', 'large'];
	if (gridSize === 4) return ['xsmall', 'small', 'medium', 'large'];
	if (gridSize === 5) return ['xsmall', 'small', 'medium', 'large', 'xlarge'];
	return ['small', 'medium', 'large'];
}

/** All available shape types */
export const SHAPE_TYPES = [
	'circle',
	'triangle',
	'square',
	'diamond',
	'pentagon',
	'hexagon',
	'star',
	'cross'
];

/** All available fill types */
export const FILL_TYPES = ['solid', 'striped', 'empty'];

/**
 * Get SVG fill value string for a fill type
 * @param {string} fillType - 'solid' | 'striped' | 'empty'
 * @param {string} patternId - ID of the stripe pattern element
 * @returns {string}
 */
export function getFillValue(fillType, patternId = 'stripes') {
	switch (fillType) {
		case 'solid':
			return '#000000';
		case 'empty':
			return 'none';
		case 'striped':
			return `url(#${patternId})`;
		default:
			return '#000000';
	}
}

/**
 * Get SVG stroke-width for a fill type
 * @param {string} fillType
 * @returns {number}
 */
export function getStrokeWidth(fillType) {
	return fillType === 'empty' ? 2.5 : 1.5;
}

/**
 * Render one element to an SVG markup string (used for SVG export)
 * @param {object} el - Element descriptor
 * @param {number} cx - Center X in SVG units
 * @param {number} cy - Center Y in SVG units
 * @param {number} radius - Radius in SVG units
 * @param {string} patternId - Stripe pattern id
 * @returns {string} SVG markup
 */
export function elementToSVGString(el, cx, cy, radius, patternId) {
	const fill = getFillValue(el.fill, patternId);
	const stroke = '#000000';
	const sw = getStrokeWidth(el.fill);
	const rotation = el.rotation || 0;

	let shape = '';

	switch (el.shape) {
		case 'circle':
			shape = `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
			break;
		case 'star':
			shape = `<polygon points="${starPoints(5, cx, cy, radius, radius * 0.4)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
			break;
		case 'cross':
			shape = `<path d="${crossPath(cx, cy, radius * 2, radius * 0.6)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
			break;
		case 'diamond':
			shape = `<polygon points="${polygonPoints(4, cx, cy, radius, 0)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
			break;
		case 'square':
			shape = `<polygon points="${polygonPoints(4, cx, cy, radius, 45)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
			break;
		default: {
			const sidesMap = { triangle: 3, pentagon: 5, hexagon: 6 };
			const sides = sidesMap[el.shape] || 4;
			shape = `<polygon points="${polygonPoints(sides, cx, cy, radius)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
			break;
		}
	}

	if (rotation !== 0) {
		return `<g transform="rotate(${rotation}, ${cx}, ${cy})">${shape}</g>`;
	}
	return shape;
}
