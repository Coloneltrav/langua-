// Dynamic time warping over MFCC frame sequences: aligns two utterances
// spoken at different speeds and returns the average per-step distance
// along the optimal alignment path. Pure math, unit-testable.

function euclidean(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    sum += d * d;
  }
  return Math.sqrt(sum);
}

/**
 * @param {Float32Array[]} seqA
 * @param {Float32Array[]} seqB
 * @returns {number} path-length-normalized DTW distance (lower = more similar)
 */
export function dtwDistance(seqA, seqB) {
  const n = seqA.length;
  const m = seqB.length;
  if (n === 0 || m === 0) return Infinity;

  // Two-row DP for cost; parallel table for path length so we can
  // normalize by actual alignment length rather than n+m.
  let prevCost = new Float64Array(m + 1).fill(Infinity);
  let prevLen = new Float64Array(m + 1);
  let currCost = new Float64Array(m + 1);
  let currLen = new Float64Array(m + 1);
  prevCost[0] = 0;

  for (let i = 1; i <= n; i++) {
    currCost.fill(Infinity);
    currCost[0] = Infinity;
    for (let j = 1; j <= m; j++) {
      const d = euclidean(seqA[i - 1], seqB[j - 1]);
      // candidates: (i-1,j) prev row same col, (i,j-1) same row prev col, (i-1,j-1) diagonal
      let bestCost = prevCost[j];
      let bestLen = prevLen[j];
      if (currCost[j - 1] < bestCost) { bestCost = currCost[j - 1]; bestLen = currLen[j - 1]; }
      if (prevCost[j - 1] < bestCost) { bestCost = prevCost[j - 1]; bestLen = prevLen[j - 1]; }
      currCost[j] = d + bestCost;
      currLen[j] = 1 + bestLen;
    }
    [prevCost, currCost] = [currCost, prevCost];
    [prevLen, currLen] = [currLen, prevLen];
  }

  const total = prevCost[m];
  const pathLen = prevLen[m];
  return pathLen > 0 ? total / pathLen : Infinity;
}
