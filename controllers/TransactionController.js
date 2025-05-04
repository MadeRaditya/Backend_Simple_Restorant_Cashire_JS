const TransactionModel = require('../models/TransactionModel');

const fetchAllTransactionsController = async (req, res) => {
    if (!req.user || !req.user.role) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Access denied. Only admin can read data of transactions' });
    }

    try {
        const transactions = await TransactionModel.allTransactionModel()
        if(!transactions) {
            return res.status(404).json({ message: 'Transactions not found' });
        }
        res.status(200).json({ transactions });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({
            message: 'Error fetching transactions',
            error: error.message
        });
        
    }
}


module.exports = {fetchAllTransactionsController}