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

var controller =
{
    adminAddAnnouncement: async function(req, res, next)//admin
    {
        //Prevent picture upload until the actual announcement is posted
        req.body.canUpload = false;

        //Check that announcement body is not empty
        req.checkBody('body', 'No body provided').notEmpty();

        //Wait for validation result
        var result = await req.getValidationResult()

        if (!result.isEmpty()) 
                //If there are validation errors, display the errors
                res.json({ success: false, message: " " + util.inspect(result.array()[0].msg)});
        else
        {
            //If there are no validation errors, create the announcement
            let announcement = new Announcement
            ({
                body: req.body.body,
                date: Date.now()
            });
            try
            {
                //Wait for the addition of the announcement
                var output = await announcement.addAnnouncement();

                if(!output)
                    //If there was no announcement addded, send a message stating the failure of the announcement addition
                    res.json({success: false, message: "announcement was not added"});
                else
                {
                    //If the announcement was added successfully, send a message stating it alongside the announcemet itself
                    res.json({success: true, message: 'announcement added successfully', announcement: output});

                    //Allow the upload of the announcement picture
                    req.body.canUpload = true;

                    //Let the retirevedAnnouncementID used in the picture uploading be equal to the _id of the output
                    req.body.retrievedAnnouncementID = output._id;

                    //Set the picture type to Annuoncement
                    req.body.picType = 'Announcement';

                    //Check that the uploader of the picture is an admin
                    req.body.adminUpload = true;

                    //Call the next function, in this case "uploadMiscPicture" to upload the announcement picture
                    next();
                }
            }
            catch(error)
            {
                //If there was an error, display the error
                logger.debug(error);
                res.json({ success: false, message: error.message });
            }
        }
    },
    adminRetrieveAnnouncements: async function(req, res)//admin
    {
        //Wait for the announcements retrieval
        var output = await Announcement.find({}).exec()

        try
        {
            if(!output)
                //If there was no announcement found, send a message stating it
                res.json({success: false, message: 'no announcements found'});
            else
                //If there were announcements, send a message stating it alongside the announcements themselves
                res.json({success: true, message: "Loading your announcements..", announcements: output});
        }
        catch(error)
        {
            //If there was an error, display the error
            logger.debug(error);
            res.json({ success: false, message: error.message });
        }
    },
    adminRemoveAnnouncement: async function(req, res)//admin
    {
        //Take the announcementID from the query and add it to the body
        req.body.announcementID = req.query.announcementID;
            
        //Check that the announcementID is not empty and is a mongoID
        req.checkBody('announcementID', 'No announcement ID').notEmpty().isMongoId();

        //Wait for the validation result
        var result = await req.getValidationResult()

        if (!result.isEmpty()) 
            //If there are validation errors, display the errors
            res.json({ success: false, message: " " + util.inspect(result.array()[0].msg)});
        else
        {
            //If there are no validation errors, wait for the removal of the announcement
            var output = await Announcement.remove({_id: req.body.announcementID}).exec();
            try
            {
                if(output.result.n < 1)
                    //If the number of affected elements was 0, send a message stating that the announcement could not be deleted
                    res.json({success: false, message:"could not delete announcement"});
                else
                    //If the number of affected items is more than 0, send a message stating that the announcement was deleted successfully
                    res.json({success: true, message:"Announcement deleted successfully!"});
            }
            catch(error)
            {
                //If there was an error, display the error
                logger.debug(error);
                res.json({ success: false, message: error.message });
            }   
        }
    },
    approveOwner: async function(req,res) //admin
    {
        //Check that the ID is not empty and is a mongoID
        req.checkBody('ID', 'No owner ID').notEmpty().isMongoId();

        //Wait for validation result
        var result = await req.getValidationResult()

        if (!result.isEmpty()) 
            //If there are validation errors, display the errors
            res.json({ success: false, message: " " + util.inspect(result.array()[0].msg)});
        else
        {
            try
            {
                //If there are no validation errors, wait for owner updating
                var output = await Owner.findByIdAndUpdate(req.body.ID,{approved: true}).exec()

                if(!output)
                    //If there were no owners found, send a message stating it
                    res.json({ success: false, message: 'Could not find owner'});
                else
                    //If the owner was found and updated successfully, send a message stating it
                    res.json({ success: true, message: 'Owner approved successfully'});
            }
            catch(error)
            {
                //If there was an error, display the error
                logger.debug(error);
                res.json({ success: false, message: error.message });
            }   
        }
    },
    adminRemoveOwner: async function(req,res)//admin
    {
        //Take the ownerID from the query and add it to the body
        req.body.ownerID = req.query.ownerID

        //Check that the ownerID is not empty and is a mongoID
        req.checkBody('ownerID', 'No owner ID').notEmpty().isMongoId();

        //Wait for validation result
        var result = await req.getValidationResult()

        if (!result.isEmpty()) 
            //If there are validation errors, display the errors
            res.json({ success: false, message: " " + util.inspect(result.array()[0].msg)});
        else
        {
            try
            {
                //If there are no validation errors, wait for the removal of the owner
                var output = await Owner.removeOwnerByID(req.body.ownerID);

                if(!output)
                    //If no owner was found, send a message stating it
                    res.json({success: false, message:"Could not find owner"});
                else
                    //If the owner was fuond and removed successfully, send a message stating it
                    res.json({success: true, message:"Owner removed successfully"});
            }
            catch(error)
            {
                //If there was an error, display the error
                logger.debug(error);
                res.json({ success: false, message: error.message });
            }   
        }
       
    },
    addBalance: async function(req,res)
    {
        //Check that the username is not empty and is a mongoID
        req.checkBody('username', 'No owner ID').notEmpty();

        //Check that the amount is not empty and is a decimal
        req.checkBody('amount','no amount provided').notEmpty().isDecimal();

        //Wait for validation result
        var result = await req.getValidationResult()
        if (!result.isEmpty()) 
            //If there are validation errors, display the errors
            res.json({ success: false, message: " " + util.inspect(result.array()[0].msg)});
        else
        {
            try
            {
                var account = await User.getUserByUserame(req.body.username);
                if(user)
                {
                     //If there are no validation errors, asign the model variable according to the userType
                        if(account.userType == "Admin")
                            res.json({ success: false, message: "Can't add balance to an admin"});
                        else if(!account.ownerID)
                            res.json({ success: false, message: "User did not create his profile"});
                        else
                        {
                            var model = account.userType == 'Client' ? Client: Owner;
                            //Find the user in their respective models by their ownerID
                            var user = model.findById(account.ownerID).exec()
                            if(user)
                            {
                                //If the user is found
                                //Wait for the addition to the wallet
                                var wallet = await model.addToWallet(user._id, req.body.amount);

                                if(!wallet)
                                    //If no wallet was found, send a message stating it
                                    res.json({ success: false, message: "Could not find wallet"});
                                else
                                    //If the funds were added successfully, sed a message stating it
                                    res.json({ success: true, message: "funds added successfully"});
                            }
                            else
                                //If the user is not found, send a message stating it
                                res.json({ success: false, message: "Could not find user"});
                        }
                }
                else
                    res.json({ success: false, message: "Could not find user"});
               
            }
            catch(error)
            {
                //If there was an error, display the error
                res.json({ success: false, message: error.message});
            }
        }

    },
    viewAllOwners: async function(req,res)
    {
        try
        {
            //Wait for the retrieval of the owners
            var owners = await Owner.find({}).select('-notifications -announcements -products').exec();

            //Send message stating that the businesses are being loaded alongside the businesses themselves
            res.json({success: true, message:'Loading businesses',business : owners});
        }
        catch(error)
        {
            //If there was an error, display the error
            logger.debug(error);
            res.json({ success: false, message: error.message });
        }
    }
}
module.exports = controller;
