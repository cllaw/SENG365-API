const db = require('../../config/db');
const User = require('../models/user.server.model');

exports.photoAuthenticate = function(token, done){
    db.get_pool().query('SELECT auction_id FROM auction WHERE token = ?', token, function (err, rows) {

        if (err) return done({"ERROR": "Error selecting"});
        return done(rows);
    });
};