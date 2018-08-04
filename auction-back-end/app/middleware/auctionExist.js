const  db  =  require ( '../../config/db' );

exports.AuctionExistById = function (req, res, next){
    let id = req.params.id;
    let sql = "SELECT * FROM auction WHERE auction_id = ?";

    if(isNaN(id)){ //if not a number
        return res.status(400).send('Bad request.');
    }

    db.get_pool().query(sql, [id], function (err, rows, fields) {
        if(err) { //sql error
            return res.status(500).send(err);
        }
        else {
            if (rows.length > 0) { //if such auction bit exist
                return next();
            }
            else{
                return res.status(404).send("Not found.");
            }
        }
    });
};