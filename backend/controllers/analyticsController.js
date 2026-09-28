const analysisModel = require('../models/analysisModel');
const userModel = require('../models/userModel');

async function getAnalytics(req, res, next) {
  try {
    const [stats, totalUsers] = await Promise.all([analysisModel.getStats(), userModel.countUsers()]);
    res.json({ ...stats, totalUsers });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAnalytics };
