/**
 * "Spot the Scam" quiz content. Kept as versioned code (not a DB table)
 * since the questions themselves are fixed editorial content - only
 * *attempts* (services/quizContent.js consumers) are persisted.
 * The `isScam` answer key is stripped before questions are sent to the
 * client (see quizController.getQuestions), so scoring can only happen
 * server-side in submitAttempt - a client can't submit a fabricated score.
 */
const QUESTIONS = [
  {
    id: 'q1',
    sender: '+91-98450-XXXXX',
    body: 'Dear Customer, your electricity connection power will be disconnected at 9.30 PM today because your previous month bill was not updated. Immediately call officer Mr. Sharma at 9845012345.',
    isScam: true,
    explanation: 'Electricity boards send formal written notices, never an SMS threatening same-day disconnection with a personal mobile number to call.',
  },
  {
    id: 'q2',
    sender: 'FedEx',
    body: 'Your FedEx parcel #4928 is seized by Mumbai Customs for containing prohibited items. Press 9 to connect with a Customs Inspector to pay clearance fee.',
    isScam: true,
    explanation: 'Couriers never transfer calls directly to "customs officers", and clearance fees are never collected by phone via UPI.',
  },
  {
    id: 'q3',
    sender: 'HDFC Bank',
    body: 'Rs. 1,250.00 debited from a/c **4821 on 12-Mar-26 for UPI/mobile recharge. Avl Bal Rs. 8,940.30. Not you? Call 18002586161.',
    isScam: false,
    explanation: 'This is a standard transaction alert: no urgency, no link, no request for OTP/PIN, and it gives the bank\'s real published helpline.',
  },
  {
    id: 'q4',
    sender: 'Unknown (WhatsApp)',
    body: 'Earn Rs 3000 to 8000 daily working 30 mins from home. Like 3 videos now and receive Rs 150 immediately. Join our Telegram group to start.',
    isScam: true,
    explanation: 'Tiny upfront payouts are bait; genuine jobs never pay per "like" or require joining an anonymous Telegram group first.',
  },
  {
    id: 'q5',
    sender: 'Dr. Mehta Clinic',
    body: 'Reminder: your dental check-up appointment is tomorrow at 4:30 PM. Reply CONFIRM or call the clinic to reschedule.',
    isScam: false,
    explanation: 'A routine appointment reminder with no payment request, no threats, and a normal reschedule option.',
  },
];

function getPublicQuestions() {
  return QUESTIONS.map(({ id, sender, body }) => ({ id, sender, body }));
}

function gradeAnswers(answers) {
  const submitted = new Map((Array.isArray(answers) ? answers : []).map((a) => [a.questionId, Boolean(a.answerIsScam)]));
  const results = QUESTIONS.map((q) => {
    const given = submitted.has(q.id) ? submitted.get(q.id) : null;
    return { questionId: q.id, correct: given === q.isScam, correctAnswer: q.isScam, explanation: q.explanation };
  });
  const score = results.filter((r) => r.correct).length;
  return { score, total: QUESTIONS.length, results };
}

module.exports = { getPublicQuestions, gradeAnswers };
