const database = require("../models/database.server.model");

exports.reset = function (req, res) {
    database.Reset(function (result) {
        if (!result)
            res.status(400).send("Malformed request. ");
        else
            res.status(200).send("OK");
    });
};

exports.resample = function (req, res) {
    database.Resample(function (result) {
        if (!result)
            res.status(400).send("Malformed request. ");
        else
            res.status(201).send("OK");
    });
};