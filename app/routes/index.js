var express = require('express');
var router = express.Router();

var refreshTop500 = require('../processes/refreshTop500');
var loadOhlcvHistory = require('../processes/loadOhlcvHistory');
var loadOhlcvToday = require('../processes/loadOhlcvToday');
// var loadQuotesHistory = require('../processes/loadQuotesHistory');

var Ohlcv = require('../models/Ohlcv');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.send('API');
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

router.post('/list-ohlcv', async function (req, res, next) {
    const ohlcvs = await Ohlcv.find().sort({ _id: -1 }).limit(10000).exec();
    res.send(ohlcvs);
});

module.exports = router;
