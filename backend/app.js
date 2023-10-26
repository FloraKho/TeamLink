const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose'); // Import Mongoose for MongoDB

const routes = require('./routes');

const app = express();
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const { environment } = require('./config');
const isProduction = environment === 'production';

if (!isProduction) {
    app.use(cors());
}

app.use(
    helmet({
        contentSecurityPolicy: false, // Disable content security policy for now
    })
);

// Connect to your MongoDB instance
mongoose.connect('mongodb://localhost/your_database_name', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true, // Add this if needed
    useFindAndModify: false, // Add this if needed
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

app.use(routes);

app.use((_req, _res, next) => {
    const err = new Error("The requested resource couldn't be found.");
    err.title = "Resource Not Found";
    err.errors = ["The requested resource couldn't be found."];
    err.status = 404;
    next(err);
});

app.use((err, _req, _res, next) => {
    if (err instanceof mongoose.Error.ValidationError) { // Adjust the error type for Mongoose
        err.errors = Object.values(err.errors).map((e) => e.message);
        err.title = 'Validation error';
    }
    next(err);
});

app.use((err, _req, res, _next) => {
    res.status(err.status || 500);
    console.error(err);
    res.json({
        title: err.title || 'Server Error',
        message: err.message,
        errors: err.errors,
        stack: isProduction ? null : err.stack,
    });
});

module.exports = app;
