const db = require('../models/database');

function getProjects(req, res) {
    const { search, industry, skill, sort = 'name', limit = 20, offset = 0 } = req.query;
    let baseWhere = ' WHERE 1=1';
    let filters = '';
    let params = [];

    // Search functionality
    if (search) {
        filters += ' AND (name LIKE ? OR description LIKE ? OR industry LIKE ? OR required_skills LIKE ?)';
        params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Industry filter
    if (industry) {
        filters += ' AND industry LIKE ?';
        params.push(`%${industry}%`);
    }

    // Skill filter
    if (skill) {
        filters += ' AND required_skills LIKE ?';
        params.push(`%${skill}%`);
    }

    // Sorting
    const validSorts = ['name', 'industry'];
    const sortField = validSorts.includes(sort) ? sort : 'name';
    let query = `SELECT * FROM projects${baseWhere}${filters} ORDER BY ${sortField} ASC LIMIT ? OFFSET ?`;
    let countQuery = `SELECT COUNT(*) as total FROM projects${baseWhere}${filters}`;
    let queryParams = [...params, Number(limit), Number(offset)];

    db.all(query, queryParams, (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        // Process comma-separated values for better frontend consumption
        const processedRows = rows.map(row => ({
            ...row,
            required_skills_array: row.required_skills ? row.required_skills.split(',').map(s => s.trim()) : []
        }));

        // Get total count for pagination
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

function getProjectFilters(req, res) {
    db.all('SELECT DISTINCT industry FROM projects ORDER BY industry', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ industries: rows.map(row => row.industry).filter(Boolean) });
    });
}

module.exports = { getProjects, getResourceFilters, getProjectFilters }; 