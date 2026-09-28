const prisma = require('../config/prisma');

async function saveAnalysis({ userId, riskScore, riskLevel, detectedThreats, inputType }) {
  return prisma.analysisRecord.create({
    data: { userId: userId || null, riskScore, riskLevel, detectedThreats, inputType },
  });
}

async function getHistoryForUser(userId, { limit = 50 } = {}) {
  return prisma.analysisRecord.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

/** Only deletes if the record belongs to this user. Returns number deleted. */
async function deleteHistoryItem(userId, id) {
  const result = await prisma.analysisRecord.deleteMany({ where: { id, userId } });
  return result.count;
}

async function clearHistory(userId) {
  const result = await prisma.analysisRecord.deleteMany({ where: { userId } });
  return result.count;
}

/** Aggregated stats for the admin dashboard (no raw message content exists to leak). */
async function getStats() {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [levelGroups, recent, total] = await Promise.all([
    prisma.analysisRecord.groupBy({ by: ['riskLevel'], _count: { _all: true } }),
    prisma.analysisRecord.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true, detectedThreats: true },
      orderBy: { createdAt: 'asc' },
      take: 20000,
    }),
    prisma.analysisRecord.count(),
  ]);

  const counts = { SAFE: 0, CAUTION: 0, HIGH_RISK: 0 };
  for (const g of levelGroups) {
    if (counts[g.riskLevel] !== undefined) counts[g.riskLevel] = g._count._all;
  }

  const threatCounts = {};
  const byDay = {};
  for (const r of recent) {
    for (const t of Array.isArray(r.detectedThreats) ? r.detectedThreats : []) {
      threatCounts[t] = (threatCounts[t] || 0) + 1;
    }
    const day = r.createdAt.toISOString().slice(0, 10);
    byDay[day] = (byDay[day] || 0) + 1;
  }

  return {
    totalChecks: total,
    safeCount: counts.SAFE,
    cautionCount: counts.CAUTION,
    highRiskCount: counts.HIGH_RISK,
    topThreats: Object.entries(threatCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([label, count]) => ({ label, count })),
    checksOverTime: Object.entries(byDay).map(([date, count]) => ({ date, count })),
  };
}

module.exports = { saveAnalysis, getHistoryForUser, deleteHistoryItem, clearHistory, getStats };
