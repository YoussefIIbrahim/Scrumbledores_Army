var logger = require('../../config/logger');
var util = require('util')
var serverConfig = require('../../config/serverConfigs')
var fs = require('fs-promise');
var pify = require('pify');
var Client = require('../models/client');
var User = require('../models/user');
var mmm = require('mmmagic');
var Magic = mmm.Magic;
var magic = new Magic(mmm.MAGIC_MIME_TYPE);

var controller =
{
    uploadPicture: async function(req, res)
    {
        //Check that the picType is not empty and is a validPicType
        req.checkBody('picType', 'invalid picture type').notEmpty().isValidPicType();

        //Wait for validation result
        var result = await req.getValidationResult()

        if (!result.isEmpty())
            //If there are validation errors, display the errors
            res.json({ success: false, message: " " + util.inspect(result.array()[0].msg)});
        else
        {
            //If there are no validation errors
            if(req.files && req.files.file)
            {
                magic.detect(req.files.file.data, function(err, presult) 
                {
                    if(err)
                        res.json({ success: false, message: "Can not upload file"});
                    else if(serverConfig.allowedPicTypes.includes(presult))
                    {

                        //If there files being uploaded, check the picType
                        if((req.body.picType == 'ProfilePicture') || (req.body.picType == 'CoverPhoto'))
                        {
                            //If the picType is either ProfilePicture or CoverPhoto, upload the picture in the user's folder
                            var path = serverConfig.usersFolder + req.decoded._id + "/" + req.body.picType;
                            req.files.file.mv(path, function(err)
                            {
                                if (err)
                                    //If there was a problem in the uploading of the picture, send a message stating it
                                    res.json({ success: false, message: "Can not upload file"});
                                else
                                    //If the uploading of the picture was successful, send a message stating it
                                    res.json({success: true, message:'file uploaded successfully'});
                            });
                        }
                        else
                            //If another picType was provided other than ProfilePicture or CoverPhoto, send a message stating that these 2 types are the only types possible to upload
                            res.json({ success: false, message: "You can only upload a cover photo or a profile picture"});
                    }
                    else
                        res.json({ success: false, message: "File type not allowed"});
                });
            }
            else
            {
                //If there are no files uploaded
                if(!req.body.hasOwnProperty('canUpload'))
                    //Send a message stating that a file needs to be uploaded
                    res.json({ success: false, message: "Please upload a file"});
            }
        }
    },
    uploadMiscPicture: async function(req, res)
    {
        //Chek that the picType is not empty and is a validPicType
        req.checkBody('picType', 'invalid picture type').notEmpty().isValidPicType();

        //Wait for validation result
        var result = await req.getValidationResult()

        if (!result.isEmpty())
            //If there are validation errors, display the errors
            res.json({ success: false, message: " " + util.inspect(result.array()[0].msg)});
        else
        {
            //If there are no validation errors
            if(req.files && req.files.file)
            {
                magic.detect(req.files.file.data, function(err, presult) 
                {
                    if(err)
                        res.json({ success: false, message: "Can not upload file"});
                    else if(serverConfig.allowedPicTypes.includes(presult))
                    {
                        if((req.body.picType == 'Product') || (req.body.picType == 'Session') || (req.body.picType == 'Announcement') || (req.body.picType == 'OwnerAnnouncement'))
                        {
                            //Check if the owner can upload
                            if(req.body.canUpload)
                            {
                                //Intialize path variable and set it according to the picType, and then upload the picture in the respective folder
                                var path;
                                if(req.body.picType == 'Product')
                                    path = serverConfig.usersFolder + req.decoded._id + "/" + req.body.picType + "/" + req.body.retrievedProductID;
                                else if (req.body.picType == 'Session')
                                    path = serverConfig.usersFolder + req.decoded._id + "/" + req.body.picType + "/" + req.body.retrievedSessionID;
                                else if (req.body.picType == 'OwnerAnnouncement')
                                    path = serverConfig.usersFolder + req.decoded._id + "/" + req.body.picType + "/" + req.body.retrievedOwnerAnnouncementID;
                                else if (req.body.picType == 'Announcement')
                                    if(req.body.adminUpload)
                                        path = serverConfig.announcementsFolder + "/" + req.body.retrievedAnnouncementID;
                                    else
                                        return;
                                req.files.file.mv(path, function(err)
                                {
                                    if (err)
                                        //If there was an error, display the error
                                        logger.debug(err)
                                });
                            }
                        }
                    }

                })
                //If the picType is either ProfilePicture or CoverPhoto, upload the picture in the owner's folder
            }
        }
    },
    uploadDoc : async function(req, res)
    {
        //Check that the fileName is not empty with length between 3 and 50
        req.checkBody('fileName', 'Invalid file name').notEmpty().len(3,50);

        //Check that the docType is not empty and isProgram
        req.checkBody('docType', 'Invalid document type').notEmpty().isProgram();

        //Check that the client is not empty
        req.checkBody('client', 'Invalid client ID').notEmpty();

        //Wait for validation result
        var result = await req.getValidationResult()

        if (!result.isEmpty())
            //If there are validation errors, display the errors
            return res.json(("Validation errors:" + util.inspect(result.array())));
        else
        {
            try
            {
                //Wait for the retrieval of the user
                var user = await User.getUserByUserame(req.body.client)

                if(user && user.userType == 'Client')
                {
                    //If the user is a valid client
                    var client = await Client.findById(user.ownerID);
                    if(!client)
                        //If the client is not found, send a message stating it
                        res.json({ success: false, message: "Client not found"});
                    else
                    {
                        //If the client is found, modify the name
                        var name = (req.body.fileName).replace(/\s+/g, '');

                        //Configure the folder path
                        var path = serverConfig.usersFolder + user._id + "/" + req.body.docType + "/" + name;

                        if(req.files && req.files.file)
                        {
                            magic.detect(req.files.file.data, function(err, presult) 
                            {
                                if(err)
                                    res.json({ success: false, message: "Can not upload file"});
                                else if(serverConfig.allowedDocTypes.includes(presult))
                                {
                                    //If there are files, write the file into the path
                                    req.files.file.mv(path, function(err)
                                    {
                                        if (err)
                                        {
                                            //If there was an error, display the error
                                            logger.debug(err)
                                            res.json({ success: false, message: "Can not upload file"});
                                        }
                                        else
                                            //If the file uploading was successful send a message stating it
                                            res.json({success: true, message:'file uploaded successfully'});
                                    });
                                }
                                else
                                    res.json({ success: false, message: "File type not allowed"});
                            })
                        }
                        else
                            //If no file was uploaded, send a message statin ghtat a file needs to be uploaded
                            res.json({ success: false, message: "Please upload a file"});
                    }
                }
                else
                {
                    //If the user was not found, send a mesage stating it
                    res.json({ success: false, message: "User not found"});
                }
            }
            catch(error)
            {
                //If there was an error, display the error
                logger.debug(error);
                res.json({ success: false, message: error.message});
            }
        }
    }
}
module.exports = controller;
