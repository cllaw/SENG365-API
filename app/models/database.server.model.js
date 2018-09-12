const db = require("../../config/db");
const fs = require("fs");

exports.Reset = function (done) {

    let sql = fs.readFileSync('database/create_database.sql').toString();

    db.get_pool().query(sql, function (err, results) {
        if (err)
            return done(false);
        else
            done(results);
    });
};

exports.Resample = function (done) {

    let sql = fs.readFileSync('database/sample_data.sql').toString();

    db.get_pool().query(sql, function (err, results) {
        if (err)
            return done(false);
        else
            done(results);
    });
};
