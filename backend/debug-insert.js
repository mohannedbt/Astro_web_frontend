const { initDatabase, dbRun } = require('./src/middleware/database');

(async () => {
  await initDatabase();
  const sql = 'INSERT INTO astrogames_scores (game, name, score, total, difficulty, won, guesses, time_sec, target, pct, user_id, user_email, user_name, challenge_type, challenge_title, challenge_id, global_score, time_ms, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  const params = ['quiz', 'Verifier', 42, 50, 'medium', 1, 3, 24, 'Mars', 84, 1, 'verifier@example.com', 'Verifier', 'daily', 'Daily Cosmic Sprint', 'daily-2026-08-02', 42, 24000, new Date().toISOString()];
  console.log(params.map((value) => `${typeof value}:${String(value)}`));
  try {
    const result = await dbRun(sql, params);
    console.log('ok', result);
  } catch (error) {
    console.error(error);
  }
})();
