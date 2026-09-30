const analysisModel = require('../models/analysisModel');

/** Real (not simulated) recent-activity feed for the console's "Live Feed" panel. */
async function getFeed(req, res, next) {
  try {
    const items = await analysisModel.getRecentPublic(15);
    res.json({ items });
  } catch (err) {
    next(err);
  }
}

/** Lightweight public headline stats (subset of the admin stats, no user data). */
async function getStats(req, res, next) {
  try {
    const stats = await analysisModel.getStats();
    res.json({
      totalChecks: stats.totalChecks,
      safeCount: stats.safeCount,
      cautionCount: stats.cautionCount,
      highRiskCount: stats.highRiskCount,
      topThreats: stats.topThreats.slice(0, 5),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getFeed, getStats };
