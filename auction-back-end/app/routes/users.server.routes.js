const  users  =  require ( '../controllers/users.server.controllers' );
const auth = require('../middleware/auth');
module.exports  =  function (app){

    app.route('/api/v1/users')
        .post(users.create_user);

    app.route('/api/v1/users/login')
        .post(users.login);

    app.route('/api/v1/users/logout')
        .post(auth.isAuthed, users.logout);

    app.route('/api/v1/users/:id')
        .get(auth.isAuthed, users.userById)
        .patch(auth.isAuthed, users.patchUserById);
};