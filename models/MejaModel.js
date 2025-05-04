const db = require('../config/db');

const fetchAllMeja = () =>{
    return new Promise((resolve,reject)=>{
        db.query('SELECT * FROM tables', (err,result)=>{
            if(err) return reject(err);
            resolve(result);
        })
    })
}

const fetchAvailableMeja = () =>{
    return new Promise((resolve,reject)=>{
        db.query('SELECT * FROM tables where status = "available"', (err,result)=>{
            if(err) return reject(err);
            resolve(result);
        })
    })
}



const fetchMejaById =(id)=>{
    return new Promise((resolve,reject)=>{
        db.query('SELECT * FROM tables WHERE id = ?',[id], (err,result)=>{
            if(err) return reject(err);
            resolve(result);
        })
    })
}

const addMejaModel = (table_number,capacity,status)=>{
    return new Promise((resolve,reject)=>{
        const query = 'INSERT INTO tables (table_number,capacity,status,created_at,updated_at) VALUES (?,?,?,NOW(),NOW())';
        db.query(query,[table_number,capacity,status],(err,result)=>{
            if(err) return reject(err);
            resolve(result);
        })
    })
} 

const editMejaModel = (id,table_number,capacity,status)=>{
    return new Promise((resolve,reject)=>{
        const query = 'UPDATE tables SET table_number = ?, capacity = ?, status = ?, updated_at = NOW() WHERE id = ?';
        db.query(query,[table_number,capacity,status,id],(err,result)=>{
            if(err) return reject(err);
            resolve(result);
        })
    })
}

const deleteMejaModel = (id)=>{
    return new Promise((resolve,reject)=>{
        db.query('DELETE FROM tables WHERE id = ?',[id],(err,result)=>{
            if(err) return reject(err);
            resolve(result);
        })
    })
}

module.exports = {
    fetchAllMeja,
    fetchMejaById,
    addMejaModel,
    editMejaModel,
    deleteMejaModel,
    fetchAvailableMeja
}