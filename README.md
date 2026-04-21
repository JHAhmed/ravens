## 1. Geometric Transformations

These are the most common rules. They involve a single object changing its physical properties as it moves across the grid.

- _Rotation:_ An object rotates by a fixed increment (e.g., _45°, **90°, or **180°_) in each step.
- _Reflection:_ The object flips across a vertical, horizontal, or diagonal axis.
- _Size Progression:_ The object grows or shrinks in a linear sequence (Small $\rightarrow$ Medium $\rightarrow$ Large).
- _Translation:_ A shape moves to a different position within its cell (e.g., moving clockwise around the corners).

## 2. Set Logic (Boolean Operations)

These rules treat the first two cells in a row as "inputs" and the third as the "result."

- _Addition (OR):_ The third cell contains all elements from the first two cells combined.
- _Subtraction:_ Elements present in the first cell but not the second are carried over to the third.
- _XOR (Mutual Exclusion):_ Elements that appear in both the first and second cells are deleted; only unique elements remain in the third.
- _Intersection (AND):_ Only elements present in both the first and second cells appear in the third.

## 3. Distribution and Permutation

These rules ensure that a set of traits is balanced across the grid.

- _Distribution of Three:_ There are three types of shapes (e.g., square, circle, triangle) and three types of fills (e.g., solid, striped, empty). Each row and column must contain exactly one of each.
- _Constant Property:_ A certain feature (like the number of sides or the color) remains the same across a row but changes between rows.

## 4. Arithmetic and Quantitative Rules

These require the user to count or calculate properties.

- _Summation:_ The number of dots or lines in the third cell equals the sum of the first two cells.
- _Incremental Change:_ The number of elements increases by a fixed value ($n+1$) in each step.
- _Progressive Complexity:_ The "complexity" of a shape increases (e.g., adding one side to a polygon: Triangle $\rightarrow$ Square $\rightarrow$ Pentagon).

---

- Use SvelteKit + TailwindCSS
- Make it component based
- Use a monochromatic, clean, minimalistic design
- Use a grid system for the grids, grids can be chosen between 3x3, 4x4, 5x5
- Make it such that difficulty can be easy, medium, or hard
- Easy will apply 1 rule
- Medium will apply 2 rules
- Hard will apply 3 rules
- Allow the user to select the rules to apply
- Allow the user to randomize and download a given matrix
