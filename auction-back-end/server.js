const db = require('./config/db');
const express = require('./config/express');

const app = express();

//Connect to MYSql on start
db.connect(function (err) {
    if (err){
        console.log('cannot connect to db.');
        process.exit(1);

    } else {
        app.listen(4941, function () {
            console.log('App listening with url http://127.0.0.1:4941')
        });
    }
});


