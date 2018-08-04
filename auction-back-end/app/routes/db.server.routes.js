const  db  =  require ( '../controllers/db.server.controllers' );
module.exports  =  function (app){

    app.route('/api/v1/reset')
        .post(db.createDb);

    app.route('/api/v1/resample')
        .post(db.resample);
};