const express = require('express');
const { analyze } = require('../controllers/analysisController');
const { attachUserIfPresent } = require('../middleware/requireUser');

const router = express.Router();

// POST /api/analyze - open to everyone (per the platform's "free, simple,
// accessible" purpose). If the visitor is logged in, the check is linked
// to their account so it appears in their history.
router.post('/', attachUserIfPresent, analyze);

module.exports = router;
