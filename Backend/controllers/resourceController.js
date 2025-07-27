const db = require('../models/database');

// Helper function to split and clean comma-separated values
function parseCommaSeparated(value) {
    if (!value) return [];
    return value.split(',').map(item => item.trim().replace(/"/g, ''));
}

function getResources(req, res) {
    const { style, search, type, sort = 'name', limit = 20, offset = 0 } = req.query;
    let baseWhere = ' WHERE 1=1';
    let filters = '';
    let params = [];

    // Learning style filter - Fixed column name
    if (style) {
        filters += ' AND recommended_style LIKE ?';
        params.push(`%${style}%`);
    }

    // Search functionality - enhanced to search description as well
    if (search) {
        filters += ' AND (name LIKE ? OR description LIKE ? OR type LIKE ? OR tech_tags LIKE ?)';
        params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Type filter
    if (type) {
        filters += ' AND type = ?';
        params.push(type);
    }

    // Sorting
    const validSorts = ['name', 'type'];
    const sortField = validSorts.includes(sort) ? sort : 'name';
    let query = `SELECT * FROM resources${baseWhere}${filters} ORDER BY ${sortField} ASC LIMIT ? OFFSET ?`;
    let countQuery = `SELECT COUNT(*) as total FROM resources${baseWhere}${filters}`;
    let queryParams = [...params, Number(limit), Number(offset)];

    db.all(query, queryParams, (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }        // Process comma-separated values
        const processedRows = rows.map(row => ({
            ...row,
            recommended_styles: row.recommended_style ? row.recommended_style.split(',').map(s => s.trim()) : [],
            tech_tags_array: row.tech_tags ? row.tech_tags.split(',').map(s => s.trim()) : []
        }));
        // Get total count for current filters
        db.get(countQuery, params, (countErr, countRow) => {
            if (countErr) {
                console.error('Database error:', countErr);
                return res.status(500).json({ error: 'Database error' });
            }
            res.json({
                data: processedRows,
                total: countRow.total,
                limit: Number(limit),
                offset: Number(offset),
                hasMore: processedRows.length === Number(limit)
            });
        });
    });
}

function getResourceFilters(req, res) {
    db.all('SELECT DISTINCT type FROM resources ORDER BY type', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ types: rows.map(row => row.type).filter(Boolean) });
    });
}

module.exports = { getResources, getResourceFilters };