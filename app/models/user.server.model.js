const db = require('../../config/db');
const crypto = require('crypto');

const getHashKey = (password, salt) => {
    return crypto.pbkdf2Sync(password, salt, 100000, 256, "sha256").toString("hex");
};

exports.getAll = function(done){
    db.get_pool().query('SELECT * FROM auction_user', function (err, rows) {

        if (err) return done({"ERROR": "Error selecting"});

        return done(rows);

    });
};

exports.getOne = function(userId, done){
    db.get_pool().query('SELECT user_username AS username, user_givenname AS givenName, user_familyname AS familyName, ' +
        'user_email AS email, user_accountbalance AS accountBalance ' +
        'FROM auction_user WHERE user_id = ?',
        userId, function (err, rows) {
        if (err)
            return done(err);
        return done(rows);
    });
};

exports.getoneUnauth = function(userId, done){
    db.get_pool().query('SELECT user_username AS username, user_givenname AS givenName, user_familyname AS familyName ' +
        'FROM auction_user WHERE user_id = ?',
        userId, function (err, rows) {
            if (err)
                return done(err);
            return done(rows);
        });
};

exports.insert = function(user, done){

    db.get_pool().query('INSERT INTO auction_user (user_username, user_givenname, user_familyname, user_email, ' +
        'user_password) VALUES (?)',
        [[user.username, user.givenName, user.familyName, user.email, user.password]],
        function(err, result) {

            if (err) return done(err);

            return done(err, result.insertId)});
};

exports.getToken = function(id, done) {
    if (id === undefined || id === null)
        return done(new Error("Unauthorized"));
    else {
        db.get_pool().query("SELECT user_token FROM auction_user WHERE user_id = ?",
            id,
            function (err, results) {
                if (results[0] === null || results[0] === undefined)
                    return done(null, null); // user not logged in

                return done(null, results[0].user_token); //user is logged in and their token is returned
            }
        )
    }
};

exports.setToken = function(id, done) {
    let token = crypto.randomBytes(16).toString('hex');
    db.get_pool().query("UPDATE auction_user SET user_token = ? WHERE user_id = ?",
        [token, id],
        function(err) {
        if (err) return done(err);
        return done(err, token)});
};

exports.getIdOfTokens = function(token, done) {
    if (token === undefined || token === null)
        return done(true, null);
    else {
        db.get_pool().query("SELECT user_id FROM auction_user WHERE user_token = ?",
            [token],
            function(err, result) {
                if (err || result.length === 0)
                    return done(err, null);
                return done(null, result[0].user_id);
            }
        )
    }
};

exports.authenticate = function(username, email, password, done) {
    db.get_pool().query("SELECT user_id, user_password FROM auction_user WHERE user_username = ? OR user_email = ? ",
        [username, email],
        function(err, results) {
        if (err) return done(err, null)
            if (err || results.length !== 1)
                return done(true); //failed
            else {
                if (results[0].user_password === password) {
                    return done(false, results[0].user_id);
                } else {
                    return done(new Error("Wrong password")); //wrong password
                }
            }
    });
};

exports.deleteToken = function(token, done){
    db.get_pool().query("UPDATE auction_user SET user_token = null WHERE user_token = ?",
        [token],
        function(err, results) {
            if (err)
                return done(err, results);
            return done(err, results);
        });
};

exports.edit = function(id, user_data, done) {
    let updateKeys = Object.keys(user_data);
    let queryArray = [];
    let queryString = "UPDATE auction_user SET ";

    for (let key of updateKeys) {
        queryArray.push(user_data[key]);
        queryString += ("user_" + key + "= ?, ").toLowerCase();
    }
    queryString = queryString.slice(0, -2); // to get rid of comma at end
    queryString += " WHERE user_id = ?";
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