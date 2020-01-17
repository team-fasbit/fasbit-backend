var rp = require('request-promise');

var logger = require('../helpers/logger');

const API_KEY = '3c5d8a7b-34b6-4d7b-9f83-165a2284f87e';

module.exports = {
    listingLatest: async () => {
        try {
            const result = await rp.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest', {
                qs: {
                    start: 1,
                    limit: 500,
                    sort: 'market_cap',
                    sort_dir: 'desc'
                },
                headers: {
                    'X-CMC_PRO_API_KEY': API_KEY
                },
                json: true,
                gzip: true
            });

            if (result && result.data && result.status && result.status.error_code != undefined && result.status.error_code === 0) {
                return result.data;
            } else if (result.status && result.status.error_message) {
                logger.error(result.status.error_message);
            }
            return false;
        } catch (err) {
            return false;
        }
    },

    quotesLatest: async (coin_id) => {
        try {
            const result = await rp.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest', {
                qs: {
                    id: coin_id
                },
                headers: {
                    'X-CMC_PRO_API_KEY': API_KEY
                },
                json: true,
                gzip: true
            });

            if (result && result.data && result.status && result.status.error_code != undefined && result.status.error_code === 0) {
                return result.data;
            } else if (result.status && result.status.error_message) {
                logger.error(result.status.error_message);
            }
            return false;
        } catch (err) {
            return false;
        }
    },

    // quotesHistorical: async (coin_id, time_start, time_end = false) => {
    //     try {
    //         var qs = {
    //             id: coin_id,
    //             time_start: time_start
    //         };
    //         if (time_end) {
    //             qs.time_end = time_end;
    //         }

    //         const result = await rp.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/historical', {
    //             qs: qs,
    //             headers: {
    //                 'X-CMC_PRO_API_KEY': API_KEY
    //             },
    //             json: true,
    //             gzip: true
    //         });

    //         if (result && result.data && result.status && result.status.error_code != undefined && result.status.error_code === 0) {
    //             return result.data;
    //         } else if (result.status && result.status.error_message) {
    //             logger.error(result.status.error_message);
    //         }
    //         return false;
    //     } catch (err) {
    //         console.log(err);
    //         return false;
    //     }
    // },

    ohlcvLatest: async (coin_id) => {
        try {
            const result = await rp.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/ohlcv/latest', {
                qs: {
                    id: coin_id
                },
                headers: {
                    'X-CMC_PRO_API_KEY': API_KEY
                },
                json: true,
                gzip: true
            });

            if (result && result.data && result.status && result.status.error_code != undefined && result.status.error_code === 0) {
                return result.data;
            } else if (result.status && result.status.error_message) {
                logger.error(result.status.error_message);
            }
            return false;
        } catch (err) {
            return false;
        }
    },

    ohlcvHistorical: async (coin_id, time_start, time_end = false) => {
        try {
            var qs = {
                id: coin_id,
                time_start: time_start,
                time_period: 'hourly',
                interval: '1h'
            };
            if (time_end) {
                qs.time_end = time_end;
            }

            const result = await rp.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/ohlcv/historical', {
                qs: qs,
                headers: {
                    'X-CMC_PRO_API_KEY': API_KEY
                },
                json: true,
                gzip: true
            });

            if (result && result.data && result.status && result.status.error_code != undefined && result.status.error_code === 0) {
                logger.info('ohlcvHistorical called');
                return result.data;
            } else if (result.status && result.status.error_message) {
                logger.error(result.status.error_message);
            }
            return false;
        } catch (err) {
            logger.error(err.message);
            return false;
        }
    }
};