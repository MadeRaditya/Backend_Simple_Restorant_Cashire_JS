const express = require('express');
const router = require('express').Router();
const adminController = require("../controllers/adminController");
const verifyToken = require('../middleware/verifyToken')

router.get("/dashboard",verifyToken ,adminController.getDashboardstats);
router.get("/chart",verifyToken ,adminController.getChartData);

module.exports = router