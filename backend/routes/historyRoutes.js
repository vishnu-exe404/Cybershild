const express = require('express');
const { getMyHistory, deleteMyHistoryItem, clearMyHistory } = require('../controllers/historyController');
const { requireUser } = require('../middleware/requireUser');

const router = express.Router();

router.use(requireUser);
router.get('/', getMyHistory);
router.delete('/', clearMyHistory);
router.delete('/:id', deleteMyHistoryItem);

module.exports = router;
