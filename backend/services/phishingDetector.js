const phishingRules = require('../rules/phishingRules');
const urlDetector = require('./urlDetector');

/**
 * Runs phishing-specific rules and URL analysis together, since phishing
 * almost always involves a deceptive link.
 */
function analyze(text) {
  const ruleFindings = phishingRules.evaluate(text);
  const { urls, findings: urlFindings } = urlDetector.analyze(text);

  return {
    urls,
    findings: [...ruleFindings, ...urlFindings],
  };
}

module.exports = { analyze };
