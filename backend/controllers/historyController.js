const analysisModel = require('../models/analysisModel');

async function getMyHistory(req, res, next) {
  try {
    const records = await analysisModel.getHistoryForUser(req.userId, { limit: 50 });
    res.json({ records });
  } catch (err) {
    next(err);
  }
}

async function deleteMyHistoryItem(req, res, next) {
  try {
    const deleted = await analysisModel.deleteHistoryItem(req.userId, req.params.id);
    if (!deleted) return res.status(404).json({ error: 'History item not found.' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

async function clearMyHistory(req, res, next) {
  try {
    const deleted = await analysisModel.clearHistory(req.userId);
    res.json({ ok: true, deleted });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMyHistory, deleteMyHistoryItem, clearMyHistory };
