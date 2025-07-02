const Trend = require('../models/trendModel');
exports.getTrends = async (req, res) => {
  try {
    const data = await Trend.getAll();
    res.json(data);
  } catch (err) { res.status(500).json(err); }
};