import * as Matrix from './matrix.js'
import JacobiEigenvalueAlgorithm from '../lib/jacobi-eigenvalue-algorithm.min.js';

let EPSILON = 0.001;
let ITERATIONS = 100;
let precomputed = false;
let x0_avg = null;
let AqqInv = null;
let AqqQuadInv = null;
let q = null;
let qQuad = null;

let precompute = (originalVertices) => {
	x0_avg = [0,0,0];
	let size = originalVertices.length;
	originalVertices.forEach(v => {
		x0_avg[0] += v.x / size;
		x0_avg[1] += v.y / size;
		x0_avg[2] += v.z / size;
	});
	let Aqq = [
		[0,0,0],
		[0,0,0],
		[0,0,0]
	];
	q = [];
	for (let i = 0; i < size; i++) {
		q[i] = [];
		q[i][0] = (originalVertices[i].x - x0_avg[0]);
		q[i][1] = (originalVertices[i].y - x0_avg[1]);
		q[i][2] = (originalVertices[i].z - x0_avg[2]);
		Aqq[0][0] += (originalVertices[i].x - x0_avg[0]) * (originalVertices[i].x - x0_avg[0]);
		Aqq[0][1] += (originalVertices[i].x - x0_avg[0]) * (originalVertices[i].y - x0_avg[1]);
		Aqq[0][2] += (originalVertices[i].x - x0_avg[0]) * (originalVertices[i].z - x0_avg[2]);
		Aqq[1][0] += (originalVertices[i].y - x0_avg[1]) * (originalVertices[i].x - x0_avg[0]);
		Aqq[1][1] += (originalVertices[i].y - x0_avg[1]) * (originalVertices[i].y - x0_avg[1]);
		Aqq[1][2] += (originalVertices[i].y - x0_avg[1]) * (originalVertices[i].z - x0_avg[2]);
		Aqq[2][0] += (originalVertices[i].z - x0_avg[2]) * (originalVertices[i].x - x0_avg[0]);
		Aqq[2][1] += (originalVertices[i].z - x0_avg[2]) * (originalVertices[i].y - x0_avg[1]);
		Aqq[2][2] += (originalVertices[i].z - x0_avg[2]) * (originalVertices[i].z - x0_avg[2]);
	}
	let Aqq_JEA = JacobiEigenvalueAlgorithm(Aqq, EPSILON, ITERATIONS);
	for (let i = 0; i < Aqq_JEA[1].length; i++) {
		Aqq_JEA[1][i][i] = 1 / Aqq_JEA[1][i][i];
	}
	AqqInv = Matrix.multiply(Matrix.multiply(Aqq_JEA[0], Aqq_JEA[1]), Aqq_JEA[2]);
	let AqqQuad = [
		[0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0]
	];
	qQuad = [];
	for (let i = 0; i < size; i++) {
		let q0 = [
			originalVertices[i].x  - x0_avg[0],
			originalVertices[i].y  - x0_avg[1],
			originalVertices[i].z  - x0_avg[2],
			(originalVertices[i].x - x0_avg[0])*(originalVertices[i].x - x0_avg[0]),
			(originalVertices[i].y - x0_avg[1])*(originalVertices[i].y - x0_avg[1]),
			(originalVertices[i].z - x0_avg[2])*(originalVertices[i].z - x0_avg[2]),
			(originalVertices[i].x - x0_avg[0])*(originalVertices[i].y - x0_avg[1]),
			(originalVertices[i].y - x0_avg[1])*(originalVertices[i].z - x0_avg[2]),
			(originalVertices[i].z - x0_avg[2])*(originalVertices[i].x - x0_avg[0])
		]
		qQuad[i] = q0;
		for (let mi = 0; mi < 9; mi++) {
			for (let mj = 0; mj < 9; mj ++) {
				AqqQuad[mi][mj] += q0[mi] * q0[mj];
			}
		}
	}
	let AqqQuad_JEA = JacobiEigenvalueAlgorithm(AqqQuad, EPSILON, ITERATIONS);
	for (let i = 0; i < AqqQuad_JEA[1].length; i++) AqqQuad_JEA[1][i][i] = 1 / AqqQuad_JEA[1][i][i];
	AqqQuadInv = Matrix.multiply(Matrix.multiply(AqqQuad_JEA[0], AqqQuad_JEA[1]), AqqQuad_JEA[2]);
	precomputed = true;
};

export const ShapeMatcher = (originalVertices, deformedVertices, beta) => {
	if (!precomputed) precompute(originalVertices);
	let x_avg = [0,0,0];
	let size = originalVertices.length;
	deformedVertices.forEach(v => {
		x_avg[0] += v.x / size;
		x_avg[1] += v.y / size;
		x_avg[2] += v.z / size;
	});
	let Apq = [
		[0,0,0],
		[0,0,0],
		[0,0,0]
	];
	for (let i = 0; i < size; i++) {
		Apq[0][0] += (deformedVertices[i].x - x_avg[0]) * (q[i][0]);
		Apq[0][1] += (deformedVertices[i].x - x_avg[0]) * (q[i][1]);
		Apq[0][2] += (deformedVertices[i].x - x_avg[0]) * (q[i][2]);
		Apq[1][0] += (deformedVertices[i].y - x_avg[1]) * (q[i][0]);
		Apq[1][1] += (deformedVertices[i].y - x_avg[1]) * (q[i][1]);
		Apq[1][2] += (deformedVertices[i].y - x_avg[1]) * (q[i][2]);
		Apq[2][0] += (deformedVertices[i].z - x_avg[2]) * (q[i][0]);
		Apq[2][1] += (deformedVertices[i].z - x_avg[2]) * (q[i][1]);
		Apq[2][2] += (deformedVertices[i].z - x_avg[2]) * (q[i][2]);
	}
	let A = Matrix.multiply(Apq, AqqInv);
	let det = Math.pow(Matrix.det3(A), 1/3);
	let ATA = Matrix.multiply(Matrix.transpose(Apq), Apq);
	let ATA_JEA = JacobiEigenvalueAlgorithm(ATA, EPSILON, ITERATIONS);
	let Q = ATA_JEA[0]; let D = ATA_JEA[1]; let QT = ATA_JEA[2];
	for (let i = 0; i < D.length; i++) D[i][i] = 1 / Math.sqrt(D[i][i]);
	let ApqQuad = [
		[0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0]
	];
	for (let i = 0; i < size; i++) {
		let q = [
			deformedVertices[i].x  - x_avg[0],
			deformedVertices[i].y  - x_avg[1],
			deformedVertices[i].z  - x_avg[2]
		];
		let q0 = qQuad[i];
		for (let mi = 0; mi < 3; mi++) {
			for (let mj = 0; mj < 9; mj ++) {
				ApqQuad[mi][mj] += q[mi] * q0[mj];
			}
		}
	}
	let AQuad = Matrix.multiply(ApqQuad, AqqQuadInv);
	let R = Matrix.multiply(Apq,Matrix.multiply(Q, Matrix.multiply(D, QT)));
	let g = [];
	for (let i = 0; i < size; i++) {
		let Rx = Matrix.apply(R, q[i]);
		let q0 = qQuad[i];
		let AQuadx = Matrix.apply(AQuad, q0);
		g.push([
			beta*AQuadx[0]/det + (1-beta)*Rx[0] + x_avg[0],
			beta*AQuadx[1]/det + (1-beta)*Rx[1] + x_avg[1],
			beta*AQuadx[2]/det + (1-beta)*Rx[2] + x_avg[2]
		]);
	}
	return g;
}
