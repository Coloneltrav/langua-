// Character-level alignment for dictation feedback: aligns what the
// learner typed against the correct answer (Levenshtein backtrace) and
// marks each answer character correct/wrong/missing, plus extra typed
// characters. Pure functions — see textDiff.test.js.

export function normalizeAnswer(s) {
  return s
    .toLowerCase()
    .replace(/[.,!?;:"'’‘“”]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Aligns `typed` to `answer` (both already normalized).
 * @returns {{ops: Array<{type:'match'|'sub'|'del'|'ins', answerChar?:string, typedChar?:string}>, correct: boolean, accuracy: number}}
 * 'del' = answer char the learner missed; 'ins' = extra char they typed.
 */
export function diffAnswer(typed, answer) {
  const a = answer;
  const t = typed;
  const n = a.length;
  const m = t.length;

  // Full DP matrix (short strings — sentences at most) for backtrace.
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 0; i <= n; i++) dp[i][0] = i;
  for (let j = 0; j <= m; j++) dp[0][j] = j;
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const cost = a[i - 1] === t[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }

  const ops = [];
  let i = n;
  let j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + (a[i - 1] === t[j - 1] ? 0 : 1)) {
      ops.unshift(a[i - 1] === t[j - 1]
        ? { type: 'match', answerChar: a[i - 1], typedChar: t[j - 1] }
        : { type: 'sub', answerChar: a[i - 1], typedChar: t[j - 1] });
      i--; j--;
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      ops.unshift({ type: 'del', answerChar: a[i - 1] });
      i--;
    } else {
      ops.unshift({ type: 'ins', typedChar: t[j - 1] });
      j--;
    }
  }

  const distance = dp[n][m];
  const accuracy = n === 0 ? (m === 0 ? 1 : 0) : Math.max(0, 1 - distance / n);
  return { ops, correct: distance === 0, accuracy };
}
