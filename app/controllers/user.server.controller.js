const User = require('../models/user.server.model');
const validator = require("email-validator");

exports.list = function(req, res){
    User.getAll(function(result){
        res.status(200).json(result);
    });
};

exports.create = function(req, res){
    let user_data = Object.assign({}, req.body);

    if (!validator.validate(user_data.email) || user_data.password === "") {
        return res.sendStatus(400); // malformed request
    }

    User.insert(user_data, function(err, id){
        if (err){
            return res.sendStatus(400); // malformed request
        }
        res.status(201).json({id:id});
    })
};

exports.read = function(req, res){
    let id = req.params.userId;
    let token = req.get('X-Authorization');
    User.getToken(id, function(err, usertoken){
        if(usertoken === token) {
            User.getOne(id, function (result) {
                // console.log("Authenticated");
                // console.log(result[0]);
                if (result.length === 0) // no users
                    return res.sendStatus(404);

                return res.status(200).json(result[0]);
            });

        } else {
            // console.log("Unauthenticated");
            User.getOne(id, function(result){
                // console.log(result[0]);
                if (result.length === 0) // no users
                    return res.sendStatus(404);
                return res.status(401).json(result[0]);
            });
        }
    })
};

exports.login = function(req, res){
    let username = '', email = '';
    let password = '';

    if (req.query.hasOwnProperty('username')) username = req.query.username;
    if (req.query.hasOwnProperty('email')) email = req.query.email;
    if (req.query.hasOwnProperty('password')) password = req.query.password;

    User.authenticate(username, email, password, function(err, id) {
        if (err) {
            res.status(400).send('Invalid username/email/password supplied');
        } else {
            User.getToken(id, function (err, token) {
                if (token) return res.status(200).json({id: id, token: token}); //logged in already
                else {
                    User.setToken(id, function (err, token) { //generates one if user is not logged in
                        res.status(200).json({id: id, token: token})
                    });
                }
            })
        }
    })
};

exports.logout = function(req, res){
    let token = req.get('X-Authorization');
    User.getIdOfTokens(token, function(err, result){
        if (result == undefined || result === null)
            res.sendStatus(401);
        else {
            User.deleteToken(token, function() {
                res.sendStatus(200);
            })
        }
    })
};

exports.update = function(req, res){
    let token = req.get('X-Authorization');
    let id = req.params.userId;
    let user_data = Object.assign({}, req.body);

    User.getToken(id, function(err, result) {
        if (result === token) {
            User.edit(id, user_data, function (err) {
                if (err) {
                    return res.sendStatus(400);
                }
                res.status(201).send("OK");
            })
        } else {
            res.status(401).send("Unauthorized");
        }
    })
};