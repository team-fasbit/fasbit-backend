var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ohlcvHoutlySchema = new Schema({
    time_open: { type: Date },
    time_close: { type: Date },
    open: { type: Number, required: true },
    high: { type: Number, required: true },
    low: { type: Number, required: true },
    close: { type: Number, required: true },
    volume: { type: Number, required: true },
    market_cap: { type: Number, required: true },
    last_updated: { type: Date, required: true, index: true },
    coin_id: { type: Schema.Types.ObjectId, required: true, index: true, ref: 'Coin' }
});

module.exports = mongoose.model('OhlcvHourly', ohlcvHoutlySchema, 'ohlcv_hourly');
