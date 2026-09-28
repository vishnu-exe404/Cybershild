const express = require('express');
const { listUsers, getUser, createUser, updateUser, deleteUser } = require('../controllers/adminUserController');
const { getAnalytics } = require('../controllers/analyticsController');
const { requireAdmin } = require('../middleware/requireAdmin');

const router = express.Router();

// Every route below requires a valid admin session (checked server-side).
router.use(requireAdmin);

router.get('/users', listUsers);
router.post('/users', createUser);
router.get('/users/:id', getUser);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

router.get('/stats', getAnalytics);

module.exports = router;
