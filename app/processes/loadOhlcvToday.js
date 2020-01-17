var moment = require('moment');

var logger = require('../helpers/logger');
var coinMarketCapAPI = require('../helpers/coinMarketCapAPI');

var Coin = require('../models/Coin');
var Ohlcv = require('../models/Ohlcv');

module.exports = async () => {
    logger.info('loadOhlcvToday process start');
    try {
        var coins = await Coin.find({}).select({ cmc_id: 1 }).exec();
        var coinsIds = coins.map(v => v.cmc_id);
        const coinsIdList = [
            coinsIds.splice(0, 250),
            coinsIds
        ];

        const time_start = moment().utc().format('YYYY-MM-DD');
        logger.info(`fetching OHLCV data for date ${time_start}`);
        for (let i = 0; i < coinsIdList.length; i++) {
            coinsIds = coinsIdList[i];
            const ohlcvHistorical = await coinMarketCapAPI.ohlcvHistorical(coinsIds.join(','), time_start);
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
        }
    } catch (err) {
        logger.error('Error while processing loadOhlcvToday');
    }
    logger.info('loadOhlcvToday process stop');
};