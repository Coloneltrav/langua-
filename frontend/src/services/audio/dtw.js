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

/**
 * Same alignment as dtwDistance, but also returns a per-reference-frame
 * local mismatch cost so callers can point at *which part* of the
 * reference word aligned worst — not just an overall score. Uses a full
 * (n+1)x(m+1) matrix with backpointers; fine for single-word/sentence
 * lengths (tens to low hundreds of frames).
 * @param {Float32Array[]} seqA attempt frames
 * @param {Float32Array[]} seqB reference frames
 * @returns {{distance: number, refCosts: number[]}} refCosts has one entry
 *   per reference frame (length m), the min local step cost aligned to it.
 */
export function dtwAlign(seqA, seqB) {
  const n = seqA.length;
  const m = seqB.length;
  if (n === 0 || m === 0) return { distance: Infinity, refCosts: [] };

  const cost = Array.from({ length: n + 1 }, () => new Float64Array(m + 1).fill(Infinity));
  const len = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  const from = Array.from({ length: n + 1 }, () => new Int8Array(m + 1)); // 0=diag,1=up,2=left
  cost[0][0] = 0;

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const d = euclidean(seqA[i - 1], seqB[j - 1]);
      let bestCost = cost[i - 1][j], bestLen = len[i - 1][j], dir = 1;
      if (cost[i][j - 1] < bestCost) { bestCost = cost[i][j - 1]; bestLen = len[i][j - 1]; dir = 2; }
      if (cost[i - 1][j - 1] < bestCost) { bestCost = cost[i - 1][j - 1]; bestLen = len[i - 1][j - 1]; dir = 0; }
      cost[i][j] = d + bestCost;
      len[i][j] = 1 + bestLen;
      from[i][j] = dir;
    }
  }

  const refCosts = new Array(m).fill(Infinity);
  let i = n, j = m;
  while (i > 0 && j > 0) {
    const d = euclidean(seqA[i - 1], seqB[j - 1]);
    if (d < refCosts[j - 1]) refCosts[j - 1] = d;
    const dir = from[i][j];
    if (dir === 0) { i--; j--; } else if (dir === 1) { i--; } else { j--; }
  }

  const pathLen = len[n][m];
  return { distance: pathLen > 0 ? cost[n][m] / pathLen : Infinity, refCosts };
}
