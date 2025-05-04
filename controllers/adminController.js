const AdminData = require('../models/AdminModel');


const getDashboardstats = async (req, res) => {
    if (!req.user || !req.user.role) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Access denied. Only admin can create menu items' });
    }
    
    try {
        const dashboardStat = await AdminData.AdminData();
        res.status(200).json(dashboardStat);
    } catch (error) {
        res.status(500).json({ message: 'Error while fetching dashboard stats', error: error.message });
    }
}

const getChartData = async(req,res)=>{
    if (!req.user || !req.user.role) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Access denied. Only admin can create menu items' });
    }
    
    try {
        const dashboardChart = await AdminData.AdminChartModel();
        res.status(200).json(dashboardChart);
    } catch (error) {
        res.status(500).json({ message: 'Error while fetching dashboard stats', error: error.message });
    }
}

module.exports={
    getDashboardstats,getChartData
}