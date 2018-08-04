const  users  =  require ( '../models/users.server.models' );
const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

exports.create_user  = function (req, res){
    let username = req.body.username;
    let givenName = req.body.givenName;
    let familyName = req.body.familyName;
    let email = req.body.email;
    let password = req.body.password;

    if(typeof username !== 'string' || typeof givenName !== 'string' || typeof familyName !== 'string' || typeof email !== 'string' || typeof password !== 'string'){
        return res.status(400).send('Malformed request');
    }

    if(! emailRegex.test(email)){
        return res.status(400).send('Malformed request');
    }

    if(username === '' || password === ''){
        return res.status(400).send('Malformed request');
    }

    let values =
        [
            [username, givenName, familyName, email, password]
        ];
    users.insert (values, function (err, result) {
        if (err === 500){
            return res.status(500).send(result);
        } else {
            return res.status(201).send(result);
        }
    });
};

exports.login  = function (req, res){
    let username = req.query.username;
    let email = req.query.email;
    let password = req.query.password;

    if(typeof password !== 'string' || (typeof username !== 'string' && typeof email !== 'string')){
        return res.status(400).send('Invalid username/email/password supplied');

    }

    if(typeof username === 'undefined'){
        username = 0;

    }

    if(typeof email === 'undefined'){
        email = 0;
    }

    users.checkCredential (username, email, password, function (err, result) {
        if(err === 500){
            return res.status(500).send(result);

        } else if (err === 400){
            return res.status(400).send('Invalid username/email/password supplied');
        }
        else {
            return res.status(200).send(result);
        }
    });
};

exports.logout  = function (req, res){
    let authCode = req.header('X-Authorization');
    users.terminateSession(authCode, function (err, result) {
        if(err === 500){
            return res.status(500).send(result);
        } else {
            return res.status(200).send();
        }
    });
};

exports.userById  = function (req, res){
    let id  = req.params.id;
    let authCode = req.header('X-Authorization');

    if(isNaN(id)){ //if not a number
        return res.status(500).send('Internal server error');
    }

    users.getUserByAuthCode(authCode, function (err, userAuthedId) {
        if(err === 500){
            return res.status(500).send(userAuthedId); //userAuthedId is error msg
        }

        if (parseInt(userAuthedId) === parseInt(id)){
            users.getUserById (id, true, function (err, result) {
                if(err === 500){
                    return res.status(500).send(result);
                }
                else if (err === 404){
                    return res.status(404).send('Not found');
                }
                else {
                    return res.status(200).send(result);
                }
            });
        }
        else {
            users.getUserById (id, false ,function (err, result) {
                if(err === 500){
                    return res.status(500).send(result);
                }
                else if (err === 404){
                    return res.status(404).send('Not found');
                }
                else {
                    return res.status(200).send(result);
                }
            });
        }
    });


};

exports.patchUserById  = function (req, res){
    let id  = req.params.id;
    let authCode = req.header('X-Authorization');
    let reqBody = req.body;
    let values = {};

    if(reqBody.hasOwnProperty('username')){
        if(reqBody.username === ''){
            return res.status(500).send('Internal server error');
        }
        values['user_username'] = reqBody.username;
    }

    if(reqBody.hasOwnProperty('givenName')){
        values['user_givenname'] = reqBody.givenName;
    }

    if(reqBody.hasOwnProperty('familyName')){
        values['user_familyname'] = reqBody.familyName;
    }

    if(reqBody.hasOwnProperty('email')){
        if(! emailRegex.test(reqBody.email)){
            return res.status(500).send('Internal server error');
        }
        values['user_email'] = reqBody.email;
    }

    if(reqBody.hasOwnProperty('password')){
        if(reqBody.password === ''){
            return res.status(500).send('Internal server error');
        }
        values['user_password'] = reqBody.password;
    }

    if (Object.keys(values).length === 0){ //if empty json
        return res.status(201).send();
    }

    users.getUserByAuthCode(authCode, function (err, userAuthedId) {
        if (err === 500) {
            return res.status(500).send(userAuthedId); //userAuthedId is error msg
        }
        if (parseInt(userAuthedId) === parseInt(id)) {
            users.updateUserById(id, values, function (err, result) {
                if (err === 500) {
                    return res.status(500).send(result);

                } else {
                    return res.status(201).send();
                }
            });
        }
        else {
            return res.status(500).send('Internal server error');
        }
    });
};