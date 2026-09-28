const express = require('express');
const {
  register,
  login,
  logout,
  me,
  completeOnboarding,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const { requireUser } = require('../middleware/requireUser');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', requireUser, me);
router.post('/onboarding/complete', requireUser, completeOnboarding);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
