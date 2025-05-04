const TransactionController = require('../controllers/TransactionController');
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');

router.get('/transactions', verifyToken, TransactionController.fetchAllTransactionsController);

module.exports = router;