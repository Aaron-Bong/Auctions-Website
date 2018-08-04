const  db  =  require ( '../../config/db' );
const fs = require('fs');

exports.getPhotoById = function (id, done){
    try {
        fs.readFile('./upload/' + id + '.jpg', function (err, data) {
            if (err) { //not found
                fs.readFile('./upload/' + id + '.jpeg', function (err, data) {
                    if (err) { //not found
                        fs.readFile('./upload/' + id + '.png', function (err, data) {
                            if (err) { //not found
                                fs.readFile('./upload/default.png', function (err, data) { //return default img
                                    if (err) { //not found
                                        return done(err, '500');
                                    } else {
                                        return done(null, '.png', data);
                                    }
                                });
                            } else {
                                return done(null, '.png', data);
                            }
                        });
                    } else {
                        return done(null, '.jpeg', data);
                    }
                });
            } else {
                return done(null, '.jpg', data);
            }
        });
    } catch (e){
        return done(true, 500);
    }
};

exports.checkAuctionOwner = function (authCode, id, done) {
    let sql = 'SELECT * FROM auction JOIN auction_user ON auction.auction_userid = auction_user.user_id WHERE auction_user.user_token = ? AND auction.auction_id = ?';

    db.get_pool().query(sql, [authCode, id], function (err, rows, fields) {
        if (err) { //sql error
            return done(err);
        }
        else {
            if (rows.length > 0) { //if auction id belongs to owner
                return done(null, true)
            }
            else {
                return done(null, false)
            }
        }
    });
};



exports.deletePhotoById = function (auctionId, done){
    try {
        fs.unlink('./upload/' + auctionId + '.png', function (err) {
            if (err) { //not found
                fs.unlink('./upload/' + auctionId + '.jpeg', function (err) {
                    if (err) { //not found
                        fs.unlink('./upload/' + auctionId + '.jpg', function (err) {
                            if (err) { //not found
                                return done(err);
                            } else {
                                return done(null);
                            }
                        });
                    } else {
                        return done(null);
                    }
                });
            } else {
                return done(null);
            }
        });
    } catch (e){
        return done(500);
    }
};