export const apply = (A, x) => {
	let result = [];
	for (let i = 0; i < A.length; i++) {
		result[i] = 0;
		for (let j = 0; j < A[0].length; j++) {
			result[i] += A[i][j] * x[j];
		}
	}
	return result;
}

export const clean = (input, epsilon) => {
	let n = input[0].length;
	let result = clone(input);
	for (let i = 0; i < n; i++) {
		for (let j = 0; j < n; j++) {
			if (Math.abs(input[i][j]) < epsilon) result[i][j] = 0;
			else result[i][j] = input[i][j];
		}
	}
	return result;
}

export const det3 = (input) => {
	return input[0][0] * ((input[1][1] * input[2][2]) - (input[1][2] * input[2][1]))
		- input[0][1] * ((input[1][0] * input[2][2]) - (input[1][2] * input[2][0]))
		+ input[0][2] * ((input[1][0] * input[2][1]) - (input[1][1] * input[2][0]));
}

export const isDiagonal = (input, epsilon) => {
	let n = input[0].length;
	for (let i = 0; i < n; i++) {
		for (let j = 0; j < n; j++) {
			if (i == j) continue;
			if (Math.abs(input[i][j]) > epsilon) return false;
		}
	}
	return true;
}

export const multiply = (A, B) => {
	let result = [];
	for (let i = 0; i < A.length; i++) {
		result[i] = [];
		for (let j = 0; j < B[0].length; j++) {
			result[i][j] = 0;
			for (let k = 0; k < A[0].length; k++) {
				result[i][j] += A[i][k] * B[k][j];
			}
		}
	}
	return result;
}

export const transpose = (input) => {
	let cln = clone(input);
	let n = input[0].length;
	for (let i = 0; i < n; i++) {
		for (let j = 0; j < n; j++) {
			cln[i][j] = input[j][i];
		}
	}
	return cln;
}

export const clone = (input) => {
	let result = [];
	input.forEach((row, i) => {
		result.push([]);
		row.forEach(col => {
			result[i].push(col);
		});
	});
	return result;
}

export const identity = (n) => {
	let result = [];
	for (let i = 0; i < n; i++) {
		result.push([]);
		for (let j = 0; j < n; j++) {
			result[i][j] = (j == i ? 1 : 0);
		}
	}
	return result;
}
