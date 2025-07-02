const db = require('./database');

module.exports = {
  getByUser: userId => new Promise((res, rej) => {
    db.all("SELECT * FROM learning_styles WHERE user_id=?", [userId], (e, rows) => e ? rej(e) : res(rows));
  }),
  add: (userId, style) => new Promise((res, rej) => {
    db.run(
      "INSERT INTO learning_styles(user_id, style_type, assessment_date) VALUES(?,?,datetime('now'))",
      [userId, style],
      function(err) { err ? rej(err) : res(this.lastID); }
    );
  })
};