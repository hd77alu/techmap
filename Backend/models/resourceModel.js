const db = require('./database');

module.exports = {
  getByStyle: style => new Promise((res, rej) => {
    db.all("SELECT * FROM resources WHERE recommended_style=?", [style], (e, rows) => e ? rej(e) : res(rows));
  })
};