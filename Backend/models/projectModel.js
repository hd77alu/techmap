const db = require('./database');

module.exports = {
  getAll: () => new Promise((res, rej) => {
    db.all("SELECT * FROM projects", [], (e, rows) => e ? rej(e) : res(rows));
  })
};