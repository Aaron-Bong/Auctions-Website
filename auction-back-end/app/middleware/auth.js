const  db  =  require ( '../../config/db' );

exports.isAuthed = function (req, res, next) {
    let authCode = req.get('X-Authorization');
    if(typeof authCode === 'undefined'){
        return res.status(401).send('Unauthorized');
    }
    let sql = "SELECT user_id FROM auction_user WHERE user_token = ?";

    db.get_pool().query(sql, [authCode], function (err, rows, fields) {
        if(err) { //sql error
            return res.status(500).send(err);
        }
        else {
            if (rows.length > 0) { //if such user exist
                return next();
            }
            else {
                return res.status(401).send('Unauthorized');
            }

        }
    });
};