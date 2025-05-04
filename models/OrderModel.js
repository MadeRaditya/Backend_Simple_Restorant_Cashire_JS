const db = require('../config/db');


const getAllOrdersModel = () => {
    return new Promise((resolve, reject) => {
        const query = `SELECT o.*, u.username AS user_name, t.table_number
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            LEFT JOIN tables t ON o.table_id = t.id ORDER BY o.created_at DESC`
        db.query(query, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        })
    })
}

const createOrderModel = (userId, tableId, orderType, totalAmount) => {
    return new Promise((resolve, reject) => {
        const query = `
            INSERT INTO orders 
            (user_id, table_id, order_type, total_amount, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, 'pending', NOW(), NOW())
        `;
        
        db.query(query, [userId, tableId, orderType, totalAmount], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
}

const featchOrderbyIdModel = (id) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT o.*, u.username AS user_name, t.table_number 
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            LEFT JOIN tables t ON o.table_id = t.id
            WHERE o.id = ?
        `;
        
        db.query(query, [id], (err, results) => {
            if (err) return reject(err);
            resolve(results[0]);
        });
    });
}

const fetchPendingOrdersModel = (status = 'pending', orderType) => {
    return new Promise((resolve, reject) => {
        let query = `
            SELECT o.*, u.username AS user_name, t.table_number
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            LEFT JOIN tables t ON o.table_id = t.id
            WHERE o.status = ?
        `;
        let queryParams = [status];

        if (orderType) {
            query += ' AND o.order_type = ?';
            queryParams.push(orderType);
        }

        query += ' ORDER BY o.created_at DESC';

        db.query(query, queryParams, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

const promisifyQuery = (query, params) => {
    return new Promise((resolve, reject) => {
        db.query(query, params, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};


const updateOrderTotalModel = async (orderId, totalAmount, status = 'pending') => {
    const query = 'UPDATE orders SET total_amount = ?, status = ? WHERE id = ?';
    try {
        await promisifyQuery(query, [totalAmount, status, orderId]);
    } catch (error) {
        throw error;
    }
}

const updateOrderStatusModel = (orderId, status) => {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE orders SET status = ? WHERE id = ?';
        
        db.query(query, [status, orderId], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
}

const updateTableStatusModel = (tableId, status) => {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE tables SET status = ? WHERE id = ?';
        
        db.query(query, [status, tableId], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
}



const processPaymentModel = (orderId, paymentMethod, amountPaid) => {
    return new Promise((resolve, reject) => {
        db.beginTransaction((err) => {
            if (err) return reject(err);

            db.query('SELECT total_amount FROM orders WHERE id = ?', [orderId], async (err, results) => {
                if (err) {
                    return db.rollback(() => {
                        reject(err);
                    });
                }

                const orderDetails = results[0];
                if (!orderDetails) {
                    return db.rollback(() => {
                        reject(new Error('Order not found'));
                    });
                }

                const totalAmount = parseFloat(orderDetails.total_amount);
                const changeGiven = Math.max(0, amountPaid - totalAmount);

                try {
                    const paymentResult = await promisifyQuery(
                        'INSERT INTO payments (order_id, amount_paid, change_given, payment_method) VALUES (?, ?, ?, ?)',
                        [orderId, amountPaid, changeGiven, paymentMethod]
                    );

                    await promisifyQuery(
                        'UPDATE orders SET status = ? WHERE id = ?',
                        ['completed', orderId]
                    );

                    await promisifyQuery(
                        'UPDATE tables t JOIN orders o ON t.id = o.table_id SET t.status = ? WHERE o.id = ?',
                        ['available', orderId]
                    );

                    db.commit((err) => {
                        if (err) {
                            return db.rollback(() => {
                                reject(err);
                            });
                        }

                        resolve({
                            paymentId: paymentResult.insertId,
                            totalAmount,
                            amountPaid,
                            changeGiven
                        });
                    });
                } catch (error) {
                    db.rollback(() => {
                        reject(error);
                    });
                }
            });
        });
    });
};




module.exports = {
    getAllOrdersModel,
    createOrderModel,
    featchOrderbyIdModel,
    fetchPendingOrdersModel,
    updateOrderTotalModel,
    updateOrderStatusModel,
    updateTableStatusModel,
    processPaymentModel
}
