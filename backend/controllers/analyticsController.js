const analysisModel = require('../models/analysisModel');

async function getAnalytics(req, res, next) {
  try {
    const all = await analysisModel.getAllAnalyses();

    const total = all.length;
    const counts = { SAFE: 0, CAUTION: 0, HIGH_RISK: 0 };
    const threatCounts = {};

    for (const record of all) {
      if (counts[record.riskLevel] !== undefined) {
        counts[record.riskLevel] += 1;
      }
      for (const threat of record.detectedThreats || []) {
        threatCounts[threat] = (threatCounts[threat] || 0) + 1;
      }
    }

    const topThreats = Object.entries(threatCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([label, count]) => ({ label, count }));

    // Group checks by day for a simple time-series view (last 30 days).
    const byDay = {};
    for (const record of all) {
      const day = record.timestamp.slice(0, 10); // YYYY-MM-DD
      byDay[day] = (byDay[day] || 0) + 1;
    }
    const checksOverTime = Object.entries(byDay)
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .slice(-30)
      .map(([date, count]) => ({ date, count }));

    res.json({
      totalChecks: total,
      safeCount: counts.SAFE,
      cautionCount: counts.CAUTION,
      highRiskCount: counts.HIGH_RISK,
      topThreats,
      checksOverTime,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAnalytics };
