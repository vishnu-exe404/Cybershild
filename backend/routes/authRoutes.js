const express = require('express');
const { register, login, logout, me, completeOnboarding } = require('../controllers/authController');
const { requireUser } = require('../middleware/requireUser');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', requireUser, me);
router.post('/onboarding/complete', requireUser, completeOnboarding);

module.exports = router;
