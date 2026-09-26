const prisma = require('../config/prisma');

async function saveAnalysis({ userId, riskScore, riskLevel, detectedThreats, inputType }) {
  return prisma.analysisRecord.create({
    data: { userId: userId || null, riskScore, riskLevel, detectedThreats, inputType },
  });
}

async function getAllAnalyses() {
  return prisma.analysisRecord.findMany({ orderBy: { createdAt: 'asc' } });
}

async function getHistoryForUser(userId, { limit = 50 } = {}) {
  return prisma.analysisRecord.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

async function countAnalyses() {
  return prisma.analysisRecord.count();
}

module.exports = { saveAnalysis, getAllAnalyses, getHistoryForUser, countAnalyses };
