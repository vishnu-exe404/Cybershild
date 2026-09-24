/**
 * Detects and analyzes URLs found inside submitted text for suspicious or
 * deceptive characteristics. This module intentionally does NOT fetch or
 * execute any URL — it only inspects the string itself, per the security
 * requirements ("Do not execute submitted URLs").
 */

const URL_REGEX = /\b((?:https?:\/\/|www\.)[^\s<>"']+)/gi;

const URL_SHORTENERS = [
  'bit.ly',
  'tinyurl.com',
  'goo.gl',
  't.co',
  'is.gd',
  'cutt.ly',
  'rb.gy',
  'shorturl.at',
];

const SUSPICIOUS_TLDS = ['.xyz', '.top', '.click', '.link', '.gq', '.tk', '.cf', '.ml', '.work', '.zip'];

const KNOWN_BRANDS = [
  'sbi',
  'hdfc',
  'icici',
  'axis',
  'paytm',
  'phonepe',
  'irctc',
  'amazon',
  'flipkart',
  'google',
  'whatsapp',
  'indiapost',
  'incometax',
];

function extractUrls(text) {
  const matches = text.match(URL_REGEX) || [];
  return matches.map((u) => u.replace(/[.,;:!?)]+$/, '')); // trim trailing punctuation
}

function getHostname(rawUrl) {
  try {
    const withProtocol = rawUrl.startsWith('http') ? rawUrl : `http://${rawUrl}`;
    return new URL(withProtocol).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function isIpAddress(hostname) {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);
}

function countSubdomains(hostname) {
  return hostname.split('.').length - 2;
}

function looksLikeBrandLookalike(hostname) {
  if (!hostname) return false;
  return KNOWN_BRANDS.some((brand) => {
    const containsBrand = hostname.includes(brand);
    const isOfficialDomain = hostname === `${brand}.com` || hostname.endsWith(`.${brand}.com`);
    // Flag when brand name appears but combined with hyphens/extra words
    // (e.g. "sbi-kyc-update.com") rather than the real domain.
    return containsBrand && !isOfficialDomain && (hostname.includes('-') || countSubdomains(hostname) > 1);
  });
}

/**
 * @param {string} text
 * @returns {{ urls: string[], findings: Array }}
 */
function analyze(text) {
  const urls = extractUrls(text);
  const findings = [];

  for (const rawUrl of urls) {
    const hostname = getHostname(rawUrl);
    if (!hostname) continue;

    if (URL_SHORTENERS.includes(hostname)) {
      findings.push({
        id: 'url_shortener',
        category: 'Suspicious URL',
        label: 'Shortened Link',
        weight: 12,
        reason: `The link uses a URL shortener (${hostname}), which hides the real destination.`,
        recommendation: 'Avoid clicking shortened links from unknown senders. Ask for the full URL first.',
      });
    }

    if (isIpAddress(hostname)) {
      findings.push({
        id: 'url_ip_address',
        category: 'Suspicious URL',
        label: 'Raw IP Address Link',
        weight: 20,
        reason: 'The link points directly to an IP address instead of a normal domain name.',
        recommendation: 'Do not visit links that use a raw IP address — legitimate businesses use named domains.',
      });
    }

    if (SUSPICIOUS_TLDS.some((tld) => hostname.endsWith(tld))) {
      findings.push({
        id: 'url_suspicious_tld',
        category: 'Suspicious URL',
        label: 'Unusual Domain Ending',
        weight: 10,
        reason: `The link uses an uncommon domain ending (${hostname.split('.').pop()}) frequently used in scam sites.`,
        recommendation: 'Be cautious of unfamiliar domain endings, especially combined with urgent requests.',
      });
    }

    if (countSubdomains(hostname) > 2) {
      findings.push({
        id: 'url_excess_subdomains',
        category: 'Suspicious URL',
        label: 'Excessive Subdomains',
        weight: 10,
        reason: `The link has an unusually long/complex address (${hostname}), often used to disguise fake sites.`,
        recommendation: 'Check the actual root domain carefully before trusting a link like this.',
      });
    }

    if (looksLikeBrandLookalike(hostname)) {
      findings.push({
        id: 'url_brand_lookalike',
        category: 'Suspicious URL',
        label: 'Lookalike / Deceptive Brand URL',
        weight: 22,
        reason: `The link (${hostname}) appears to imitate a well-known brand name but is not the official domain.`,
        recommendation: 'Do not enter any details. Go to the brand\'s official app or type their website address manually.',
      });
    }
  }

  if (urls.length > 0 && findings.length === 0) {
    findings.push({
      id: 'url_present_generic',
      category: 'Suspicious URL',
      label: 'Link Present',
      weight: 5,
      reason: 'The message contains a link. Links in unsolicited messages should always be treated with caution.',
      recommendation: 'Verify the sender before clicking any link, even if nothing else looks obviously wrong.',
    });
  }

  return { urls, findings };
}

module.exports = { analyze, extractUrls };
