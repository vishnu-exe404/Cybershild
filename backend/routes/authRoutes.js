const express = require('express');
const c = require('../controllers/authController');
const { requireUser } = require('../middleware/requireUser');

const router = express.Router();

router.post('/register', c.register);
router.post('/login', c.login);
router.post('/logout', c.logout);
router.post('/forgot-password', c.forgotPassword);
router.post('/reset-password', c.resetPassword);

router.get('/me', requireUser, c.me);
router.patch('/me', requireUser, c.updateProfile);
router.post('/change-password', requireUser, c.changePassword);
router.post('/onboarding/complete', requireUser, c.completeOnboarding);

module.exports = router;
