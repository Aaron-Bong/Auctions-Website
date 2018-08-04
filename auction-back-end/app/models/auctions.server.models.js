const  db  =  require ( '../../config/db' );
const datetime = require('node-datetime');

exports.insert = function (values, done){
    let sql = "INSERT INTO auction (`auction_categoryid`, `auction_title`, `auction_description`, `auction_startingdate`, `auction_endingdate`, `auction_reserveprice`, `auction_startingprice`, `auction_creationdate`, `auction_userid`) VALUES (?)";

    db.get_pool().query(sql, values, function (err, res) {
        if(err) { //sql error
            return done(500, err);
        }
        else {
            if(res.affectedRows > 0) { //successful insert
                return done(null, {id : res.insertId});

            } else {
                return done(500, 'Insertion failed.');
            }
        }
    });
};

exports.checkAuctionBidById = function (id, done){
    let sql = "SELECT * FROM bid WHERE bid_auctionid = ?";

    db.get_pool().query(sql, [id], function (err, rows, fields) {
        if(err) { //sql error
            return done(err);
        }
        else {
            if (rows.length > 0) { //if such auction bit exist
                return done(new Error("Forbidden - bidding has begun on the auction."));
            }
            else{
                return done(null)
            }
        }
    });
};

exports.checkAuctionExistById = function (id, done){
    let sql = "SELECT * FROM auction WHERE auction_id = ?";

    db.get_pool().query(sql, [id], function (err, rows, fields) {
        if(err) { //sql error
            return done(err);
        }
        else {
            if (rows.length > 0) { //if such auction bit exist
                return done(null);
            }
            else{
                return done(new Error("Not found."))
            }
        }
    });
};

exports.updateAuctionById = function (id, values, done){
    let sqlUpdate = "UPDATE auction SET ? WHERE auction_id = ?";

    db.get_pool().query(sqlUpdate, [values, id], function (err) {
        if(err) { //sql error
            return done(500, err);

        } else {
            return done(null);
        }
    });
};

exports.getAuctionsBySqlStr = function (sql, done){
    let res = [];
    db.get_pool().query(sql, function (err, rows, fields) {
        if(err) { //sql error
            return done(500, err);
        }
        else {
            if (rows.length > 0) { //if such auction exist
                rows.forEach(function (value) {
                    let jsonRow = {
                        id: value.auction_id,
                        categoryTitle: value.category_title,
                        categoryId: value.category_id,
                        title: value.auction_title,
                        reservePrice: value.auction_reserveprice,
                        startDateTime: datetime.create(value.auction_startingdate).now(),
                        endDateTime: datetime.create(value.auction_endingdate).now(),
                        currentBid: value.currentBid
                    };
                    res.push(jsonRow);
                });

                return done(null, res);
            }
            else{
                return done(null, {});
            }
        }
    });
};

exports.getAuctionsById = function (id, done){
    let sql = "SELECT category_id, category_title, auction_title, auction_reserveprice, auction_startingdate, auction_endingdate, " +
        "auction_description, auction_creationdate, auction_userid, auction_user.user_username, auction_startingprice, IFNULL(MAX(bid.bid_amount),0.00) AS currentBid " +
        "FROM auction " +
        "LEFT JOIN auction_user ON auction.auction_userid = auction_user.user_id " +
        "LEFT JOIN category ON auction.auction_categoryid = category.category_id " +
        "LEFT JOIN bid ON bid.bid_auctionid = auction.auction_id " +
        "WHERE auction.auction_id = ? " +
        "GROUP BY auction.auction_id";

    db.get_pool().query(sql, [id], function (err, rows, fields) {
        if(err) { //sql error
            return done(500, err);
        }
        else {
            if (rows.length > 0) { //if such auction exist
                let res = rows[0]; // always will return 1 row only
                return done(null, res);
            }
            else{
                return done(404);
            }
        }
    });
};

exports.getBidHistoryById = function (id, done){
    let sql = "SELECT bid.bid_amount, bid.bid_datetime, bid.bid_userid, auction_user.user_username FROM bid JOIN auction_user ON bid.bid_userid = auction_user.user_id WHERE bid.bid_auctionid = ?";
    let res = [];
    
    db.get_pool().query(sql, [id], function (err, rows, fields) {
        if(err) { //sql error
            return done(500, err);
        }
        else {
            if (rows.length > 0) { //if such bid exist
                rows.forEach(function (value) {
                    let jsonRow = {
                        amount: value.bid_amount,
                        datetime: datetime.create(value.bid_datetime).now(),
                        buyerId: value.bid_userid,
                        buyerUsername: value.user_username
                    };
                    res.push(jsonRow);
                });

                return done(null, res);
            }
            else{
                return done(404);
            }
        }
    });
};

exports.createBid = function (values, done){
    let sqlSelect = "Select MAX(bid_amount) as currrentBid FROM bid WHERE bid_auctionid = ?";
    let sqlInsert = "INSERT INTO bid(`bid_userid`, `bid_auctionid`, `bid_amount`, `bid_datetime`) VALUES (?)";
    let sqlDate = "SELECT auction_userid, auction_startingdate, auction_endingdate FROM auction WHERE auction_id = ?";

    db.get_pool().query(sqlDate, values[0][1], function (err, rows, fields) {
        if(err) { //sql error
            return done(500, err);
        }
        else {
            let startTimeUnix = datetime.create(rows[0].auction_startingdate).now();
            let endTimeUnix = datetime.create(rows[0].auction_endingdate).now();
            let timeStampUnix = datetime.create().now();

            if ((startTimeUnix <= timeStampUnix) && (timeStampUnix < endTimeUnix) && (parseInt(rows[0].auction_userid) !== parseInt(values[0][0]))) { //if auction not started yet and not owner of auction

                db.get_pool().query(sqlSelect, values[0][1], function (err, res) {
                    if(err) { //sql error
                        return done(500, err);
                    }
                    else {
                        if (res[0].currrentBid >= values[0][2]) {
                            return done(400);

                        } else {
                            db.get_pool().query(sqlInsert, values, function (err, res) {
                                if(err) { //sql error
                                    return done(500, err);

                                } else if (res.affectedRows > 0) {
                                        return done(null);
                                }
                            });
                        }
                    }
                });
            }
            else {
                return done(400);
            }
        }
    });
};
