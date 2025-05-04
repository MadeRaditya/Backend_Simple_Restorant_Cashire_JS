const db = require('../config/db');

const allTransactionModel = () => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM payments', (err, result) => {
            if (err) return reject(err);
            resolve(result);
        })
    })
}

module.exports = {allTransactionModel}