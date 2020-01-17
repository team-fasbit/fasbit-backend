var logger = require('../helpers/logger');
var coinMarketCapAPI = require('../helpers/coinMarketCapAPI');

var Coin = require('../models/Coin');

module.exports = async () => {
    logger.info('refreshTop500 process start');

    try {
        await Coin.deleteMany({}).exec();

        const listingLatest = await coinMarketCapAPI.listingLatest();
        var coins = [];

        if (listingLatest && Array.isArray(listingLatest) && listingLatest.length > 0) {
            listingLatest.forEach(listedCoin => {
                var insertCoin = {
                    cmc_id: listedCoin.id,
                    name: listedCoin.name,
                    symbol: listedCoin.symbol,
                    slug: listedCoin.slug,
                    cmc_rank: listedCoin.cmc_rank,
                    num_market_pairs: listedCoin.num_market_pairs,
                    circulating_supply: listedCoin.circulating_supply,
                    total_supply: listedCoin.total_supply,
                    max_supply: listedCoin.max_supply,
                    last_updated: listedCoin.last_updated,
                    date_added: listedCoin.date_added,
                    tags: listedCoin.tags,
                };
                if (listedCoin.quote && listedCoin.quote.USD) {
                    insertCoin = {
                        ...insertCoin,
                        price: listedCoin.quote.USD.price,
                        volume_24h: listedCoin.quote.USD.volume_24h,
                        percent_change_1h: listedCoin.quote.USD.percent_change_1h,
                        percent_change_24h: listedCoin.quote.USD.percent_change_24h,
                        percent_change_7d: listedCoin.quote.USD.percent_change_7d,
                        market_cap: listedCoin.quote.USD.market_cap,
                        quote_last_updated: listedCoin.quote.USD.last_updated
                    };
                }
                coins.push(insertCoin);
            });

            const insert = await Coin.collection.insertMany(coins);
        } else {
            logger.error('listingLatest conditions rejected');
        }
    } catch (err) {
        logger.error('Error while processing refreshTop500');
    }

    logger.info('refreshTop500 process stop');
};