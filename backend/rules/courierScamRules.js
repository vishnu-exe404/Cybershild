/**
 * Courier / parcel scam rules - fake delivery failure notices, customs
 * holds, or "your parcel contains illegal items" scams (FedEx/customs
 * impersonation is very common in India).
 */

const RULES = [
  {
    id: 'courier_delivery_failed',
    label: 'Fake Delivery Failure Notice',
    weight: 15,
    test: (t) => /\b(delivery\s+(failed|unsuccessful|pending)|parcel\s+(held|stuck|on hold)|reschedule\s+delivery)\b/i.test(t),
    reason: 'The message claims a delivery failed or a parcel is being held, a common courier-scam hook.',
    recommendation: 'Do not click links or pay fees. Check tracking only on the courier\'s official app or website.',
  },
  {
    id: 'courier_customs_hold',
    label: 'Fake Customs / Duty Hold',
    weight: 20,
    test: (t) => /\b(customs|courier)\b.*\b(hold|seized|illegal|duty|fee|clearance)\b/i.test(t) ||
      /\b(pay|clear)\b.*\b(customs duty|clearance fee)\b/i.test(t),
    reason: 'The message claims your parcel is held at customs and demands a fee or "clearance" payment.',
    recommendation: 'Genuine customs dues are never collected via a link sent by SMS/WhatsApp. Contact the courier company directly.',
  },
  {
    id: 'courier_small_payment',
    label: 'Small "Redelivery" Payment Request',
    weight: 12,
    test: (t) => /\b(pay|₹|rs\.?)\s*\d{1,4}\b.*\b(redeliver|delivery|shipping)\b/i.test(t),
    reason: 'The message asks for a small payment to "redeliver" a package — scammers use tiny amounts to steal card details via a fake payment page.',
    recommendation: 'Do not enter card details on any link from an SMS. Verify directly with the courier company.',
  },
];

function evaluate(text) {
  return RULES.filter((rule) => rule.test(text)).map(({ id, label, weight, reason, recommendation }) => ({
    id,
    category: 'Courier / Parcel Scam',
    label,
    weight,
    reason,
    recommendation,
  }));
}

module.exports = { evaluate, RULES };
