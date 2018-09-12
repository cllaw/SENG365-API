const db = require('../../config/db');

exports.getAuction = function(done){
    db.get_pool().query('SELECT auction_id AS id, category_title AS categoryTitle, auction_categoryid AS categoryId, auction_title AS title, ' +
        'auction_reserveprice AS reservePrice, auction_startingdate AS startDateTime, ' +
        'auction_endingdate AS endDateTime, MAX(bid_amount) AS currentBid ' +
        'FROM auction ' +
        'JOIN category ON auction.auction_categoryid = category.category_id ' +
        'JOIN bid ON auction.auction_id = bid.bid_auctionid ' +
        'GROUP BY auction_id ' +
        'ORDER BY auction_startingdate ASC ',
        function (err, rows) {

        if (err) return done({"ERROR": "Error selecting"});
        return done(rows);

    });
};

// SELECT auction.auction_id AS id, category.category_title AS categoryTitle, auction.auction_title AS title, auction.auction_reserveprice AS reservePrice, auction.auction_startingdate AS startDateTime, auction.auction_endingdate AS endDateTime FROM auction, category WHERE auction.auction_categoryid = category.category_id AND auction.auction_title LIKE "%t%" AND category.category_id = 1 AND auction.auction_userid = 3 ORDER BY auction.auction_startingdate DESC LIMIT 999 OFFSET 0

//TODO: figure out how to display a select statement results in a select statement
exports.getOneAuction = function(auctionId, done){
    db.get_pool().query('SELECT auction_categoryid AS categoryId, category_title AS categoryTitle, auction_title AS title, auction_reserveprice AS reservePrice, ' +
        'auction_startingdate AS startDateTime, auction_endingdate AS endDateTime, auction_description AS description, auction_creationdate AS creationDateTime, auction_startingprice AS startingBid, auction_userid AS seller ' +
        'FROM auction ' +
        'JOIN category ON auction.auction_categoryid = category.category_id ' +
        'WHERE auction_id = ?',
        auctionId, function (err, results) {

            if (err) {
                return done({"ERROR": "Error selecting"});
            } else {
                return done(err, results);
            }
        })
};

exports.getOneBid = function(bid_auctionId, done){
    db.get_pool().query('SELECT bid_amount AS amount, bid_datetime AS datetime, bid_userid AS buyerId, user_username AS buyerUsername ' +
        'FROM bid ' +
        'JOIN auction_user ON bid.bid_userid = auction_user.user_id ' +
        'WHERE bid_auctionid = ?', bid_auctionId, function (err, results) {

        if (err) return done({"ERROR": "Error selecting"});
        if (results.length == 0) {
            return done(err, results);
        }
        return done(err, results);

    });
};

exports.getSeller = function(sellerId, done){
    db.get_pool().query('SELECT user_id AS id, user_username AS username ' +
        'FROM auction_user ' +
        'WHERE user_id = ?', sellerId, function (err, results) {

        if (err) return done({"ERROR": "Error selecting"});
        if (results.length == 0) {
            return done(err);
        }
        return done(err, results);

    });
};

exports.getcurrentBid = function(id, done){
    db.get_pool().query('SELECT MAX(bid_amount) as currentBid FROM bid ' +
        'WHERE bid_auctionid = ?' , id, function (err, results) {

        if (err) return done({"ERROR": "Error selecting"});
        if (results.length == 0) {
            return done(err);
        }
        return done(err, results);

    });
};

exports.insertAuction = function(auction, token, seller_id, done){
    if (auction.startDateTime == 0 || auction.endDateTime == 0 || auction.startDateTime > auction.endDateTime)
        return done(true, null);

    //TODO: fix error checking of this implementation. find out what to set start date time as? current UNIX time?
    db.get_pool().query('INSERT INTO auction (auction_categoryid, auction_title, auction_description, auction_startingdate, ' +
        'auction_endingdate, auction_reserveprice, auction_startingprice, auction_userid) VALUES (?)',
        [[auction.categoryId, auction.title, auction.description, auction.startDateTime,
            auction.endDateTime, auction.reservePrice, auction.startingBid, seller_id]],

        function(err) {
        if (err) return done(err);

        else
            done(null, seller_id)
    })
};

exports.checkValidBid = function(amount, id, done){
    let currentTime = Date.now();

    db.get_pool().query('SELECT MAX(bid_amount) AS maxBid, bid_datetime AS bidDate FROM bid WHERE bid_auctionid = ?',
        [id],
        function(err, result) {
            if (err) return done(err);
            else{
                //&& currentTime < result[0].bidDate
                if (result[0].maxBid === null || result[0].bidDate === null || amount > result[0].maxBid && amount > 0 && amount !== undefined){
                    // console.log("Is valid");
                    return done(null, true) //valid bid
                } else {
                    // console.log("Bid is invalid");
                    return done(null, false) //not valid
                }
            }
        });
};

exports.insertBid = function(amount, id, userId, done){
    let date = new Date();
    let unix = date.getTime() - (date.getTimezoneOffset() * 60000);
    let currentTime = new Date(unix).toISOString().slice(0, 19).replace('T', ' ');

    db.get_pool().query('INSERT INTO bid (bid_amount, bid_auctionid, bid_userid, bid_datetime) VALUES (?)',
        [[amount, id, userId, currentTime]],
        function(err, result) {
            if (err) {
                return done(err);
            }
            return done(err, result.insertId);
        });
};

exports.editAuction = function(id, user_data, done) {
    // console.log("edit auction calling");
    let updateKeys = Object.keys(user_data);
    let queryArray = [];
    let queryString = "UPDATE auction SET ";

    for (let key of updateKeys) {

        if (key === "categoryId") queryString += ("auction_categoryid = ?, ").toLowerCase();
        if (key === "title") queryString += ("auction_title = ?, ").toLowerCase();
        if (key === "description") queryString += ("auction_description = ?, ").toLowerCase();
        if (key === "startDateTime") queryString += ("auction_startingdate = ?, ").toLowerCase();
        if (key === "endDateTime") queryString += ("auction_endingdate = ?, ").toLowerCase();
        if (key === "reservePrice") queryString += ("auction_reserveprice = ?, ").toLowerCase();
        if (key === "startingBid") queryString += ("auction_startingprice = ?, ").toLowerCase();
        queryArray.push(user_data[key]);

    }
    queryString = queryString.slice(0, -2); // to get rid of comma at end
    queryString += " WHERE auction_id = ?";
    queryArray.push(parseInt(id));

    db.get_pool().query(
        queryString,
        queryArray,
        function(err) {
            if (err) {
                return done(err);
            }
            return done(null);
        });
};