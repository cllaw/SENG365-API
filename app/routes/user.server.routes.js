const users = require('../controllers/user.server.controller');

module.exports = function(app){

    // get all users
    app.route('/api/v1/users')
        .get(users.list)
        .post(users.create);

    // Get user by user id
    app.route('/api/v1/users/:userId')
        .get(users.read)
        .patch(users.update);

    app.route('/api/v1/users/login')
        .post(users.login);

    app.route('/api/v1/users/logout')
        .post(users.logout);
};