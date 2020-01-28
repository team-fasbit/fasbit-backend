var logger = require('../helpers/logger');
var coinMarketCapAPI = require('../helpers/coinMarketCapAPI');

var Coin = require('../models/Coin');
var Quote = require('../models/Quote');

module.exports = async () => {
    logger.info('loadQuotes process start');

    try {
        var coins = await Coin.find({ active: true }).select({ cmc_id: 1 }).exec();
        var coinsIds = coins.map(v => v.cmc_id);
        const quotesLatest = await coinMarketCapAPI.quotesLatest(coinsIds.join(','));
        var quotes = [];

        coins.forEach(coin => {
            const id = coin.cmc_id;
            if (quotesLatest[id]) {
                var coinQuote = quotesLatest[id];
                if (coinQuote.quote && coinQuote.quote.USD) {
                    var insertQuote = {
                        cmc_id: coinQuote.id,
                        name: coinQuote.name,
                        symbol: coinQuote.symbol,
                        slug: coinQuote.slug,
                        cmc_rank: coinQuote.cmc_rank,
                        num_market_pairs: coinQuote.num_market_pairs,
                        circulating_supply: coinQuote.circulating_supply,
                        total_supply: coinQuote.total_supply,
                        max_supply: coinQuote.max_supply,
                        last_updated: coinQuote.last_updated,
                        date_added: coinQuote.date_added,
                        tags: coinQuote.tags,
                        price: coinQuote.quote.USD.price,
                        volume_24h: coinQuote.quote.USD.volume_24h,
                        percent_change_1h: coinQuote.quote.USD.percent_change_1h,
                        percent_change_24h: coinQuote.quote.USD.percent_change_24h,
                        percent_change_7d: coinQuote.quote.USD.percent_change_7d,
                        market_cap: coinQuote.quote.USD.market_cap,
                        quote_last_updated: coinQuote.quote.USD.last_updated,
                        coin_id: coin._id
                    };
                    quotes.push(insertQuote);
                }
            }
        });
        const insert = await Quote.collection.insertMany(quotes);
    } catch (err) {
        logger.error('Error while processing loadQuotes');
    }

    logger.info('loadQuotes process stop');
};