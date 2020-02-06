var CronJob = require('cron').CronJob;

var logger = require('./helpers/logger');

var loadOhlcv = require('./processes/loadOhlcv');
var refreshTop500 = require('./processes/refreshTop500');
var loadQuotes = require('./processes/loadQuotes');
var loadOHLCVHourly = require('./processes/loadOHLCVHourly');

module.exports = () => {
    if (process.env.RUN_PROCESS == "TRUE") {
        // Every Minute
        new CronJob('*/5 * * * *', loadOhlcv, null, true);
        logger.info('loadOhlcv process initialized');

        // Once Every Sunday
        new CronJob('0 0 * * 0', refreshTop500, null, true);
        logger.info('refreshTop500 process initialized');

        // Once Every Sunday
        // new CronJob('*/5 * * * *', loadQuotes, null, true);
        // logger.info('loadQuotes process initialized');

        // Once Every Hour
        new CronJob('0 * * * *', loadOHLCVHourly, null, true);
        logger.info('loadOHLCVHourly process initialized');
    }
};