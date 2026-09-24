/**
 * Malicious / screen-sharing app prompt rules - scammers ask victims to
 * install remote-access apps (AnyDesk, TeamViewer, QuickSupport) or APK
 * files outside the Play Store, often for fake "refunds" or "KYC updates".
 */

const RULES = [
  {
    id: 'app_remote_access',
    label: 'Remote Access App Request',
    weight: 25,
    test: (t) => /\b(anydesk|teamviewer|quicksupport|screen\s*share|remote\s+access|rustdesk)\b/i.test(t),
    reason: 'The message asks you to install a remote-access/screen-sharing app, which lets a scammer control your phone.',
    recommendation: 'Never install remote-access apps for strangers. Uninstall immediately if already installed and contact your bank.',
  },
  {
    id: 'app_apk_sideload',
    label: 'APK Install Outside Play Store',
    weight: 20,
    test: (t) => /\.apk\b/i.test(t) || /\binstall\s+(this\s+)?app\b.*\b(link|below)\b/i.test(t),
    reason: 'The message links to an app (.apk) installed outside the Play Store, which can contain malware.',
    recommendation: 'Only install apps from the official Play Store/App Store. Do not install APK files from links.',
  },
  {
    id: 'app_fake_refund',
    label: 'Fake Refund via App Install',
    weight: 18,
    test: (t) => /\b(refund|cashback)\b.*\b(install|app|download)\b/i.test(t),
    reason: 'The message promises a refund or cashback in exchange for installing an app — a common fraud pattern used to gain device access.',
    recommendation: 'Legitimate refunds never require installing a special app. Do not proceed.',
  },
];

function evaluate(text) {
  return RULES.filter((rule) => rule.test(text)).map(({ id, label, weight, reason, recommendation }) => ({
    id,
    category: 'Malicious App Prompt',
    label,
    weight,
    reason,
    recommendation,
  }));
}

module.exports = { evaluate, RULES };
