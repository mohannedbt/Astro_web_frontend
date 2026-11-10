// Validation for submitted game runs.
//
// These games run entirely in the browser, so the server can't prove a score
// is honest. What it CAN do is refuse impossible values: unknown games, scores
// above what the game can ever produce, and XP far beyond what a run is worth.
// That stops casual tampering (editing a request in DevTools to claim 9,999,999).

// Upper bounds derived from the game rules in AstroGames.jsx.
const GAME_LIMITS = {
  'meteor-dash': { maxScore: 100000, maxXp: 5000 },
  // (8 pairs * 120 + 90s * 15) * 3.5 multiplier ≈ 8,085
  'orbit-match': { maxScore: 10000, maxXp: 8500 },
  // (20 questions * 200 + 300 speed bonus) * 3.5 ≈ 15,050
  'astro-quiz': { maxScore: 20000, maxXp: 10000 },
};

const DIFFICULTIES = ['easy', 'medium', 'hard', 'master', 'insane'];
const EASY_XP_CAP = 35; // matches the client rule: easy runs earn at most 35 XP

function toInt(value, min, max, fallback = 0) {
  const number = Math.round(Number(value));
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

function sanitizeRun(body = {}) {
  const game = String(body.game || '').trim();
  const limits = GAME_LIMITS[game];
  if (!limits) return { error: 'Unknown game' };

  const difficulty = String(body.difficulty || 'easy').toLowerCase();
  if (!DIFFICULTIES.includes(difficulty)) return { error: 'Invalid difficulty' };

  const score = toInt(body.score, 0, limits.maxScore);
  const won = body.won === true || body.won === 'true' || body.won === 1;

  // If the client didn't send XP, derive it with the same fallback formula.
  const requestedXp = body.xp === undefined || body.xp === null || body.xp === ''
    ? Math.round(score * 0.5 + (won ? 100 : 20))
    : body.xp;
  let xp = toInt(requestedXp, 0, limits.maxXp);
  if (difficulty === 'easy') xp = Math.min(EASY_XP_CAP, xp);

  const clientRunId = body.clientRunId ? String(body.clientRunId).slice(0, 64) : null;

  return {
    run: {
      game,
      difficulty,
      score,
      xp,
      won,
      total: toInt(body.total, 0, 100000),
      guesses: toInt(body.guesses, 0, 10000),
      timeSec: toInt(body.timeSec, 0, 86400),
      pct: toInt(body.pct, 0, 100),
      clientRunId,
    },
  };
}

module.exports = { GAME_LIMITS, DIFFICULTIES, EASY_XP_CAP, sanitizeRun };
