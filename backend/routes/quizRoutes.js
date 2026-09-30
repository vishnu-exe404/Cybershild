const express = require('express');
const { getQuestions, submitAttempt } = require('../controllers/quizController');
const { attachUserIfPresent } = require('../middleware/requireUser');

const router = express.Router();

router.get('/questions', getQuestions);
router.post('/submit', attachUserIfPresent, submitAttempt);

module.exports = router;
