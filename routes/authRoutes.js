const express = require('express');
const authController = require('../controllers/authController')
const router = express.Router();
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const verifyToken = require('../middleware/verifyToken');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 3,
    message: 'Too many login attempts. Please try again after 15 minutes'
});

router.post("/register", [
    body('username').isAlphanumeric().isLength({min:5}).withMessage('Username must be alphanumeric and at least 5 characters long'),
    body('password')
  .isLength({ min: 8 })
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/)
  .withMessage('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    body('role').isIn(['admin', 'kasir', 'pelayan']).withMessage('Role must be either admin, kasir, or pelayan')
], (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array() });
    }
    next();
}, authController.register);

router.post("/login",[
    body('username').isString().isLength({min:5}).withMessage('Username at least 5 characters long'),
    body('password')
  .isLength({ min: 8 })
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/)
  .withMessage('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
],(req,res,next)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array() });
    }
    next();
},loginLimiter, authController.login);

router.put("/edit/:id",verifyToken,authController.editUserController);

router.delete("/delete/:id", verifyToken ,authController.deleteUserController);
router.get("/users", verifyToken,authController.allUsersController);
router.get("/logout", authController.logout);
router.post("/refresh", authController.refreshToken);

module.exports = router;


