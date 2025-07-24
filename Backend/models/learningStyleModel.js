const db = require('./database');

module.exports = {
  // Get latest assessment for user
  getByUser: userId => new Promise((res, rej) => {
    db.get(
      "SELECT visual, auditory, kinesthetic, reading, created_at FROM learning_styles WHERE user_id=? ORDER BY created_at DESC LIMIT 1",
      [userId],
      (e, row) => e ? rej(e) : res(row)
    );
  }),
  // Add new assessment (expects an object with all styles)
  add: (userId, styles) => new Promise((res, rej) => {
    db.run(
      "INSERT INTO learning_styles(user_id, visual, auditory, kinesthetic, reading, created_at) VALUES(?,?,?,?,?,datetime('now'))",
      [userId, styles.visual, styles.auditory, styles.kinesthetic, styles.reading],
      function(err) { err ? rej(err) : res(this.lastID); }
    );
  })
};