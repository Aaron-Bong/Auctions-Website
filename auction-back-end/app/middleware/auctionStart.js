const  db  =  require ( '../../config/db' );
const datetime = require('node-datetime');

exports.AuctionStart403 = function (req, res, next){ // use this function only after autionExist is used
    let id = req.params.id;
    let sql = "SELECT auction_startingdate FROM auction WHERE auction_id = ?";

    if(isNaN(id)){ //if not a number
        return res.status(400).send('Bad request.');
    }

    db.get_pool().query(sql, [id], function (err, rows, fields) {
        if(err) { //sql error
            return res.status(500).send(err);
        }
        else {
            let startTimeUnix = datetime.create(rows[0].auction_startingdate).now();
            let timeStampUnix = datetime.create().now();

            if (timeStampUnix < startTimeUnix) { //if auction not started yet
                return next();
            }
            else{
                return res.status(403).send("Forbidden - bidding has begun on the auction.");
            }
        }
    });
};

exports.AuctionStart400 = function (req, res, next){ // use this function only after autionExist is used
    let id = req.params.id;
    let sql = "SELECT auction_startingdate FROM auction WHERE auction_id = ?";

    if(isNaN(id)){ //if not a number
        return res.status(400).send('Bad request.');
    }

    db.get_pool().query(sql, [id], function (err, rows, fields) {
        if(err) { //sql error
            return res.status(500).send(err);
        }
        else {
            let startTimeUnix = datetime.create(rows[0].auction_startingdate).now();
            let timeStampUnix = datetime.create().now();

            if (timeStampUnix < startTimeUnix) { //if auction not started yet
                return next();
            }
            else{
                return res.status(400).send("Forbidden - bidding has begun on the auction.");
            }
        }
    });
};