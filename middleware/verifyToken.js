const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const verifyToken = async (req, res, next) => { 
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Access denied. Token not found' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch(err) {
        if(err.name === 'TokenExpiredError') {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                return res.status(401).json({ message: 'Refresh token not found' });
            }
            try {
                const decodedRefreshToken = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
                const user = await userModel.findUserById(decodedRefreshToken.user_id);
                if (!user) {
                    return res.status(401).json({ message: 'User not found, please login again' });
                }

                const newAccessToken = jwt.sign(
                    { user_id: user.id, role: user.role }, 
                    process.env.JWT_SECRET, 
                    { expiresIn: '1h' }
                );

                const newRefreshToken = jwt.sign({
                    user_id: user.id,
                    role: user.role
                }, process.env.JWT_REFRESH_SECRET, { expiresIn: '3d' });
                
                res.setHeader('Authorization', `Bearer ${newAccessToken}`);
                res.cookie('refreshToken', newRefreshToken, { httpOnly: true,
                    secure: true,
                    maxAge: 3 * 24 * 60 * 60 * 1000 });

                req.user = user;
                next();
            } catch(err) {
                return res.status(401).json({ message: 'Refresh token is invalid or has expired, please login again' });
            }
        } else {
            return res.status(401).json({ message: 'Invalid token' });
        }
    }
}    

module.exports = verifyToken;