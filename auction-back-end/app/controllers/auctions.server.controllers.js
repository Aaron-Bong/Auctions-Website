const  auctions  =  require ( '../models/auctions.server.models' );
const  users  =  require ( '../models/users.server.models' );
const  photos  =  require ( '../models/photos.server.models' );
const datetime = require('node-datetime');
const dateFormat = 'Y-m-d H:M:S';

exports.createAuction  = function (req , res ){
    let authCode = req.header('X-Authorization');

    let categoryId = req.body.categoryId;
    let title= req.body.title;
    let description= req.body.description;
    let startDateTimeUnix= req.body.startDateTime;
    let endDateTimeUnix = req.body.endDateTime;
    let reservePrice = req.body.reservePrice;
    let startingBid = req.body.startingBid;


    if(typeof(categoryId) !== 'number' || typeof (title) !== "string" || typeof (description) !== "string" || typeof(startDateTimeUnix) !== "number" || typeof(endDateTimeUnix) !== "number" || typeof(reservePrice) !== "number" || typeof(startingBid) !== "number"){
        return res.status(400).send('Bad request.');
    }

    let timeStampUnix = datetime.create().now();

    //console.log(timeStampUnix);

    if(timeStampUnix > startDateTimeUnix || timeStampUnix > endDateTimeUnix || startDateTimeUnix >= endDateTimeUnix){
        return res.status(400).send('Bad request.-----');
    }

    if(title.trim().length === 0 || reservePrice < 0 || startingBid < 0 || startDateTimeUnix < 0 || endDateTimeUnix < 0){
        return res.status(400).send('Bad request.*****');
    }

    let startDateTime= datetime.create(startDateTimeUnix).format(dateFormat);
    let endDateTime = datetime.create(endDateTimeUnix).format(dateFormat);

    users.getUserByAuthCode(authCode, function (err, userAuthedId) {
        if(err === 500){
            return res.status(500).send(userAuthedId); //here, userAuthedId is error msg
        }

        let now = new Date();
        let timeStamp = now.toLocaleDateString() + " " + now.toLocaleTimeString();

        let values = [
            [categoryId, title, description, startDateTime, endDateTime, reservePrice, startingBid, timeStamp, userAuthedId]
        ];

        auctions.insert (values, function (err, result) {
            if (err === 500){
                return res.status(500).send(result);
            } else {
                return res.status(201).send(result);
            }
        });
    });
};

exports.patchAuctionById  = function (req, res){
    let authCode = req.header('X-Authorization');
    let id  = req.params.id;
    let reqBody = req.body;
    let values = {};

    photos.checkAuctionOwner(authCode, id, function (err, result) {
        if(err){
            return res.status(500).send(err);

        } else if (result){

            if (reqBody.hasOwnProperty('categoryId')) {
                if (typeof reqBody.categoryId === 'number') {
                    values['auction_categoryid'] = reqBody.categoryId;
                }
                else {
                    return res.status(400).send('Bad request.');
                }
            }

            if (reqBody.hasOwnProperty('title')) {
                if (typeof reqBody.title === 'string' && reqBody.title.trim().length > 0) {
                    values['auction_title'] = reqBody.title;
                }
                else {
                    return res.status(400).send('Bad request.');
                }
            }

            if (reqBody.hasOwnProperty('description')) {
                if (typeof reqBody.description === 'string') {
                    values['auction_description'] = reqBody.description;
                }
                else {
                    return res.status(400).send('Bad request.');
                }
            }

            if (reqBody.hasOwnProperty('startDateTime')) {
                if (typeof reqBody.startDateTime === 'number' && reqBody.startDateTime >= 0) {
                    values['auction_startingdate'] = datetime.create(reqBody.startDateTime).format(dateFormat);
                }
                else {
                    return res.status(400).send('Bad request.');
                }
            }

            if (reqBody.hasOwnProperty('endDateTime')) {
                if (typeof reqBody.endDateTime === 'number' && reqBody.endDateTime >= 0) {
                    values['auction_endingdate'] = datetime.create(reqBody.endDateTime).format(dateFormat);
                }
                else {
                    return res.status(400).send('Bad request.');
                }
            }

            if (reqBody.hasOwnProperty('reservePrice')) {
                if (typeof reqBody.reservePrice === 'number' && reqBody.reservePrice >= 0) {
                    values['auction_reserveprice'] = reqBody.reservePrice;
                }
                else {
                    return res.status(400).send('Bad request.');
                }
            }

            if (reqBody.hasOwnProperty('startingBid')) {
                if (typeof reqBody.startingBid === 'number' && reqBody.startingBid >= 0) {
                    values['auction_startingprice'] = reqBody.startingBid;
                }
                else {
                    return res.status(400).send('Bad request.');
                }
            }

            if (Object.keys(values).length === 0){ //if empty json
                return res.status(201).send('--');
            }

            auctions.updateAuctionById(id, values, function (err, result) {
                if (err === 500) {
                    return res.status(500).send(result);
                } else {
                    return res.status(201).send();
                }
            });
        } else {
            return res.status(401).send('Unauthorized---');
        }
    });
};

exports.getMany  = function (req, res){
    let startIndex = req.query.startIndex;
    let count = req.query.count;
    let q = req.query.q;
    let categoryId = req.query['category-id'];
    let seller = req.query.seller;
    let bidder = req.query.bidder;
    //let winner = req.query.winner;

    let hasStartIndex = false;
    let hasCount = false;
    let whereClauseInsertd = false;
    let finalSqlStr;

    let sqlStr1 = 'SELECT auction_id, category_title, category_id, auction_title, auction_reserveprice, auction_startingdate, ' +
        'auction_endingdate, IFNULL(MAX(bid.bid_amount),0.00) AS currentBid FROM auction ' +
        'LEFT JOIN category ON auction.auction_categoryid = category.category_id ' +
        'LEFT JOIN bid ON bid.bid_auctionid = auction.auction_id';

    let sqlStr2 = 'GROUP BY auction.auction_id ' +
        'ORDER BY auction.auction_startingdate DESC';

    //console.log(typeof startIndex);
    if(typeof startIndex !== 'undefined'){
        if(isNaN(startIndex)){
            return res.status(400).send('Bad request.');
        }
        hasStartIndex = true;
    }
    if(typeof count !== 'undefined'){
        if(isNaN(count)){
            return res.status(400).send('Bad request.');
        }
        hasCount = true;
    }

    if(!hasStartIndex){
        startIndex = 0;
    }

    if(!hasCount){
        count = 9999;
    }

    if(hasStartIndex || hasCount){
        sqlStr2 += ' LIMIT ' + count + ' OFFSET ' + startIndex; //limit and offset must always be together
    }


    if(typeof q !== 'undefined'){
        //paramIsEmpty = false;
        if(!whereClauseInsertd){
            sqlStr1 += ' WHERE ';
            whereClauseInsertd = true;
        }
        sqlStr1 += "auction_title LIKE '%" + q + "%'";
    }

    if(typeof categoryId !== 'undefined') {
        if(isNaN(categoryId)){
            return res.status(400).send('Bad request.');
        }
        //paramIsEmpty = false;
        if (!whereClauseInsertd) {
            sqlStr1 += ' WHERE ';
            whereClauseInsertd = true;
        } else {
            sqlStr1 += ' AND ';
        }
        sqlStr1 += 'category_id=' + categoryId;
    }

    if(typeof seller !== 'undefined'){
        if(isNaN(seller)){
            return res.status(400).send('Bad request.');
        }
        if(!whereClauseInsertd){
            sqlStr1 += ' WHERE ';
            whereClauseInsertd = true;
        } else{
            sqlStr1 += ' AND ';
        }
        sqlStr1 += 'auction_userid=' + seller;
    }

    if(typeof bidder !== 'undefined'){
        if(isNaN(bidder)){
            return res.status(400).send('Bad request.');
        }
        if(!whereClauseInsertd){
            sqlStr1 += ' WHERE ';
            whereClauseInsertd = true;
        } else{
            sqlStr1 += ' AND ';
        }
        sqlStr1 += 'bid_userid=' + bidder;
    }

    // if(typeof winner !== 'undefined'){
    //     //paramIsEmpty = false;
    //     if(!whereClauseInsertd){
    //         sqlStr1 += ' WHERE ';
    //         whereClauseInsertd = true;
    //     } else{
    //         sqlStr1 += ' AND ';
    //     }
    //
    // }

    // if (paramIsEmpty){
    //     return res.status(400).send('Bad request.');
    // }

    finalSqlStr = sqlStr1 + ' ' +sqlStr2;

    console.log(finalSqlStr);

    auctions.getAuctionsBySqlStr (finalSqlStr, function (err, result) {
        if(err===500){
            return res.status(500).send(result);
        } else {
            return res.status(200).send(result);
        }
    });
};

exports.getOne  = function (req, res){
    let id  = req.params.id;
    let auctionInfo = null;
    let bidHistory = [];

    auctions.getAuctionsById (id, function (err, result) {
        if(err===500){
            return res.status(500).send(result);
        }
        else if (err===404){
            return res.status(404).send('Not found');
        }
        else {
            auctionInfo = result;
            auctions.getBidHistoryById (id, function (err, result) {
                if(err===500){
                    return res.status(500).send(result);
                }
                else if (err!==404){
                    bidHistory = result;
                }

                let finalResult = {
                    categoryId: auctionInfo.category_id,
                    categoryTitle: auctionInfo.category_title,
                    title: auctionInfo.auction_title,
                    reservePrice: auctionInfo.auction_reserveprice,
                    startDateTime: datetime.create(auctionInfo.auction_startingdate).now(),
                    endDateTime: datetime.create(auctionInfo.auction_endingdate).now(),
                    description: auctionInfo.auction_description,
                    creationDateTime: datetime.create(auctionInfo.auction_creationdate).now(),
                    seller: {
                        id: auctionInfo.auction_userid,
                        username: auctionInfo.user_username
                    },
                    startingBid: auctionInfo.auction_startingprice,
                    currentBid: auctionInfo.currentBid,
                    bids: bidHistory
                };

                return res.status(200).send(finalResult);
            });
        }
    });
};

exports.getBidHistory  = function (req, res){
    let id  = req.params.id;

    auctions.getBidHistoryById (id, function (err, result) {
        if(err === 500) {
            return res.status(500).send(result);
        }
        else if (err === 404){
                return res.status(404).send('Not found');
            }
         else {
            return res.status(200).send(result);
        }
    });
};

exports.makeBid  = function (req, res){
    let authCode = req.header('X-Authorization');

    let auctionId  = req.params.id;
    let bidAmount = req.query.amount;

    if(isNaN(bidAmount) || isNaN(auctionId)){
        return res.status(400).send('Bad request.');
    }

    let now = new Date();
    let timeStamp = now.toLocaleDateString() + " " + now.toLocaleTimeString();

    users.getUserByAuthCode(authCode, function (err, userAuthedId) {
        if(err === 500){
            return res.status(500).send(userAuthedId); //here, userAuthedId is error msg
        }
            let values = [
            [userAuthedId, auctionId, bidAmount, timeStamp]
        ];

        auctions.createBid(values, function (err, result) {
            if (err === 500) {
                return res.status(500).send(result);

            } else if (err === 400){
                return res.status(400).send("Bad request.");

            } else {
                return res.status(201).send();
            }
        });
    });
};
