const express = require('express');
const MejaControllers = require("../controllers/MejaController");
const { body, validationResult } = require('express-validator');
const verifyToken = require('../middleware/verifyToken');
const router = express.Router();

router.get('/meja', MejaControllers.fetchAllMeja);
router.get('/available_Table', MejaControllers.fetchAvailableMeja);
router.get('/meja/:id', MejaControllers.fetchMejaById);
router.post('/meja/add',verifyToken,[
    body('table_number').isLength({min:5}).isString().withMessage('Table number must be a string with 5 characters'),
    body('capacity').notEmpty().isNumeric().withMessage('Capacity is required and must be a number'),
    body('status').isIn(['available','occupied']).withMessage('Status must be either available or occupied')
], (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array() });
    }
    next();
}, MejaControllers.AddMejaController);

router.put('/meja/edit/:id',verifyToken,[
    body('table_number').isLength({min:5}).isString().withMessage('Table number must be a string with 5 characters'),
    body('capacity').notEmpty().isNumeric().withMessage('Capacity is required and must be a number'),
    body('status').isIn(['available','occupied']).withMessage('Status must be either available or occupied')
], (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array() });
    }
    next();
}, MejaControllers.editMejaController);

router.delete('/meja/delete/:id',verifyToken ,MejaControllers.deleteMejaController);

module.exports = router;