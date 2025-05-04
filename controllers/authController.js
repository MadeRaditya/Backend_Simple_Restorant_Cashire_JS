const bcrypt  = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/UserModel');
const dotenv = require('dotenv');
dotenv.config();

const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    return regex.test(password);
}

const register = async (req, res) => {
    const { username, password, role } = req.body;
    console.log('Received password:', password); 
    if (!username || !password || !role) {
        return res.status(400).json({ message: 'Username, password, and role are required' });
    }

    if (!validatePassword(password)) {
        console.log('Password validation failed'); 
        return res.status(400).json({ message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const existingUser = await userModel.findUserByUsername(username);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'Username already taken' });
        }
        await userModel.CreateUser(username, hashedPassword, role);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error while registering user', error: err.message });
    }
}

const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        const result = await userModel.findUserByUsername(username);
        if (result.length === 0) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        const user = result[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        const token = jwt.sign({ user_id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ user_id: user.id, role: user.role }, process.env.JWT_REFRESH_SECRET, { expiresIn: '3d' });

        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, maxAge: 3 * 24 * 60 * 60 * 1000 });
        return res.status(200).json({ token });
    } catch (err) {
        return res.status(500).json({ message: 'Error while logging in user', error: err.message });
    }
};


const editUserController = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: 'User id is required' });
    }

    try {
        const result = await userModel.findUserById(id);
        if (result.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { username, password: newPassword, role } = req.body;
        if (!username || !role) {
            return res.status(400).json({ message: 'Username and role are required' });
        }

        let finalPassword = newPassword;
        if (!finalPassword) {
            finalPassword = result[0].password; 
        } else {
            if (!validatePassword(finalPassword)) {
                return res.status(400).json({
                    message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
                });
            }
            finalPassword = await bcrypt.hash(finalPassword, 10);
        }

        await userModel.editUserModel(id, username, finalPassword, role);
        res.status(200).json({ message: 'User updated successfully' });

    } catch (err) {
        res.status(500).json({ message: 'Error while updating user', error: err.message });
    }
};


const deleteUserController = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: 'User id is required' });
    }

    try {
        if (!req.user || !req.user.role) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role !== 'admin' ) {
        return res.status(401).json({ message: 'Access denied. Only admin  can delete user' });
    }
        const result = await userModel.findUserById(id);
        if (result.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const user = result[0];
        if (user) {
            await userModel.deleteUserModel(id);
            res.status(200).json({ message: 'User deleted successfully' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Error while deleting user', error: err.message });
    }
}


const allUsersController = async (req, res) => {
    try {
        if (!req.user || !req.user.role) {
            return res.status(401).json({ message: 'Authentication required' });
        }
    
        if (req.user.role !== 'admin' ) {
            return res.status(401).json({ message: 'Access denied. Only admin  can read data of users' });
        }
        const result = await userModel.allUsersModel();
        res.status(200).json({ users: result });
    } catch (err) {
        res.status(500).json({ message: 'Error while fetching users', error: err.message });
    }
}

const logout = async (req, res) => {
    res.clearCookie('token');
    res.clearCookie('refreshToken');
    res.status(200).json({ message: 'Logout successfully' });
}

const refreshToken = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token not found' });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        
        const newAccessToken = jwt.sign(
            { user_id: decoded.user_id, role: decoded.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );
        
        const newRefreshToken = jwt.sign(
            { user_id: decoded.user_id, role: decoded.role }, 
            process.env.JWT_REFRESH_SECRET, 
            { expiresIn: '3d' }
        );
        
        res.cookie('refreshToken', newRefreshToken, { 
            httpOnly: true, 
            secure: true, 
            maxAge: 3 * 24 * 60 * 60 * 1000 
        });
        
        res.setHeader('Authorization', `Bearer ${newAccessToken}`);
        return res.status(200).json({ 
            token : newAccessToken,
            refreshToken : newRefreshToken
         });
        
    } catch (err) {
        console.error("Refresh token error:", err);
        return res.status(401).json({ message: 'Invalid refresh token' });
    }
}

module.exports = {
    register,
    login,
    editUserController,
    deleteUserController,
    allUsersController,
    logout,
    refreshToken
}
