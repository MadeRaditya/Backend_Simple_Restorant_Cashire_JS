const express = require('express');
const orderController = require('../controllers/orderControllers');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');

router.get('/order',verifyToken, orderController.fetchAllOrdersController);
router.post('/order/add', verifyToken, orderController.createOrderController);
router.get('/order/:id', orderController.fetchOrderByIdController);
router.get('/pendingOrder', orderController.fetchPendingOrderController);
router.put('/order/:id/update', verifyToken, orderController.updateOrderController);
router.put('/order/:id/cancel', verifyToken, orderController.cancelOrderController);
router.post('/order/:id/payment', verifyToken, orderController.processPaymentController);

module.exports = router;