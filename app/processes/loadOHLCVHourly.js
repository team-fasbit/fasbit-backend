var moment = require('moment');

var logger = require('../helpers/logger');
var coinMarketCapAPI = require('../helpers/coinMarketCapAPI');

var Coin = require('../models/Coin');
var OhlcvHourly = require('../models/OhlcvHourly');

module.exports = async () => {
    logger.info('loadOHLCVHourly process start');

    try {
        var coins = await Coin.find({ active: true }).select({ cmc_id: 1 }).exec();
        const coinsList = [
            coins.splice(0, 250),
            coins
        ];
        const time_end = moment().add(1, 'day').utc().format('YYYY-MM-DD');
        logger.info(`fetching Last OHLCV data for date ${time_end}`);
        for (let i = 0; i < coinsList.length; i++) {
            var coinsIds = coinsList[i].map(v => v.cmc_id);
            const ohlcvHistorical = await coinMarketCapAPI.ohlcvLastHistorical(coinsIds.join(','), time_end);
            var ohlcvs = [];

            coinsList[i].forEach(coin => {
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
                                market_cap: _ohlcv.quote.USD.market_cap,
                                last_updated: _ohlcv.quote.USD.timestamp,
                                coin_id: coin._id
                            });
                        }
                    });
                }
            });

            const insert = await OhlcvHourly.collection.insertMany(ohlcvs);
        }

    } catch (err) {
        console.log(err);
        logger.error('Error while processing loadOHLCVHourly');
    }

    logger.info('loadOHLCVHourly process stop');
};