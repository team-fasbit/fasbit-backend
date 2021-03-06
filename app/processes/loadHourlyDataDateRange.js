var moment = require('moment');

var logger = require('../helpers/logger');
var coinMarketCapAPI = require('../helpers/coinMarketCapAPI');

var Coin = require('../models/Coin');
var OhlcvHourly = require('../models/OhlcvHourly');

module.exports = async (from, to) => {
    logger.info('loadHourlyDataDateRange process start');

    try {
        var coins = await Coin.find({ active: true }).select({ cmc_id: 1 }).exec();
        const coinsList = [
            coins.splice(0, 250),
            coins
        ];
        var time_start = moment(from, 'YYYY-MM-DD').format('YYYY-MM-DD');
        var time_end = moment(time_start, 'YYYY-MM-DD').add(1, 'day').format('YYYY-MM-DD');
        while (time_start < to) {
            logger.info(`fetching OHLCV data for dates between ${time_start} and ${time_end}`);
            for (let i = 0; i < coinsList.length; i++) {
                var coinsIds = coinsList[i].map(v => v.cmc_id);
                const ohlcvHistorical = await coinMarketCapAPI.ohlcvHistorical(coinsIds.join(','), time_start, time_end);
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

                await OhlcvHourly.deleteMany({
                    last_updated: {
                        $gt: time_start + 'T01:00:00.000Z',
                        $lt: time_end + 'T01:00:00.000Z'
                    }
                }).exec();
                const insert = await OhlcvHourly.collection.insertMany(ohlcvs);
            }
            time_start = time_end;
            time_end = moment(time_start, 'YYYY-MM-DD').add(1, 'day').format('YYYY-MM-DD');
        }

    } catch (err) {
        console.log(err);
        logger.error('Error while processing loadHourlyDataDateRange');
    }

    logger.info('loadHourlyDataDateRange process stop');
};