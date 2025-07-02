const Resource = require('../models/resourceModel');
exports.getResources = async (req, res) => {
  try {
    const list = await Resource.getByStyle(req.query.style);
    res.json(list);
  } catch (err) { res.status(500).json(err); }
};