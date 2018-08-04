const  photos  =  require ( '../models/photos.server.models' );
const fs = require('fs');


exports.auctionPhotos  = function (req , res ){
    let id  = req.params.id;

    if(isNaN(id)){ //if not a number
        return res.status(400).send('Bad request.');
    }

    photos.getPhotoById (id, function (err, mime, result) {
        if (err && mime === "500"){
            return res.status(500).send(err);

        } else {
            if (mime === ".jpeg" || mime === ".jpg") {
                res.writeHead(200, {'Content-Type': 'image/jpeg'});
                res.end(result);

            } else {
                res.writeHead(200, {'Content-Type': 'image/png'});
                res.end(result);
            }
        }
    });
};

exports.uploadPhoto  = function (req , res ){
    let id  = req.params.id;
    let authCode = req.get('X-Authorization');
    let fileType = req.get('Content-Type');
    let mime = null;

    if(isNaN(id)){ //if not a number
        return res.status(400).send('Bad request.');
    }

    if(fileType === 'image/jpeg'){
        mime = ".jpeg"

    }
    else if(fileType === 'image/png') {
        mime = ".png"

    } else {
        return res.status(400).send('Bad request.');
    }

    photos.checkAuctionOwner(authCode, id, function (err, result) {
       if(err){
           return res.status(500).send(err);

       } else if (result){
           try {
               req.pipe(fs.createWriteStream('./upload/' + id + mime));
               return res.status(201).send();
           }
           catch (e){
               return res.status(500).send('Internal server error.');
           }
       } else {
           return res.status(401).send('Unauthorized');
       }
    });
};

exports.deletePhoto  = function (req , res ){
    let auctionId  = req.params.id;
    let authCode = req.get('X-Authorization');

    if(isNaN(auctionId)){ //if not a number
        return res.status(500).send('Internal server error');
    }

    photos.checkAuctionOwner(authCode, auctionId, function (err, result) {
        if(err){
            return res.status(500).send(err);

        } else if (result){
            photos.deletePhotoById (auctionId, function (err) {
                if (err === 500){
                    return res.status(500).send(err);
                }
                else if (err){
                    return res.status(404).send("Not found");
                } else {
                    return res.status(201).send();
                }
            });
        } else {
            return res.status(401).send('Unauthorized');
        }
    });
};
