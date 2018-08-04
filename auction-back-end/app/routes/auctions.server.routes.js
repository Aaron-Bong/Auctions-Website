const  auctions  =  require ( '../controllers/auctions.server.controllers' );
const auth = require('../middleware/auth');
const auctionExist = require('../middleware/auctionExist');
const auctionStart = require('../middleware/auctionStart');

module.exports  =  function (app){

    app.route('/api/v1/auctions')
        .get(auctions.getMany)
        .post(auth.isAuthed, auctions.createAuction);

    app.route('/api/v1/auctions/:id')
        .get(auctionExist.AuctionExistById, auctions.getOne)
        .patch(auth.isAuthed, auctionExist.AuctionExistById, auctionStart.AuctionStart403, auctions.patchAuctionById);

    app.route('/api/v1/auctions/:id/bids')
        .get(auctionExist.AuctionExistById, auctions.getBidHistory)
        .post(auth.isAuthed, auctionExist.AuctionExistById, auctions.makeBid);
};