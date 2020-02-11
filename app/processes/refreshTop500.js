var logger = require('../helpers/logger');
var coinMarketCapAPI = require('../helpers/coinMarketCapAPI');

var Coin = require('../models/Coin');

module.exports = async () => {
    logger.info('refreshTop500 process start');

    try {
        const listingLatest = await coinMarketCapAPI.listingLatest();
        var receivedCoins = {};
        var latestCoins = [];
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
                    active: true
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
                latestCoins.push(listedCoin.id);
                receivedCoins[listedCoin.id] = insertCoin;
            });
            const existingCoins = (await Coin.find({}).exec()).map(x => x.cmc_id);

            const coinActivated = await Coin.updateMany({ active: false, cmc_id: { $in: latestCoins } }, { $set: { active: true } }).exec();
            const coinDeactivated = await Coin.updateMany({ active: true, cmc_id: { $nin: latestCoins } }, { $set: { active: false } }).exec();

            latestCoins.forEach(coin => {
                if (!existingCoins.includes(coin)) {
                    coins.push(receivedCoins[coin]);
                }
            });

            if (coins.length) {
                const insert = await Coin.insertMany(coins);
            }
        } else {
            logger.error('listingLatest conditions rejected');
        }
    } catch (err) {
        logger.error('Error while processing refreshTop500');
    }

    logger.info('refreshTop500 process stop');
};