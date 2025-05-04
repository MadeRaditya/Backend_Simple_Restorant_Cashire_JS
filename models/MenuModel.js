const db = require('../config/db');


const fetchMenu = (category) => {
    return new Promise((resolve, reject) => {
        let query = 'SELECT * FROM menu_items';
        let queryParams = [];

        if (category) {
            query += ' WHERE category = ?';
            queryParams.push(category);
        }

        db.query(query, queryParams, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};


const fetchMenuById = (id) => {
    return new Promise((resolve,reject)=>{
        db.query('SELECT * FROM menu_items WHERE id = ?', [id], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        })
    })
}

const addMenuModel = (name, category, price, description, image) => {
    console.log('Adding to DB with values:');
    console.log({ name, category, price, description, image });

    try {
        return new Promise((resolve, reject) => {
            const query = 'INSERT INTO menu_items (name, category, price, description, image, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())';
            db.query(query, [name, category, price, description, image], (err, result) => {
                if (err) {
                    console.error('Error inserting data into DB:', err);
                    return reject(err);
                }
                console.log('Successfully inserted menu item:', result);
                resolve(result);
            });
        });
    } catch (error) {
        console.error('Error in addMenuModel:', error);
        throw new Error(error.message);
    }
};



const editMenuModel = (id, name, category, price, description, image) => {
        try{
            return new Promise((resolve,reject)=>{
                const query = 'UPDATE menu_items SET name = ?, category = ?, price = ?, description = ?, image = ?, updated_at = NOW() WHERE id = ?';
                db.query(query, [name, category, price, description, image, id], (err, result) => {
                    if (err) {
                        console.error('Error editing data into DB:', err);
                        return reject(err);
                    }
                    resolve(result);
                    console.log('Successfully updated menu item:', result);
                });
            })
        }
        catch(error){
            console.error('Error in EditMenuModel:', error);
            throw new Error(error.message);
        }
}

const deleteMenuModel = (id) => {
    return new Promise((resolve, reject) => {
            const query = 'DELETE FROM menu_items WHERE id = ?';
            db.query(query, [id], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
    });
};

const selectAllImageModel = () => {
    return new Promise((resolve, reject) => {
        db.query('SELECT image FROM menu_items', (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};


const selectImageByIdModel = (idArray)=>{
    return new Promise((resolve, reject) => {
        const query = `
            SELECT image FROM menu_items 
            WHERE id IN (?)
        `;
        db.query(query, [idArray], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};


module.exports = {
    fetchMenu,
    fetchMenuById,
    addMenuModel,
    editMenuModel,
    deleteMenuModel,
    selectAllImageModel,
    selectImageByIdModel
};
