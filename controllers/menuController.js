const menuModel = require('../models/MenuModel');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
dotenv.config();

const fetchMenu = async (req, res) => {
    const { category } = req.query;  

    try {
        const menu = await menuModel.fetchMenu(category);  
        res.status(200).json(menu);
    } catch (err) {
        res.status(500).json({ message: 'Error while fetching menu', error: err.message });
    }
};


const fetchMenuById = async (req, res) => {
    try {
        const menudetail = await menuModel.fetchMenuById(req.params.id)
        res.status(200).json(menudetail);
    } catch (err) {
        res.status(500).json({ message: 'Error while fetching menu', error: err.message });
    }
};

const addMenuController = async (req, res) => {
    const { name, category, price, description } = req.body;
    const image = req.file ? req.file.filename : null;

    if (!name || !category || !price || !description || !image) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const priceValue = parseFloat(price);
    if (isNaN(priceValue)) {
        return res.status(400).json({ message: 'Price must be a valid number' });
    }

    if (!req.user || !req.user.role) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Access denied. Only admin can create menu items' });
    }

    try {
        await menuModel.addMenuModel(name, category, priceValue, description, image);
        res.status(201).json({
            message: 'Menu item added successfully',
            data: { name, category, price: priceValue, description, image }
        });
    } catch (error) {
        console.error('Error in addMenuController:', error);
        res.status(500).json({ message: 'Error while adding menu item', error: error.message });
    }
};


const editMenuController = async (req, res) => {
    const { id } = req.params;
    if (!id) {    
        return res.status(400).json({ message: 'Menu id is required' });
    }

    const { name, category, price, description } = req.body;
    let image = req.file ? req.file.filename : null; 

    const priceValue = parseFloat(price);
    if (isNaN(priceValue)) {
        return res.status(400).json({ message: 'Price must be a valid number' });
    }

    if (!req.user || !req.user.role) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role !== 'admin' ) {
        return res.status(401).json({ message: 'Access denied. Only admin  can edit menu items' });
    }

    try {
        const oldMenu = await menuModel.fetchMenuById(id);
        const oldImage = oldMenu[0]?.image;

        if(image){
            if(oldImage){
                const oldImagePath = path.join(__dirname, '../public/assets/img', oldImage);
                fs.unlink(oldImagePath, (err) => {
                    if (err) console.log("Failed to delete old image : ", err);
                    else console.log("old Image deleted successfully");
                });
            }
        }else{
            image = oldImage;
        }

        await menuModel.editMenuModel(id, name, category, priceValue, description, image);

        res.status(200).json({
            message: 'Menu item updated successfully',
            data: { name, category, price: priceValue, description, image }
        });
    } catch (err) {
        console.error('Error in editMenuController:', err);
        res.status(500).json({ message: 'Error while updating menu item', error: err.message });
    }
};


const deleteMenuController = async (req, res) => {
    const {id} = req.params;
    if(!id){    
        return res.status(400).json({ message: 'Menu id is required' });
    }

    if (!req.user || !req.user.role) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Access denied. Only admin can delete menu items' });
    }

    try{
        const oldMenu = await menuModel.fetchMenuById(id);
        const oldImage = oldMenu[0]?.image;

        if(oldImage){
            const oldImagePath = path.join(__dirname, '../public/assets/img', oldImage);
            fs.unlink(oldImagePath, (err) => {
                if (err) console.log("Failed to delete old image : ", err);
                else console.log("old Image deleted successfully");
            });
        }

        await menuModel.deleteMenuModel(id).then((result)=>{
            res.status(200).json({message : 'Menu item deleted successfully'});
        })
    }
    catch(err){
        res.status(500).json({ message: 'Error while deleting menu item', error: err.message });
    }
}

const selectAllImageController = async (req, res) => {
    try {
        const menu = await menuModel.selectAllImageModel();
        const images = menu.map(item => item.image);
        if (images.length === 0) {
            console.log('No images found'); 
            return res.status(404).json({ message: 'No images found' });
        }
        res.status(200).json(images);
        console.log('Images fetched:', images); 
    } catch (err) {
        console.error('Error in selectAllImageController:', err); 
        res.status(500).json({ message: 'Error while fetching images', error: err.message });
    }
};

const selectImageController = async (req, res) => {
    try {
        const { ids } = req.params;
        const idArray = ids.split(',').map(id => parseInt(id.trim()));

        if (idArray.some(isNaN)) {
            return res.status(400).json({ message: 'Invalid ID format' });
        }

        const images = await menuModel.selectImageByIdModel(idArray);
        res.status(200).json(images);
    } catch (err) {
        res.status(500).json({ message: 'Error while fetching images', error: err.message });
    }
};

module.exports = {
    fetchMenu,
    fetchMenuById,
    addMenuController,
    editMenuController,
    deleteMenuController,
    selectAllImageController,
    selectImageController
};
