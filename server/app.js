const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();

// Route imports
const products = require('./routes/productRoute');
const user = require('./routes/userRoute');
const order = require('./routes/orderRoute');

// Middleware imports
const errorMiddleware = require('./middleware/error');

app.use(express.json());
app.use(cookieParser());
app.use(cors());

// Defining routes
app.use('/api/v1', products);
app.use('/api/v1', user);
app.use('/api/v1', order);

// Middleware for Errors
app.use(errorMiddleware);

module.exports = app;