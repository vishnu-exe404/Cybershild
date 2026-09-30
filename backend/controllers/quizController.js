const prisma = require('../config/prisma');
const quizContent = require('../services/quizContent');

function getQuestions(req, res) {
  res.json({ questions: quizContent.getPublicQuestions() });
}

async function submitAttempt(req, res, next) {
  try {
    const { answers } = req.body || {};
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: 'Submit your answers to grade the quiz.' });
    }
    const graded = quizContent.gradeAnswers(answers);
    await prisma.quizAttempt.create({
      data: { userId: req.userId || null, score: graded.score, total: graded.total },
    });
    res.json(graded);
  } catch (err) {
    next(err);
  }
}

module.exports = { getQuestions, submitAttempt };
