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

/**
 * Derives a 1-5 "threat level" from the real share of high-risk checks.
 * This is a transparent calculation on real data (documented to the client
 * as such), not a fixed decorative number.
 */
function deriveThreatLevel(totalChecks, highRiskCount) {
  if (totalChecks === 0) return { level: 1, label: 'NOMINAL' };
  const ratio = highRiskCount / totalChecks;
  if (ratio >= 0.5) return { level: 5, label: 'SEVERE' };
  if (ratio >= 0.35) return { level: 4, label: 'HIGH' };
  if (ratio >= 0.2) return { level: 3, label: 'ELEVATED' };
  if (ratio >= 0.08) return { level: 2, label: 'GUARDED' };
  return { level: 1, label: 'NOMINAL' };
}

/** Lightweight public headline stats (subset of the admin stats, no user data). */
async function getStats(req, res, next) {
  try {
    const [stats, today] = await Promise.all([analysisModel.getStats(), analysisModel.getTodayStats()]);
    const threatLevel = deriveThreatLevel(stats.totalChecks, stats.highRiskCount);

    res.json({
      totalChecks: stats.totalChecks,
      safeCount: stats.safeCount,
      cautionCount: stats.cautionCount,
      highRiskCount: stats.highRiskCount,
      checksToday: today.checksToday,
      highRiskToday: today.highRiskToday,
      threatLevel,
      topThreats: stats.topThreats.slice(0, 5),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getFeed, getStats };
