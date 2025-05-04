const express = require('express');
const menuController = require('../controllers/menuController')
const router = express.Router();
const { body, validationResult } = require('express-validator');
const path = require('path');
const multer = require('multer');
const verifyToken = require('../middleware/verifyToken');

router.use(express.json());
router.use(express.urlencoded({ extended: true })); 

router.get("/menu", menuController.fetchMenu);
router.get('/menu/:id',menuController.fetchMenuById);
router.get('/menu/images/all',menuController.selectAllImageController);
router.get('/menu/images/:ids',menuController.selectImageController);

const storage = multer.diskStorage({
    destination:(req,res,cb)=>{
        cb(null,path.join(__dirname,"../public/assets/img") );
    },
    filename:(req,file,cb)=>{
        const menuName = req.body.name||`menu-${Date.now()}`;
        const extname = path.extname(file.originalname).toLowerCase();
        cb(null,menuName+extname);
    }
})

const upload = multer({
    storage:storage,
    limits :  { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if(extname&&mimetype){
            return cb(null,true);
        }else{
            cb(new Error('File type not allowed. Only jpeg, jpg, and png are allowed.'));
        }
    }
}).single("image");

router.post("/menu/add",verifyToken,upload,menuController.addMenuController);

router.put("/menu/edit/:id",verifyToken,upload,menuController.editMenuController);

router.delete("/menu/delete/:id",verifyToken,menuController.deleteMenuController);

module.exports = router;
