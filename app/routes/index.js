var express = require('express');
// var mongoose = require('mongoose');
var moment = require('moment');
var router = express.Router();

var refreshTop500 = require('../processes/refreshTop500');
var loadOhlcvHistory = require('../processes/loadOhlcvHistory');
var loadOhlcvToday = require('../processes/loadOhlcvToday');
var loadOHLCVHourly = require('../processes/loadOHLCVHourly');
// var loadQuotesHistory = require('../processes/loadQuotesHistory');
var loadHourlyDataDateRange = require('../processes/loadHourlyDataDateRange');

var Coin = require('../models/Coin');
var Ohlcv = require('../models/Ohlcv');
var OhlcvHourly = require('../models/OhlcvHourly');

// var coinMarketCapAPI = require('../helpers/coinMarketCapAPI');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.send('API is Online');
});

router.get('/coins', async function (req, res, next) {
    res.send(await Coin.aggregate([{
        $match: { active: true }
    }, {
        $group: { _id: '$cmc_id', count: { $sum: 1 } }
    }, {
        $sort: { coint: -1 }
    }]).exec());
});

router.post('/refresh-top-500', function (req, res, next) {
    refreshTop500();
    res.send('refresh-top-500');
});

router.post('/load-coins-history', function (req, res, next) {
    loadOhlcvHistory();
    res.send('load-coins-history');
});

router.post('/load-coins-today', function (req, res, next) {
    loadOhlcvToday();
    res.send('load-coins-today');
});

router.post('/load-hourly-24h', function (req, res, next) {
    loadOHLCVHourly();
    res.send('load-hourly-24h');
});

// router.post('/load-quotes-history', function (req, res, next) {
//     loadQuotesHistory();
//     res.send('load-quotes');
// });

router.post('/load-hourly-data-date-range', function (req, res, next) {
    const from = req.body.from || false;
    const to = req.body.to || false;
    if (from && to && from < to) {
        // var time_start = moment(from, 'YYYY-MM-DD').format('YYYY-MM-DD');
        // var time_end = moment(time_start, 'YYYY-MM-DD').add(1, 'day').format('YYYY-MM-DD');
        loadHourlyDataDateRange(from, to);
        res.send('load-hourly-data-date-range');
        // res.send({ time_start, time_end });
    } else {
        res.send('from and to required');
    }
});

router.post('/delete-ohlcv', async function (req, res, next) {
    await Ohlcv.deleteMany({});
    res.send('delete-ohlcv');
});

router.post('/list-coins', async function (req, res, next) {
    const coins = await Coin.find({ active: true }).exec();
    res.json(coins);
});

router.post('/list-ohlcv', async function (req, res, next) {
    const symbol = req.body.symbol || false;
    if (symbol === false) {
        res.status(400).json('Symbol is required');
        return;
    }

    const coin = await Coin.findOne({ symbol: symbol }).exec();

    if (!coin) {
        res.status(404).json('Symbol not found');
        return;
    }

    const skip = req.body.skip || 0;
    const limit = 500;
    const ohlcvs = await Ohlcv.aggregate([{
        $match: { coin_id: coin._id }
    }, {
        $sort: { _id: -1 }
    }, {
        $skip: skip
    }, {
        $limit: limit
    }]).exec();

    res.json(ohlcvs);
});

router.post('/list-ohlcv-history', async function (req, res, next) {
    const symbol = req.body.symbol || false;
    if (symbol === false) {
        res.status(400).json('Symbol is required');
        return;
    }

    const coin = await Coin.findOne({ symbol: symbol }).exec();

    if (!coin) {
        res.status(404).json('Symbol not found');
        return;
    }

    const ohlcvs = await Ohlcv.aggregate([{
        $match: {
            coin_id: coin._id,
            last_updated: { $gte: '2020-01-14T00:00:00.000Z' },
            last_updated: { $lte: '2020-01-14T59:59:59.999Z' }
        }
    }, {
        $sort: { _id: -1 }
    }]).exec();

    res.json(ohlcvs);
});

// router.get('/chart/:symbol', async function (req, res, next) {
//     const symbol = req.params.symbol;
//     const coin = await Coin.findOne({ symbol: symbol }).exec();

//     if (!coin) {
//         res.status(404).json('Symbol not found');
//         return;
//     }

//     const limit = 25920;
//     const ohlcvs = await Ohlcv.aggregate([{
//         $match: { coin_id: coin._id }
//     }, {
//         $sort: { _id: -1 }
//     }, {
//         $limit: limit
//     }, {
//         $addFields: {
//             "entry_datetime": {
//                 $dateFromParts: {
//                     "year": { $year: "$_id" },
//                     "month": { $month: "$_id" },
//                     "day": { $dayOfMonth: "$_id" },
//                     "hour": { $hour: "$_id" },
//                     "minute": { $minute: "$_id" },
//                     "second": { $second: "$_id" },
//                     "millisecond": { $millisecond: "$_id" }
//                 }
//             }
//         }
//     }]).exec();

//     res.json(ohlcvs);
// });

router.get('/chart/:symbol', async function (req, res, next) {
    const symbol = req.params.symbol;
    const coin = await Coin.findOne({ symbol: symbol }).exec();

    if (!coin) {
        res.status(404).json('Symbol not found');
        return;
    }

    const ohlcvs = await OhlcvHourly.aggregate([{
        $match: {
            coin_id: coin._id,
            last_updated: { $gte: moment().subtract(90, 'days').millisecond(0).second(0).minute(0).hour(0).utc().toISOString() }
        }
    }, {
        $sort: { _id: 1 }
    }]).exec();

    res.json(ohlcvs);
});


// router.post('/coin-id-correction/:fromdate/:todate', async function (req, res, next) {
//     const fromdate = req.params.fromdate;
//     const todate = req.params.todate;
//     const symbols = req.body.symbols ? { symbol: { $in: req.body.symbols } } : {};
//     const coins = await Coin.find(symbols).exec()
//     const coinsIds = coins.map(x => x.cmc_id);
//     const ids = coins.map(x => mongoose.Types.ObjectId(x._id));
//     const coinsIdList = [
//         coinsIds.splice(0, 250),
//         coinsIds
//     ];
//     let corrected = [];

//     console.log('BEFORE PROCESS UNKNOWN COIN_ID > ', (await Ohlcv.countDocuments({ coin_id: { $nin: ids } })));

//     for (let index = 0; index < coinsIdList.length; index++) {
//         const cmc_ids = coinsIdList[index];
//         const ohlcvHistorical = await coinMarketCapAPI.ohlcvHistorical(cmc_ids.join(','), fromdate, todate);

//         for (let i = 0; i < coins.length; i++) {
//             const cn = coins[i];
//             if (ohlcvHistorical[cn.cmc_id] && ohlcvHistorical[cn.cmc_id].quotes) {
//                 for (let j = 0; j < ohlcvHistorical[cn.cmc_id].quotes.length; j++) {
//                     const _ohlcv = ohlcvHistorical[cn.cmc_id].quotes[j];
//                     if (_ohlcv.quote && _ohlcv.quote.USD) {
//                         const matchOhlcv = await Ohlcv.find({
//                             open: _ohlcv.quote.USD.open,
//                             high: _ohlcv.quote.USD.high,
//                             low: _ohlcv.quote.USD.low,
//                             close: _ohlcv.quote.USD.close,
//                             coin_id: { $nin: ids }
//                         }).exec();
//                         if (matchOhlcv.length === 1) {
//                             try {
//                                 await Ohlcv.updateMany({ coin_id: mongoose.Types.ObjectId(matchOhlcv[0].coin_id) }, { $set: { coin_id: cn._id } }).exec();
//                                 corrected.push({ symbol: cn.symbol, coin_id: matchOhlcv[0].coin_idm, j: j });
//                             } catch (error) {
//                                 console.error(error);
//                             }
//                             break;
//                         }
//                     }
//                 }
//             }
//         }
//     }

//     console.log('AFTER PROCESS UNKNOWN COIN_ID > ', (await Ohlcv.countDocuments({ coin_id: { $nin: ids } })));

//     res.json({ total: corrected.length, corrected: corrected });
// });

module.exports = router;
