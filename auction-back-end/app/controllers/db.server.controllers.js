const  db  =  require ( '../models/db.server.models' );

exports.createDb  = function (req , res ){
    db.recreateTable (function (err) {
        if (err === 500){
            res.status(500).send('Internal server error');
        } else {
            res.status(200).send();
        }
    });

};

exports.resample  =  function ( req , res ){
    db.resampleTable (function (err) {
        if (err){
            res.status(400).send(err);
        } else {
            res.status(201).send();
        }
    });
};