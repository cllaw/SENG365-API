const auctions = require('../controllers/auction.server.controller');

module.exports = function(app){
    // View auctions, sorted from most recent to least recent
    app.route('/api/v1/auctions')
        .get(auctions.listAuctions)
        .post(auctions.createAuction);

    // View auction details
    app.route('/api/v1/auctions/:auctionId')
        .get(auctions.listOneAuction)
        .patch(auctions.updateAuction);

    // View bid history
    app.route('/api/v1/auctions/:auctionId/bids')
        .get(auctions.listOneBid)
        .post(auctions.createBid);

};