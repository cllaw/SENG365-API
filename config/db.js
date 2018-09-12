const mysql = require('mysql');

let state = {
    pool: null
};

exports.connect = function(done) {
    state.pool = mysql.createPool({
        host: 'mysql3.csse.canterbury.ac.nz',
        user: 'cll62',
        password: "81677469",
        database: "cll62",
        multipleStatements: true
    });
    done();
};

exports.get_pool = function() {
    return state.pool;
};