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
var io = require('socket.io');

var controller =
{
    searchBusinesses: async function(req,res)//search
    {
        //Check that the body is not empty
        req.checkBody('body', 'No query provided').notEmpty();

        //Wait for validation result
        var result = await req.getValidationResult()
        if (!result.isEmpty())
            //If there are validation errors, display the errors
            res.json({ success: false, message: " " + util.inspect(result.array()[0].msg)});
        else
        {
            //If there are no validation errors
            try
            {
                //Wait for the retrieval of the owner with the given name
                var businesses = await Owner.find({organizationName: req.body.search}).exec()

                //Send a message stating that the search results are being loaded alongside the businesses list
                res.json({success: true, message:'Loading search results', businessesList : businesses});
            }
            catch(error)
            {
                //If there was an error, display the error
                logger.debug(error);
                res.json({ success: false, message: error.message });
            }
        }
    }
}
module.exports = controller;
