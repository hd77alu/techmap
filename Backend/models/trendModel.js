const db = require('./database');

module.exports = {
  getAll: () => new Promise((res, rej) => {
    db.all("SELECT * FROM trending_data", [], (e, rows) => e ? rej(e) : res(rows));
  })
};