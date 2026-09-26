const express = require('express');
const { listUsers, updateUser, deleteUser } = require('../controllers/adminUserController');
const { getAnalytics } = require('../controllers/analyticsController');
const { requireAdmin } = require('../middleware/requireAdmin');

const router = express.Router();

// Every route below requires a valid admin session (server-side check,
// not just a hidden frontend route) - see backend/middleware/requireAdmin.js
router.use(requireAdmin);

router.get('/users', listUsers);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

router.get('/stats', getAnalytics);

module.exports = router;
