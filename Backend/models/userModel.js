const db = require('./database');

module.exports = {
  findOrCreate: profile => new Promise((resolve, reject) => {
    const { id, displayName, emails } = profile;
    const email = emails[0].value;
    db.get("SELECT * FROM users WHERE google_id=?", [id], (err, row) => {
      if (err) return reject(err);
      if (row) return resolve(row);
      db.run(
        "INSERT INTO users(google_id, username, email, last_login_date) VALUES(?,?,?,datetime('now'))",
        [id, displayName, email],
        function(err) {
          if (err) return reject(err);
          db.get("SELECT * FROM users WHERE id=?", [this.lastID], (e, newRow) => e ? reject(e) : resolve(newRow));
        }
      );
    });
  }),
  findById: id => new Promise((res, rej) => {
    db.get("SELECT * FROM users WHERE id=?", [id], (err, row) => err ? rej(err) : res(row));
  })
};