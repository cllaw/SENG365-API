const Auction = require('../models/auction.server.model');
const User = require('../models/user.server.model');

exports.listAuctions = function(req, res){
    Auction.getAuction(function(result){
        res.json(result);
    });
};

exports.listOneAuction = function(req, res){
    let id = req.params.auctionId;
    if (id === null) {
        return res.status(400).send("Bad request. ");
    }
    Auction.getOneAuction(id, function(err, auction) {
        if (err || auction.length === 0) {
            return res.status(404).send("Not found");
        } else {
            let all = Object.assign({}, auction[0]);
            let sellerId = auction[0].seller;

            Auction.getSeller(sellerId, function (err, sellerInfo) {

                if (err || sellerInfo.length === 0) {
                    return res.status(404).send("Not found");
                } else {
                    all["seller"] = sellerInfo[0];

                    Auction.getOneBid(id, function(err, bids) {
                        if (err) {
                            return res.status(404).send("Not found");
                        } else {
                            all["bids"] = bids;
                        }

                        Auction.getcurrentBid(id, function(err, currentBid) {
                            if (err || currentBid.length === 0) {
                                return res.status(404).send("Not found");
                            } else {
                                Object.assign(all, {"currentBid":currentBid[0].currentBid});
                                res.status(200).json(all);
                            }
                        })

                    })
                }
            })
        }
    });
};

exports.listOneBid = function(req, res){
    let id = req.params.auctionId;
    Auction.getOneBid(id, function(err, result){
        if (err){
            return res.sendStatus(400); // bad request error
        }
        if (result.length == 0) // no bids
            return res.sendStatus(404);
        res.status(200).json(result);
    });
};

exports.createAuction = function(req, res){
    let token = req.get('X-Authorization');
    let auction_data = Object.assign({}, req.body);

    if(token === undefined)
        res.sendStatus(401);
    else {
        User.getIdOfTokens(token, function(err, seller_id) {
            if (err) return res.sendStatus(400);
            Auction.insertAuction(auction_data, token, seller_id, function(err, seller_id){
                if (err){
                    return res.sendStatus(400); // same auction
                }
                res.status(201).json({id:seller_id});
            })
        })
    }
};

exports.createBid = function(req, res){
    //TODO: figure out how bids amounts are entered and fix checkValidBid to get the successful bid through
    let token = req.get('X-Authorization');
    let amount = req.query.amount;
    let id = req.params.auctionId;

    if (token === null || token === undefined)
        return res.sendStatus(401);

    console.log("");

    User.getIdOfTokens(token, function(err, userId) {
        if (err){
            return res.sendStatus(400);
        } else {
            User.getToken(userId, function(err, user_token) {
                if (err){
                    return res.sendStatus(400);
                } else {
                     Auction.checkValidBid(amount, id, function(err, valid){
                        if (!valid) {
                            return res.sendStatus(400); //invalid bid
                        } else {
                            if (user_token === token) {
                                Auction.insertBid(amount, id, userId, function(err){
                                    if (err) {
                                        return res.sendStatus(400);
                                    }
                                    res.status(201).send("OK");
                                })
                            } else {
                                res.sendStatus(401);
                            }
                        }
                    })
                }
            })
        }
    })
};

exports.updateAuction = function(req, res){
    let token = req.get('X-Authorization');
    let id = req.params.auctionId;
    let user_data = Object.assign({}, req.body);

    if (token === null || token === undefined)
        return res.sendStatus(401);

    User.getIdOfTokens(token, function(err, userId) {
        if (err) {
            return res.sendStatus(404);
        } else {
            User.getToken(userId, function (err, result) {
                if (result === token) {
                    Auction.editAuction(id, user_data, function (err) {
                        if (err) {
                            return res.sendStatus(400);
                        }
                        res.status(201).send("OK");
                    })
                } else {
                    res.status(401).send("Unauthorized");
                }
            })
        }}
    )
};