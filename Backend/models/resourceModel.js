const db = require('./database');

module.exports = {
  getByStyle: (style, tag) => new Promise((res, rej) => {
    let query = 'SELECT * FROM resources';
    let params = [];

    if (style) {
        // Search for style in comma-separated recommended_style field
        query += ' WHERE recommended_style LIKE ?';
        params.push(`%${style}%`);
    }

    if (tag) {
        const operator = style ? ' AND' : ' WHERE';
        query += `${operator} tech_tags LIKE ?`;
        params.push(`%${tag}%`);
    }

    // If no filters, get all resources
    if (!style && !tag) {
        query += ' ORDER BY name';
    }

    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('Database error in getByStyle:', err);
            rej(err);
        } else {
            res(rows || []);
        }
    });
  }),

  getAll: () => new Promise((res, rej) => {
    db.all("SELECT * FROM resources ORDER BY name", [], (err, rows) => {
        if (err) {
            console.error('Database error in getAll:', err);
            rej(err);
        } else {
            res(rows || []);
        }
    });
  })
};