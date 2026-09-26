const express = require('express');
const { getMyHistory } = require('../controllers/historyController');
const { requireUser } = require('../middleware/requireUser');

const router = express.Router();

router.get('/', requireUser, getMyHistory);

module.exports = router;
