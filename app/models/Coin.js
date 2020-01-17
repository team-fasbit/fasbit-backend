var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var coinSchema = new Schema({
    cmc_id: { type: Number, required: true },
    name: { type: String, required: true },
    symbol: { type: String, required: true, index: true },
    slug: { type: String, required: true },
    cmc_rank: { type: Number, required: true },
    num_market_pairs: { type: Number, required: true },
    circulating_supply: { type: Number, required: true },
    total_supply: { type: Number, required: true },
    max_supply: { type: Number, required: true },
    last_updated: { type: Date, required: true },
    date_added: { type: Date, required: true },
    tags: { type: [String], required: true },
    price: { type: Number },
    volume_24h: { type: Number },
    percent_change_1h: { type: Number },
    percent_change_24h: { type: Number },
    percent_change_7d: { type: Number },
    market_cap: { type: Number },
    quote_last_updated: { type: Date }
});

module.exports = mongoose.model('Coin', coinSchema, 'coins');
