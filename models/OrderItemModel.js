const db = require('../config/db');

const addOrderItemsModel = (orderId, items) => {
    return new Promise((resolve, reject) => {
        const query = `
            INSERT INTO order_items 
            (order_id, menu_item_id, quantity, price) 
            VALUES ?
        `;
        const values = items.map(item => [
            orderId,
            item.menuItemId,
            item.quantity,
            item.price
        ]);

        db.query(query, [values], (err, result) => {
            if(err) {
                console.error('Error adding order items:', err);
                return reject(err);
            }
            resolve(result);
        });
    });
}


const fetchOrderItemsModel = (orderId) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT oi.*, mi.name, mi.category
            FROM order_items oi
            JOIN menu_items mi ON oi.menu_item_id = mi.id
            WHERE oi.order_id = ?
        `;
        db.query(query, [orderId], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
}

const promisifyQuery = (query, params) => {
    return new Promise((resolve, reject) => {
        db.query(query, params, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

const updateOrderItemModel = async (orderId, items) => {
    try {
        await promisifyQuery('DELETE FROM order_items WHERE order_id = ?', [orderId]);

        const values = items.map(item => [
            orderId,
            item.menuItemId,
            item.quantity,
            item.price
        ]);

        const query = `
            INSERT INTO order_items 
            (order_id, menu_item_id, quantity, price) 
            VALUES ?
        `;

        await promisifyQuery(query, [values]);
    } catch (error) {
        console.error('Error updating order items:', error);
        throw error;
    }
}


module.exports = {
    addOrderItemsModel,
    fetchOrderItemsModel,
    updateOrderItemModel 
}
