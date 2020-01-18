var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');

// Dotenv Configuration
require('dotenv').config();

(async () => {
    console.log(`connecting to mongodb://${process.env.DB_HOST}/${process.env.DB_NAME}`);
    try {
        await mongoose.connect(`mongodb://${process.env.DB_HOST}/${process.env.DB_NAME}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        });
    } catch (err) {
        console.error(err);
    }
})();

var indexRouter = require('./app/routes/index');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// Cron Job Processes
require('./app/process')();

module.exports = app;
