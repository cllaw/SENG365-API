const photos = require('../controllers/photo.server.controller');

module.exports = function(app){
    // List auction photo URIs
    app.route('/api/v1/auctions/:auctionId/photos')
        .get(photos.getPhotos)
        .post(photos.addPhoto)
        .delete(photos.removePhoto);
};