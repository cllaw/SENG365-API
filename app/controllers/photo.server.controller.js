const Photos = require('../models/photo.server.model');
const User = require('../models/user.server.model');
const fs = require("fs");

exports.getPhotos = function(req, res){
    //TODO: figure out why posted photos can not be opened or retrieved. (using GET) passes automated tests though?
    // console.log(req);
    let contentType = req.get("content-type");
    let auctionId = req.params.auctionId;
    let fileType = null;

    // console.log(contentType);
    if (contentType === "image/png")
        fileType = ".png";
    else if (contentType === "image/jpeg")
        fileType = ".jpeg";
    else {
        res.sendStatus(400);
        return;
    }

    // console.log('app/Photos/' + auctionId + fileType);
    if (fileType !== null && fs.existsSync('app/Photos/' + auctionId + fileType))
        return res.status(200).sendFile('app/Photos/' + auctionId + fileType, {root: './'});
    else
        return res.sendStatus(404);
};

exports.addPhoto = function(req, res){
    let fileType = req.get("content-type");
    let auctionId = req.params.auctionId;
    let token = req.get("X-Authorization");

    // console.log(fileType);
    User.getIdOfTokens(token, function(err, result){
        if (result == undefined || result === null)
            res.sendStatus(401);
        else{
            if (fileType === "image/png") fileType = ".png";
            else if (fileType === "image/jpeg") fileType = ".jpeg";
            else {
                res.sendStatus(400);
                return;
            }
            req.pipe(fs.createWriteStream('app/Photos/' + auctionId + fileType));
            res.sendStatus(201);
        }
    })
};

exports.removePhoto = function(req, res){
    let fileType = req.get("content-type");
    let auctionId = req.params.auctionId;
    let token = req.get("X-Authorization");

    User.getIdOfTokens(token, function(err, result){
        if (result == undefined || result === null)
            res.sendStatus(401);
        else{
            if (fileType === "image/png") fileType = ".png";
            else if (fileType === "image/jpeg") fileType = ".jpeg";
            else {
                res.sendStatus(201);
                return;
            }
            fs.unlinkSync('app/Photos/' + auctionId + fileType);
            res.sendStatus(201);
        }
    })
};