const  express  =  require ( 'express' );
const  bodyParser  =  require ( 'body-parser' );

module.exports = function () {
    const app = express();
    app.use(bodyParser.json());

    require('../app/routes/db.server.routes')(app);
    require('../app/routes/users.server.routes')(app);
    require('../app/routes/photos.server.routes')(app);
    require('../app/routes/auctions.server.routes')(app);

    return app;
}