const db = require('../config/db');

const promisifyQuery = (query, params) => {
    return new Promise((resolve, reject) => {
        db.query(query, params, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

const AdminData = async () => {
    try {
        const orders = await promisifyQuery("SELECT COUNT(*) AS total_orders FROM orders");

        const payments = await promisifyQuery("SELECT SUM(amount_paid) AS total_payments FROM payments");

        const tables = await promisifyQuery("SELECT COUNT(*) AS total_meja FROM tables");

        const users = await promisifyQuery("SELECT COUNT(*) AS total_users FROM users");
        
        const menu = await promisifyQuery("SELECT COUNT(*) AS total_menu FROM menu_items");


        return {
            totalOrders: orders[0].total_orders,
            totalPayments: payments[0].total_payments,
            totalTables: tables[0].total_meja,
            totalUsers: users[0].total_users,
            totalMenu: menu[0].total_menu
        };

    } catch (error) {
        throw new Error(`Failed to fetch admin data: ${error.message}`);
    }
};

const AdminChartModel = ()=>{
    return new Promise((resolve,reject)=>{
        const query = `
        SELECT
            DATE(p.created_at) AS date,
            SUM(p.amount_paid) AS total_revenue
        FROM
            payments p
        JOIN
            orders o ON p.order_id = o.id
        WHERE
            o.status = 'completed'
        GROUP BY
            DATE(p.created_at)
        ORDER BY
            DATE(p.created_at) DESC;
    `;
        db.query(query,(err,result)=>{
            if(err) return reject(err);
            resolve(result);
        });
    });

    

}

module.exports = { AdminData, AdminChartModel };
