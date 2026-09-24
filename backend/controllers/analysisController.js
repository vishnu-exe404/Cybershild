const riskEngine = require('../services/riskEngine');
const analysisModel = require('../models/analysisModel');

const MAX_INPUT_LENGTH = 5000;

function detectInputType(text) {
  const trimmed = text.trim();
  if (/^(https?:\/\/|www\.)\S+$/i.test(trimmed)) return 'url';
  if (/@\S+\.\S+/.test(trimmed) && trimmed.length > 200) return 'email';
  if (trimmed.length <= 200) return 'sms';
  return 'message';
}

async function analyze(req, res, next) {
  try {
    const { text } = req.body || {};

    if (typeof text !== 'string' || text.trim().length === 0) {
      const err = new Error('Please paste a message, SMS, email, or URL to analyze.');
      err.status = 400;
      throw err;
    }

    if (text.length > MAX_INPUT_LENGTH) {
      const err = new Error(`Input is too long. Please paste under ${MAX_INPUT_LENGTH} characters.`);
      err.status = 400;
      throw err;
    }

    const result = riskEngine.analyzeText(text);
    const inputType = detectInputType(text);

    // Persist only aggregated, non-sensitive fields for analytics.
    await analysisModel.saveAnalysis({
      riskScore: result.riskScore,
      riskLevel: result.riskLevel,
      detectedThreats: result.detectedThreats,
      inputType,
    });

    res.json({
      riskScore: result.riskScore,
      riskLevel: result.riskLevel,
      detectedThreats: result.detectedThreats,
      reasons: result.reasons,
      recommendations: result.recommendations,
      disclaimer:
        'This is an automated risk assessment, not a guarantee. It does not provide perfect detection — always use your own judgement and verify through official channels.',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { analyze };
