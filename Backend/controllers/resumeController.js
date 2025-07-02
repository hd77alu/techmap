const db = require('../models/database');
const Project = require('../models/projectModel');
const KEYWORDS = ['JavaScript','Python','React','Node.js','SQL'];

exports.analyze = async (req, res) => {
  const text = req.body.text;
  db.run(
    "INSERT INTO resume_data(user_id, resume_text, upload_date) VALUES(?,?,datetime('now'))",
    [req.user.id, text]
  );
  const found = KEYWORDS.filter(k => text.includes(k));
  const suggestions = await Project.getAll();
  res.json({ keywords: found, suggestions });
};