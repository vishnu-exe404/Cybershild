const digitalArrestRules = require('../rules/digitalArrestRules');
const courierScamRules = require('../rules/courierScamRules');
const maliciousAppRules = require('../rules/maliciousAppRules');
const otpRules = require('../rules/otpRules');
const urgencyRules = require('../rules/urgencyRules');
const upiRules = require('../rules/upiRules');

/**
 * Runs all India-specific / behavioral scam-pattern rule modules and
 * returns a flat list of findings. Adding a new scam category later is as
 * simple as creating a new rules/xRules.js file and listing it here.
 */
const MODULES = [digitalArrestRules, courierScamRules, maliciousAppRules, otpRules, urgencyRules, upiRules];

function analyze(text) {
  return MODULES.flatMap((mod) => mod.evaluate(text));
}

module.exports = { analyze };
