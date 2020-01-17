var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var quoteSchema = new Schema({
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
    price: { type: Number, required: true },
    volume_24h: { type: Number, required: true },
    percent_change_1h: { type: Number, required: true },
    percent_change_24h: { type: Number, required: true },
    percent_change_7d: { type: Number, required: true },
    market_cap: { type: Number, required: true },
    quote_last_updated: { type: Date, required: true, index: true },
    coin_id: { type: Schema.Types.ObjectId, required: true, index: true, ref: 'Coin' }
});

module.exports = mongoose.model('Quote', quoteSchema, 'quotes');
