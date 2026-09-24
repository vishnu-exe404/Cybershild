const phishingDetector = require('./phishingDetector');
const scamPatternDetector = require('./scamPatternDetector');
const keywordDetector = require('./keywordDetector');

const RISK_LEVELS = {
  SAFE: 'SAFE',
  CAUTION: 'CAUTION',
  HIGH_RISK: 'HIGH_RISK',
};

/**
 * Converts a raw accumulated weight total into a 0-100 score.
 * Diminishing returns are applied so that many small signals don't
 * unfairly saturate the score, while a few strong signals (OTP request,
 * digital arrest impersonation) can still push it into HIGH_RISK quickly.
 */
function weightToScore(totalWeight) {
  const score = 100 * (1 - Math.exp(-totalWeight / 45));
  return Math.round(Math.min(100, Math.max(0, score)));
}

function scoreToLevel(score) {
  if (score >= 60) return RISK_LEVELS.HIGH_RISK;
  if (score >= 25) return RISK_LEVELS.CAUTION;
  return RISK_LEVELS.SAFE;
}

/**
 * Runs every detection module against the input text and produces the
 * final risk assessment. This is the single entry point the controller
 * calls — new detection modules should be added here, not scattered
 * across the codebase.
 *
 * @param {string} rawText - the pasted SMS / email / message / URL
 * @returns {{
 *   riskScore: number,
 *   riskLevel: 'SAFE'|'CAUTION'|'HIGH_RISK',
 *   detectedThreats: string[],
 *   reasons: string[],
 *   recommendations: string[]
 * }}
 */
function analyzeText(rawText) {
  const text = (rawText || '').trim();

  const phishing = phishingDetector.analyze(text);
  const scamPatterns = scamPatternDetector.analyze(text);
  const keywords = keywordDetector.analyze(text);

  const allFindings = [...phishing.findings, ...scamPatterns, ...keywords];

  // De-duplicate by id, keep highest-weight instance if repeated
  const byId = new Map();
  for (const finding of allFindings) {
    const existing = byId.get(finding.id);
    if (!existing || finding.weight > existing.weight) {
      byId.set(finding.id, finding);
    }
  }
  const findings = [...byId.values()];

  const totalWeight = findings.reduce((sum, f) => sum + f.weight, 0);
  const riskScore = findings.length === 0 ? 0 : weightToScore(totalWeight);
  const riskLevel = scoreToLevel(riskScore);

  // Threats sorted by severity (weight) descending, highest-impact first
  const sortedFindings = [...findings].sort((a, b) => b.weight - a.weight);

  const detectedThreats = sortedFindings.map((f) => f.label);
  const reasons = sortedFindings.map((f) => f.reason);
  const recommendations = dedupeStrings(sortedFindings.map((f) => f.recommendation));

  return {
    riskScore,
    riskLevel,
    detectedThreats,
    reasons,
    recommendations: recommendations.length > 0 ? recommendations : [defaultSafeRecommendation()],
    urlsFound: phishing.urls,
  };
}

function dedupeStrings(arr) {
  return [...new Set(arr)];
}

function defaultSafeRecommendation() {
  return 'No strong risk signals were found, but always stay cautious with unexpected messages and never share OTPs or passwords.';
}

module.exports = { analyzeText, RISK_LEVELS };
