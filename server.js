const db  = require('./config/db'),
    express = require('./config/express');

const app = express();

// Connect to MySql on start
db.connect(function(err) {
    if (err) {
        console.log('Unable to connect to MySql.');
        process.exit(1);
    } else {
        app.listen(4941, function() {
            console.log('Listening on port: ' + 4941);
        });
    }
});