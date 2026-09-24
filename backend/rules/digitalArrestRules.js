/**
 * "Digital arrest" scam rules - scammers impersonate police/CBI/customs/courts
 * and claim the victim is under investigation or "digital arrest", demanding
 * money or a video call to avoid arrest.
 */

const RULES = [
  {
    id: 'digitalarrest_authority_impersonation',
    label: 'Law Enforcement Impersonation',
    weight: 25,
    test: (t) => /\b(cbi|police|customs|narcotics|enforcement directorate|\bed\b|trai|court|judge|arrest warrant)\b/i.test(t),
    reason: 'The message impersonates a law enforcement or government authority.',
    recommendation: 'Real police/courts never conduct arrests or investigations over phone/video call. Do not engage — verify by visiting the nearest police station.',
  },
  {
    id: 'digitalarrest_video_call',
    label: 'Coerced Video Call / "Digital Arrest"',
    weight: 25,
    test: (t) => /\b(video\s*call|skype|stay\s+on\s+(the\s+)?call|do not disconnect|under\s+(digital\s+)?arrest|surveillance)\b/i.test(t),
    reason: 'The message pressures you to stay on a video call or claims you are under "digital arrest" — this is not a real legal procedure in India.',
    recommendation: 'Disconnect immediately. There is no such thing as a legitimate "digital arrest". Report to cybercrime.gov.in.',
  },
  {
    id: 'digitalarrest_illegal_parcel',
    label: 'Illegal Parcel / Drugs Linked to You',
    weight: 20,
    test: (t) => /\b(illegal\s+(parcel|package|drugs|substance)|your\s+(aadhaar|pan|phone number)\s+.*(used|linked|involved)\s+in)\b/i.test(t),
    reason: 'The message claims an illegal parcel, drugs, or crime is linked to your identity — a known digital-arrest scam script.',
    recommendation: 'This is a scam script. Do not share OTPs, bank details, or make any payment. Report to 1930 or cybercrime.gov.in.',
  },
];

function evaluate(text) {
  return RULES.filter((rule) => rule.test(text)).map(({ id, label, weight, reason, recommendation }) => ({
    id,
    category: 'Digital Arrest Scam',
    label,
    weight,
    reason,
    recommendation,
  }));
}

module.exports = { evaluate, RULES };
