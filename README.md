# Javascript implementation of the Jacobi Eigenvalue Algorithm
Reference: https://www.cmi.ac.in/~ksutar/NLA2013/iterativemethods.pdf
Webpack template source: https://github.com/krasimir/webpack-library-starter/

# How to use
Input
<pre><code>
JacobiEigenvalueAlgorithm(
  input,          // 2-dimensional array
  epsilon,        // smallest possible magnitude the algorithm considers as non-zero
  max_iterations  // max number of iterations before algorithm stops trying to find a solution
);
</code></pre>
Output
<pre></code>
[
  Q,  // Column matrix of eigenvectors
  D   // Diagonal matrix of eigenvalues
  Q^T // Q transposed
];
</code></pre>
# Example
Input
<pre><code>
let output = jacobiEigenvalueAlgorithm([
  [1,2,30],
  [2,5,6],
  [30,6,9]
], 0.000001, 100));
console.log(output);
</code></pre>
Output
<pre><code>
[
  [[ 0.7446943583209754, -0.18220905216955507, 0.642051535308797 ],
   [ 0.08156770470931582, 0.979646943099816, 0.18340822343515592 ],
   [ -0.6624024624300283, -0.08421239922160272, 0.7443999258355528 ]],

  [[ -25.46580900627844, 0, 0 ],
   [ 0, 4.112238847071458, 0 ],
   [ 0, 0, 36.35357015920699 ] ],

  [[ 0.7446943583209754, 0.08156770470931582, -0.6624024624300283 ],
   [ -0.18220905216955507, 0.979646943099816, -0.08421239922160272 ],
   [ 0.642051535308797, 0.18340822343515592, 0.7443999258355528 ] ] ]
]
</code></pre>
