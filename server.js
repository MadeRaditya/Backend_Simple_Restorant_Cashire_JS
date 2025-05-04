const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const mejaRoutes = require('./routes/mejaRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const transactionRoutes = require('./routes/transactionRoute');
const path = require('path');
const cookieParser = require('cookie-parser');

dotenv.config();
const app = express();
app.use(express.json());

const corsOptions = {
    origin : process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true, 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use('*', cors(corsOptions))
app.use((req, res, next) => {
    const referer = req.get('Referer');
    const origin = process.env.CORS_ORIGIN || 'http://localhost:3000';
    if (req.method !== 'OPTIONS' && (!referer || !referer.startsWith(origin))) {
        return res.status(403).json({ message: 'Access denied' });
    }
    next();
});

app.use(cookieParser());
app.use('/api/v1/public', express.static(path.join(__dirname, 'public')));
app.use('/api/v1/', authRoutes);
app.use('/api/v1/', menuRoutes);
app.use('/api/v1/', mejaRoutes);
app.use('/api/v1/', orderRoutes);
app.use('/api/v1/', transactionRoutes); 
app.use('/api/v1/', adminRoutes);

const Port = process.env.PORT || 5000;
app.listen(Port, () => {
    console.log(`Server started on port ${Port}`); 
});