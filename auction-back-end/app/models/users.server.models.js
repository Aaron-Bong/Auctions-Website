const  db  =  require ( '../../config/db' );
const randomString = require('randomstring');

exports.insert = function (values, done){
    let sql = "INSERT INTO auction_user(`user_username`, `user_givenname`, `user_familyname`, `user_email`, `user_password`) VALUES (?)";

    db.get_pool().query(sql, values, function (err, res) {
        if(err) { //sql error
            return done(500, err);
        }
        else {
            return done(null, {id : res.insertId});
        }
    });
};

exports.checkCredential = function (username, email, password, done){
    let sqlSelect = "SELECT user_password, user_id, user_token FROM auction_user WHERE user_username = ? AND user_email = ?";
    let sqlUpdate = "UPDATE auction_user SET user_token = ? WHERE user_id = ?";

    db.get_pool().query(sqlSelect, [username, email], function (err, rows, fields) {
        if(err) { //sql error
            return done(500, err);
        }
        else {
            if (rows.length > 0) { //if such user exist
                let res = rows[0]; // always will return 1 row only

                if(res.user_password === password) {
                    let userToken = randomString.generate(22) + res.user_id; //random string is 22 char because user id can have max 10 char.

                    db.get_pool().query(sqlUpdate, [userToken, res.user_id], function (err) {
                        if (err) { //sql error
                            return done(500, err);
                        }

                        return done(null, {id: res.user_id, token: userToken});
                    });
                }
                else{
                    return done(400)
                }
            }
            else{
                return done(400)
            }
        }
    });
};

exports.terminateSession = function (authCode, done){
    let sql = "UPDATE auction_user SET user_token = null WHERE user_token = ?";

    db.get_pool().query(sql, [authCode], function (err) {
        if (err) { //sql error
            return done(500, err);
        }
        else {
            return done(null);
        }
    });
};


exports.getUserById = function (id, isOwner, done){
    let sql = "SELECT user_username, user_givenname, user_familyname, user_email, user_accountbalance FROM auction_user WHERE user_id = ?";

    db.get_pool().query(sql, [id], function (err, rows, fields) {
        if(err) { //sql error
            return done(500, err);
        }
        else {
            if (rows.length > 0) { //if such user exist
                let res = rows[0]; // always will return 1 row only
                if(isOwner) {
                    return done(null, {
                        username: res.user_username,
                        givenName: res.user_givenname,
                        familyName: res.user_familyname,
                        email: res.user_email,
                        accountBalance: res.user_accountbalance
                    });
                }
                else {
                    return done(null, {
                        username: res.user_username,
                        givenName: res.user_givenname,
                        familyName: res.user_familyname
                    });
                }
            }
            else{
                return done(404);
            }
        }
    });
};

exports.getUserByAuthCode = function (authCode, done) { //use this only after user has been authorised
    let sql = "SELECT user_id FROM auction_user WHERE user_token = ?";

    db.get_pool().query(sql, [authCode], function (err, rows, fields) {
        if(err){
            return done(500, err)
        }
        return done(null, rows[0].user_id);
    });
};

exports.updateUserById = function (id, values, done){
    //let sqlSelect = "SELECT user_username, user_givenname, user_familyname, user_email, user_accountbalance FROM auction_user WHERE user_id = ?";
    let sqlUpdate = "UPDATE auction_user SET ? WHERE user_id = ?";

    db.get_pool().query(sqlUpdate, [values, id], function (err) {
        if(err) { //sql error
            return done(500, err);

        } else {
            return done(null);
        }
    });
};