const crypto = require('crypto');
const db = require('../config/database');

/**
 * Persists a completed analysis result for analytics purposes.
 *
 * Security note: per the project requirements, we do NOT store the raw
 * submitted message/URL. We only keep a one-way hash (for potential future
 * duplicate-detection features) plus the non-sensitive result fields needed
 * to power the aggregated analytics dashboard.
 */
async function saveAnalysis({ riskScore, riskLevel, detectedThreats, inputType }) {
  const record = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    inputHash: null, // set by caller if hashing is desired; left null by default
    inputType, // 'sms' | 'email' | 'message' | 'url'
    riskScore,
    riskLevel,
    detectedThreats,
  };
  return db.insert(record);
}

async function getAllAnalyses() {
  return db.getAll();
}

module.exports = {
  saveAnalysis,
  getAllAnalyses,
};
