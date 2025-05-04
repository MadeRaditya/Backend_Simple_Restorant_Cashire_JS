const orderModel = require('../models/OrderModel');
const orderItemModel = require('../models/OrderItemModel');
const db = require('../config/db')


const fetchAllOrdersController = async (req, res) => {
    if (!req.user || !req.user.role) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Access denied. Only admin can read data of transactions' });
    }

    try {
        const orders = await orderModel.getAllOrdersModel()
        if(!orders) {
            return res.status(404).json({ message: 'Orders not found' });
        }
        res.status(200).json({ orders });
    } catch (error) {
        console.error('Error fetching Orders:', error);
        res.status(500).json({
            message: 'Error fetching Orders',
            error: error.message
        });
        
    }
}

const createOrderController = async (req, res) => {
    const { orderType, items } = req.body;
    let tableId = req.body.tableId;

    if(!tableId){
        tableId = null;
    }

    if (!req.user || !req.user.role) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role !== 'kasir' && req.user.role !== 'pelayan') {
        return res.status(401).json({ message: 'Access denied. Only kasir and pelayan can create orders' });
    }

    try {
        const totalAmount = items.reduce((sum, item) => {
            return sum + (parseFloat(item.price) * parseInt(item.quantity));
        }, 0);

        const orderResult = await orderModel.createOrderModel(
            req.user.user_id,
            tableId,
            orderType,
            totalAmount
        );

        console.log('Order created:', orderResult);

        if (!orderResult || !orderResult.insertId) {
            throw new Error('Failed to create order');
        }

        const orderId = orderResult.insertId;
        
        try {
            const orderItemsResult = await orderItemModel.addOrderItemsModel(orderId, items);
            console.log('Order items added:', orderItemsResult);
        } catch (error) {
            console.error('Error adding order items:', error);
            await orderModel.updateOrderStatusModel(orderId, 'cancelled');
            throw new Error('Failed to add order items');
        }

        if (orderType === 'dine-in' && tableId) {
            await orderModel.updateTableStatusModel(tableId, 'occupied');
        }

        res.status(201).json({
            message: 'Order created successfully',
            orderId: orderResult.insertId,
            totalAmount
        });
    } catch(error) {
        console.error('Order creation error:', error);
        res.status(500).json({ 
            message: 'Error creating order',
            error: error.message 
        });
    }
}


const fetchOrderByIdController = async (req, res) => {
    const id = parseInt(req.params.id);

    if (!id) {
        return res.status(400).json({ message: 'Order id is required' });
    }

    try {
        const order = await orderModel.featchOrderbyIdModel(id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const orderItems = await orderItemModel.fetchOrderItemsModel(id);

        res.status(200).json({ 
            order, 
            items: orderItems 
        });
    } catch(error) {
        console.error('Error fetching order by id:', error);
        res.status(500).json({ 
            message: 'Error fetching order',
            error: error.message 
        });
    }
}

const fetchPendingOrderController = async (req, res) => {
    const { order_type } = req.query;  

    try {
        const orders = await orderModel.fetchPendingOrdersModel('pending', order_type);  
        res.status(200).json({ orders });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ 
            message: 'Error fetching orders',
            error: error.message 
        });
    }
};


const updateOrderController = async (req, res) => {
    const id = parseInt(req.params.id);
    const { items } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'Order id is required' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'Items are required and must be a non-empty array' });
    }

    if (!req.user || !req.user.role) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role !== 'kasir' && req.user.role !== 'pelayan') {
        return res.status(401).json({ message: 'Access denied. Only kasir and pelayan can update orders' });
    }

    try {
        const order = await orderModel.featchOrderbyIdModel(id);
        if (!order || order.status !== 'pending') {
            return res.status(404).json({ message: 'Order not found or already processed' });
        }

        const validMenuItems = await checkMenuItemsExist(items);
        if (!validMenuItems) {
            return res.status(400).json({ message: 'One or more menu items do not exist.' });
        }

        const totalAmount = items.reduce((sum, item) => {
            return sum + (parseFloat(item.price) * parseInt(item.quantity));
        }, 0);

        await orderItemModel.updateOrderItemModel(id, items);
        await orderModel.updateOrderTotalModel(id, totalAmount); 

        res.status(200).json({ 
            message: 'Order updated successfully', 
            orderId: id,
            totalAmount
        });
    } catch(error) {
        console.error('Error updating order:', error);
        res.status(500).json({ 
            message: 'Error updating order',
            error: error.message 
        });
    }
};

const promisifyQuery = (query, params) => {
    return new Promise((resolve, reject) => {
        db.query(query, params, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

const checkMenuItemsExist = async (items) => {
    const menuItemIds = items.map(item => item.menuItemId);
    const query = `SELECT id FROM menu_items WHERE id IN (?)`;
    const result = await promisifyQuery(query, [menuItemIds]);

    return result.length === menuItemIds.length;  
};

const processPaymentController = (req, res) => {
    const { orderId, paymentMethod, amountPaid } = req.body;

    if (!orderId || !paymentMethod || !amountPaid) {
        return res.status(400).json({ message: 'Missing required payment details' });
    }

    if (!req.user || req.user.role !== 'kasir') {
        return res.status(403).json({ message: 'Only kasir can process payments' });
    }

    orderModel.processPaymentModel(orderId, paymentMethod, parseFloat(amountPaid))
        .then((paymentResult) => {
            res.status(200).json({
                message: 'Payment processed successfully',
                paymentId: paymentResult.paymentId,
                totalAmount: paymentResult.totalAmount,
                amountPaid: paymentResult.amountPaid,
                changeGiven: paymentResult.changeGiven
            });
        })
        .catch((error) => {
            console.error('Payment processing error:', error);
            res.status(500).json({ 
                message: 'Error processing payment',
                error: error.message 
            });
        });
};



const cancelOrderController = async (req, res) => {
    const id = parseInt(req.params.id);

    if (!id) {
        return res.status(400).json({ message: 'Order id is required' });
    }

    try {
        const order = await orderModel.featchOrderbyIdModel(id);
        if (!order || order.status !== 'pending') {
            return res.status(404).json({ message: 'Order not found or already processed' });
        }

        await orderModel.updateOrderStatusModel(id, 'cancelled');

        if (order.order_type === 'dine-in' && order.table_id) {
            await orderModel.updateTableStatusModel(order.table_id, 'available');
        }

        res.status(200).json({ message: 'Order cancelled successfully' });
    } catch(error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({ 
            message: 'Error cancelling order',
            error: error.message 
        });
    }
}

module.exports = {
    fetchAllOrdersController,
    createOrderController,
    fetchOrderByIdController,
    fetchPendingOrderController,
    updateOrderController,
    cancelOrderController,
    processPaymentController,
}
