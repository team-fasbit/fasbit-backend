var moment = require('moment');
var sleep = require('sleep');

var logger = require('../helpers/logger');
var coinMarketCapAPI = require('../helpers/coinMarketCapAPI');

var Coin = require('../models/Coin');
var Ohlcv = require('../models/Ohlcv');

module.exports = async () => {
    logger.info('loadOhlcvHistory process start');
    try {
        var coins = await Coin.find({ active: true }).select({ cmc_id: 1 }).exec();
        var coinsIds = coins.map(v => v.cmc_id);
        const coinsIdList = [
            coinsIds.splice(0, 250),
            coinsIds
        ];

        for (let days = 1; days < 30; days++) {
            const time_start = moment().subtract((days + 1), 'days').utc().format('YYYY-MM-DD');
            const time_end = moment().subtract(days, 'days').utc().format('YYYY-MM-DD');
            logger.info(`fetching OHLCV data for dates between ${time_start} and ${time_end}`);
            for (let i = 0; i < coinsIdList.length; i++) {
                coinsIds = coinsIdList[i];
                const ohlcvHistorical = await coinMarketCapAPI.ohlcvHistorical(coinsIds.join(','), time_start, time_end);
                var ohlcvs = [];

                coins.forEach(coin => {
                    const id = coin.cmc_id;
                    if (ohlcvHistorical[id] && ohlcvHistorical[id].quotes) {
                        ohlcvHistorical[id].quotes.forEach(_ohlcv => {

                            if (_ohlcv.quote && _ohlcv.quote.USD) {
                                ohlcvs.push({
                                    time_open: _ohlcv.time_open,
                                    time_close: _ohlcv.time_close,
                                    open: _ohlcv.quote.USD.open,
                                    high: _ohlcv.quote.USD.high,
                                    low: _ohlcv.quote.USD.low,
                                    close: _ohlcv.quote.USD.close,
                                    volume: _ohlcv.quote.USD.volume,
                                    last_updated: _ohlcv.quote.USD.timestamp,
                                    coin_id: coin._id
                                });
                            }
                        });
                    }
                });

                const insert = await Ohlcv.collection.insertMany(ohlcvs);
                sleep.msleep(250);
            }
        }
    } catch (err) {
        logger.error('Error while processing loadOhlcvHistory');
    }
    logger.info('loadOhlcvHistory process stop');
};