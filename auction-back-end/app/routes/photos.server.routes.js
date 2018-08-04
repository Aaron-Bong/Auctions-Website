const  photos  =  require ( '../controllers/photos.server.controllers' );
const auctionExist = require('../middleware/auctionExist');
const auth = require('../middleware/auth');
const auctionStart = require('../middleware/auctionStart');

module.exports  =  function (app){
    app.route('/api/v1/auctions/:id/photos')
        .get(auctionExist.AuctionExistById, photos.auctionPhotos)
        .post(auth.isAuthed, auctionExist.AuctionExistById, auctionStart.AuctionStart400, photos.uploadPhoto)
        .delete(auth.isAuthed, auctionExist.AuctionExistById, auctionStart.AuctionStart400, photos.deletePhoto);

};