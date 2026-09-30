const riskEngine = require('../services/riskEngine');
const analysisModel = require('../models/analysisModel');

const MAX_INPUT_LENGTH = 5000;
const VALID_MODES = new Set(['text', 'url', 'upi']);

function detectInputType(text) {
  const trimmed = text.trim();
  if (/^(https?:\/\/|www\.)\S+$/i.test(trimmed)) return 'url';
  if (/@\S+\.\S+/.test(trimmed) && trimmed.length > 200) return 'email';
  if (trimmed.length <= 200) return 'sms';
  return 'message';
}

/**
 * mode: 'text' (default) runs the full free-text scam engine; 'url' runs the
 * dedicated link checker; 'upi' runs the dedicated UPI/phone checker. All
 * three still go through the same aggregate persistence + history logic.
 */
async function analyze(req, res, next) {
  try {
    const { text, mode } = req.body || {};

    if (typeof text !== 'string' || text.trim().length === 0) {
      const err = new Error('Please paste a message, SMS, email, URL, or UPI ID to analyze.');
      err.status = 400;
      throw err;
    }
    if (text.length > MAX_INPUT_LENGTH) {
      const err = new Error(`Input is too long. Please paste under ${MAX_INPUT_LENGTH} characters.`);
      err.status = 400;
      throw err;
    }
    const effectiveMode = VALID_MODES.has(mode) ? mode : 'text';

    let result;
    let inputType;
    if (effectiveMode === 'url') {
      result = riskEngine.analyzeUrl(text);
      inputType = 'url';
    } else if (effectiveMode === 'upi') {
      result = riskEngine.analyzeUpi(text);
      inputType = 'upi';
    } else {
      result = riskEngine.analyzeText(text);
      inputType = detectInputType(text);
    }

    await analysisModel.saveAnalysis({
      userId: req.userId || null,
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
        'This is an automated risk assessment, not a guarantee. It does not provide perfect detection - always use your own judgement and verify through official channels.',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { analyze };
