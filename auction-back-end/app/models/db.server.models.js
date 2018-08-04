const  db  =  require ( '../../config/db' ),
fs = require('fs');

exports.recreateTable  = function (done){
    let sqlString = fs.readFileSync('./app/models/create_database.sql', 'utf8').toString();

    db.get_pool().query(sqlString, function (err) {
        if(err) {
            return done(err);
        }

        fs.readdir('./upload/', function (err, files) {
            if (err){
                done(500)

            } else {
                files.forEach(function (file) {
                    if(file !== 'default.png'){
                        fs.unlink('./upload/' + file, function (err) {
                            if(err) {
                                done(500);
                            }
                        });
                    }
                });
                done(null);
            }
        });
    });
};

exports.resampleTable = function (done) {
    let sqlString = fs.readFileSync('./app/models/load_data.sql', 'utf8').toString();

    db.get_pool().query(sqlString, function (err) {
        done(err);
    });

};