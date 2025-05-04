const MejaModel = require ('../models/MejaModel');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const fetchAllMeja = async (req, res) => {
    try{
        const meja = await MejaModel.fetchAllMeja();
        res.status(200).json(meja);
    }catch(err){
        res.status(500).json({message:'Error while fetching meja',error:err.message});
    }
}
const fetchAvailableMeja = async (req, res) => {
    try{
        const meja = await MejaModel.fetchAvailableMeja();
        res.status(200).json(meja);
    }catch(err){
        res.status(500).json({message:'Error while fetching meja',error:err.message});
    }
}

const fetchMejaById = async (req,res)=>{
    const {id} =req.params;

    if(!id) return res.status(400).json({message:'ID is required'});

    try{
        const meja = await MejaModel.fetchMejaById(id);
        res.status(200).json(meja);
    }catch(err){
        res.status(500).json({message:'Error while fetching meja',error:err.message});
    }
}

const AddMejaController = async (req,res)=>{
    const {table_number,capacity,status} = req.body;

    if(!table_number || !capacity || !status) return res.status(400).json({message:'All fields are required'});

    const capacityValue = parseInt(capacity);
    if(isNaN(capacityValue)) return res.status(400).json({message:'Capacity must be a valid number'});

    if (!req.user || !req.user.role) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role !== 'admin' ) {
        return res.status(401).json({ message: 'Access denied. Only admin  can add table' });
    }

    try{
        await MejaModel.addMejaModel(table_number,capacityValue,status);
        res.status(201).json({message:'Meja item added successfully',data:{table_number,capacity,status}});
    }catch(err){
        console.error('Error in addMejaController:',err);
        res.status(500).json({message:'Error while adding meja item',error:err.message});
    }
}

const editMejaController = async (req,res)=>{
    const {id} = req.params;
    if(!id) return res.status(400).json({message:'ID is required'});

    const {table_number,capacity,status} = req.body;
    if(!table_number || !capacity || !status) return res.status(400).json({message:'All fields are required'});

    if (!req.user || !req.user.role) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role !== 'admin' ) {
        return res.status(401).json({ message: 'Access denied. Only admin  can edit table' });
    }

    try{
        await MejaModel.editMejaModel(id,table_number,capacity,status);
        res.status(200).json({message:'Meja item updated successfully',data:{table_number,capacity,status}});
    }catch(err){
        console.error('Error in editMejaController:',err);
        res.status(500).json({message:'Error while updating meja item',error:err.message});
    }
}

const deleteMejaController = async (req,res)=>{
    const {id} = req.params;
    if(!id) return res.status(400).json({message:'ID is required'});
    if (!req.user || !req.user.role) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role !== 'admin' ) {
        return res.status(401).json({ message: 'Access denied. Only admin  can delete table' });
    }

    try{
        await MejaModel.deleteMejaModel(id);
        res.status(200).json({message:'Meja item deleted successfully'});
    }catch(err){
        console.error('Error in deleteMejaController:',err);
        res.status(500).json({message:'Error while deleting meja item',error:err.message});
    }
}

module.exports ={
    fetchAllMeja,
    fetchAvailableMeja,
    fetchMejaById,
    AddMejaController,
    editMejaController,
    deleteMejaController,
}