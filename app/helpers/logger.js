var winston = require('winston');
var moment = require('moment');

const { combine, timestamp, printf } = winston.format;

const myFormat = printf(({ level, message, timestamp }) => {
    return `[${timestamp}] ${level}: ${message}`;
});

var logger = winston.createLogger({
    format: combine(
        timestamp(),
        myFormat
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/' + moment().format('YYYY-MM-DD') + '.log' })
    ]
});

module.exports = {
    info: (text) => {
        logger.info(text);
    },
    error: (text) => {
        logger.error(text);
    }
};