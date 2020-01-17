var logger = require('../helpers/logger');
var coinMarketCapAPI = require('../helpers/coinMarketCapAPI');

var Coin = require('../models/Coin');
var Ohlcv = require('../models/Ohlcv');

module.exports = async () => {
    logger.info('loadOhlcv process start');
    try {
        var coins = await Coin.find({}).select({ cmc_id: 1 }).exec();
        var coinsIds = coins.map(v => v.cmc_id);
        const ohlcvLatest = await coinMarketCapAPI.ohlcvLatest(coinsIds.join(','));
        var ohlcvs = [];

        coins.forEach(coin => {
            const id = coin.cmc_id;
            if (ohlcvLatest[id]) {
                const _ohlcv = ohlcvLatest[id];
                
                if (_ohlcv.quote && _ohlcv.quote.USD) {
                    ohlcvs.push({
                        time_open: _ohlcv.time_open,
                        time_close: _ohlcv.time_close,
                        open: _ohlcv.quote.USD.open,
                        high: _ohlcv.quote.USD.high,
                        low: _ohlcv.quote.USD.low,
                        close: _ohlcv.quote.USD.close,
                        volume: _ohlcv.quote.USD.volume,
                        last_updated: _ohlcv.quote.USD.last_updated,
                        coin_id: coin._id
                    });
                }
            }
        });

        const insert = await Ohlcv.collection.insertMany(ohlcvs);
    } catch (err) {
        logger.error('Error while processing loadOhlcv');
    }
    logger.info('loadOhlcv process stop');
};