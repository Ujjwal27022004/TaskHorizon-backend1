const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('./config/dotenv');
const db = require('./config/database');
const apiRoutes = require('./route/apiRoutes');
const todoRoutes = require('./route/todoRoutes');
const adminRoutes = require('./route/adminRoutes');


const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/api/admin', adminRoutes);// admin routes for notification and channel control

//Health check
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Server is running smoothly',
        timestamp: new Date().toISOString()
    });
});


// Inject database into requests
app.use((req, res, next) => {
    req.db = db;
    next();
});

// Unified API routes
app.use('/', apiRoutes);
app.use('/api/todos', todoRoutes);




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



















