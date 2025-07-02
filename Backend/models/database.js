const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, '..', 'techmap.db'), err => {
  if (err) console.error('DB Error', err);
});
module.exports = db;