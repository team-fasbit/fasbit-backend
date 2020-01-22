var express = require('express');
var router = express.Router();

var refreshTop500 = require('../processes/refreshTop500');
var loadOhlcvHistory = require('../processes/loadOhlcvHistory');
var loadOhlcvToday = require('../processes/loadOhlcvToday');
// var loadQuotesHistory = require('../processes/loadQuotesHistory');

var Coin = require('../models/Coin');
var Ohlcv = require('../models/Ohlcv');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.send('API is Online');
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

// router.post('/load-quotes-history', function (req, res, next) {
//     loadQuotesHistory();
//     res.send('load-quotes');
// });

router.post('/delete-ohlcv', async function (req, res, next) {
    await Ohlcv.deleteMany({});
    res.send('delete-ohlcv');
});

router.post('/list-coins', async function (req, res, next) {
    const coins = await Coin.find().exec();
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
    // }, {
    //     $lookup: {
    //         from: 'coins',
    //         localField: 'coin_id',
    //         foreignField: '_id',
    //         as: 'coin'
    //     }
    // }, {
    //     $project: {
    //         "time_open": 1,
    //         "time_close": 1,
    //         "open": 1,
    //         "high": 1,
    //         "low": 1,
    //         "close": 1,
    //         "volume": 1,
    //         "last_updated": 1,
    //         "coin": { $arrayElemAt: ["$coin", 0] }
    //     }
    }]).exec();

    res.json(ohlcvs);
});

module.exports = router;
