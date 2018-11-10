var User = require('../models/user');
var Token = require('../models/passToken');
var Owner = require('../models/businessOwner');
var Client = require('../models/client');
var Session = require('../models/session');
var Announcement = require('../models/homeAnnouncments');
var config = require('../../config/serverConfigs');
var mailer = require('../../config/mailer');
var jwt = require ('jsonwebtoken');
var async = require('async');
var logger = require('../../config/logger');
var util = require('util');
var CustomError = require('node-custom-error');
var fs = require('fs');

var controller =
{
    isBusinessOwner: async function(req, res, next)
    {   
        try
        {
            //Wait for the retrieval of the user
            var doc = await User.getUserByID(req.decoded._id);
            if(doc.userType == 'BusinessOwner')
            {
                //If the user is a BussinessOwner
                if(req.decoded.ownerID != null)
                {
                    //Wait fot the retrieval of the owner if ownerID is not null
                    var owner = await Owner.findById(req.decoded.ownerID);

                    if(owner)
                        //If owner is found, proceed to the next function
                        next();
                    else
                        //IF the owner is not found, send a message stating it
                        res.json({success: false, message:"Owner not found"});
                }
                else
                    //If the ownerID is null, send a message stating that a profile needs to be created first
                    res.json({success: false, message:"Create your profile first"});
            }
            else
                //If the user is not a BusinessOwner, send a maessage stating it
                res.json({success: false, message:"you are not a business"});
        }
        catch(error)
        {
            //If there was an error, display the error
            logger.debug(error);
            res.json({ success: false, message: error.message });
        }
    },
    isClient: async function(req, res, next)
    {
        try
        {
            //Wait for the retrieval of the user
            var doc = await User.getUserByID(req.decoded._id);

            if(doc.userType == 'Client')
            {
                //If the user is a Client
                if(req.decoded.ownerID != null)
                {
                    //Wait for the retrieval of the client if the ownerID is not null
                    var client = await Client.findById(req.decoded.ownerID);

                    if(client)
                        //If the client is found, proceed to the next function
                        next();
                    else
                        //If the client was not found, send a message stating it
                        res.json({success: false, message:"Client not found"});
                }
                else
                    //If the ownerID is null, send a message stating that a profile needa to be created first
                    res.json({success: false, message:"Create your profile first"});
            }
            else
                //If the client is not found, send a message stating it
                res.json({success: false, message:"you are not a client"});
        }
        catch(error)
        {
            //If there was an error, display the error
            logger.debug(error);
            res.json({ success: false, message: error.message });
        }
    },
    isAdmin: async function(req, res, next)
    {
        try
        {   //Wait for the retrieval of the user
            var doc = await User.getUserByID(req.decoded._id);

            if(doc.userType == 'Admin')
                //If the user is an admin, proceed to the next function
                next();
            else
                //If the user is not an admin, send a message stating it
                res.json({success: false, message:"you are not a admin"});
        }
        catch(error)
        {
            //If there was an error, display the error
            logger.debug(error);
            res.json({ success: false, message: error.message });
        }
    },
    isApproved: async function(req, res, next)
    {
        //Check if the business is approved
        var approved = Owner.isApproved(req.decoded.ownerID);

        if(approved)
            //If the business is approved, proceed to the next funtion
            next();
        else
            //If the business is not yet approved, send a message stating it
            res.json({success: false, message:"you are not approved"});
    },
    isFolderOwner: async function(req, res, next)
    {
        //Check if the user has access rights to the folder
        if(req.decoded._id != req.params.id)
        {
            //If the user does not have access rights, send message stating it and end the function
            res.json({success: false, message:"You do not have access rights"});
            res.end();
        }
    },
    fileRequest: async function(req, res)
    {
        fs.stat(appRoot + req.originalUrl, function(err, stat) 
        {
            if(err == null) 
                res.sendFile(appRoot + config.publicFolder + req.originalUrl)
            else 
                res.sendFile(appRoot + config.publicFolder + config.usersRoute + config.defaultPic)
        });
    },
    profileFileRequest: async function(req, res)
    {
        fs.stat(appRoot + req.originalUrl, function(err, stat) 
        {
            if(err == null) 
                res.sendFile(appRoot + config.publicFolder + req.originalUrl)
            else
                if(req.params.param1 == "ProfilePicture")
                    res.sendFile(appRoot + config.publicFolder + config.usersRoute + config.defaultProfilePic);
                else if(req.params.param1 == "CoverPhoto")
                    res.sendFile(appRoot + config.publicFolder + config.usersRoute + config.defaultCoverPhoto);
                else
                    res.sendFile(appRoot + config.publicFolder + config.usersRoute + config.defaultPic);
        });
    },
    ownerFileRequest: async function(req, res)
    {
        fs.stat(appRoot + req.originalUrl, function(err, stat) 
        {
            if(err == null) 
                res.sendFile(appRoot + config.publicFolder + req.originalUrl)
            else
                if(req.params.param1 == "Product")
                    res.sendFile(appRoot + config.publicFolder + config.usersRoute + config.defaultProductPic);
                else if(req.params.param1 == "Session")
                    res.sendFile(appRoot + config.publicFolder + config.usersRoute + config.defaultSessionPic);
                else if(req.params.param1 == "OwnerAnnouncement")
                    res.sendFile(appRoot + config.publicFolder + config.usersRoute + config.defaultAnnouncementPic);
                else
                    res.sendFile(appRoot + config.publicFolder + config.usersRoute + config.defaultPic)

        });
    }
}
module.exports = controller;
