const db = require('../config/db');


const CreateUser = (username,hashedPassword,role)=>{
    return new Promise((resolve,reject)=>{
        db.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hashedPassword, role], (err) => {
            if(err) return reject(err);
            resolve();
        })
    })
}

const findUserByUsername = (username)=>{
    return new Promise((resolve,reject)=>{
        db.query('SELECT * FROM users WHERE username = ?', [username], (err, result) => {
            if(err) return reject(err);
            resolve(result);
        })
    })
}

const findUserById = (id)=>{
    return new Promise((resolve,reject)=>{
        db.query('SELECT * FROM users WHERE id = ?', [id], (err, result) => {
            if(err) return reject(err);
            resolve(result);
        })
    })
}

const editUserModel = (id,username,password,role)=>{
    return new Promise((resolve,reject)=>{
        db.query('UPDATE users SET username = ?, password = ?, role = ? WHERE id = ?', [username,password,role,id], (err) => {
            if(err) return reject(err);
            resolve();
        })
    })
}

const deleteUserModel = (id)=>{
    return new Promise((resolve,reject)=>{
        db.query('DELETE FROM users WHERE id = ?', [id], (err) => {
            if(err) return reject(err);
            resolve();
        })
    })
}


const allUsersModel = ()=>{
    return new Promise((resolve,reject)=>{
        db.query('SELECT * FROM users', (err, result) => {
            if(err) return reject(err);
            resolve(result);
        })
    })
}

module.exports={
    CreateUser,
    findUserByUsername,
    findUserById,
    editUserModel,
    deleteUserModel,
    allUsersModel,
}