const analysisModel = require('../models/analysisModel');

async function getMyHistory(req, res, next) {
  try {
    const records = await analysisModel.getHistoryForUser(req.userId, { limit: 50 });
    res.json({ records });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMyHistory };
