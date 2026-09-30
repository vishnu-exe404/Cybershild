const express = require('express');
const { getFeed, getStats } = require('../controllers/publicController');

const router = express.Router();

router.get('/feed', getFeed);
router.get('/stats', getStats);

module.exports = router;
