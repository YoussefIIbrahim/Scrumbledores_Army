var User = require('../models/user');
var Token = require('../models/passToken');
var Owner = require('../models/businessOwner');
var Client = require('../models/client');
var Session = require('../models/session');
var Announcement = require('../models/homeAnnouncments');
var Membership = require('../models/membership');
var config = require('../../config/serverConfigs');
var mailer = require('../../config/mailer');
var jwt = require ('jsonwebtoken');
var async = require('async');
var logger = require('../../config/logger');
var util = require('util');
var CustomError = require('node-custom-error');
var Order = require('../models/order')

var controller =
{
    retrieveProducts:async function(req, res) //owner
    {
        //Set the ownerID variable to the ownerID from the token
        var ownerID = req.decoded.ownerID;
        try
        {
            //Wait for the owner retrieval
            var owner = await Owner.findById(ownerID).exec();
            if(!owner)
                //If no owner was found, send a message stating it
                res.json({ success: false, message: 'No owner was found' });
            else
            {
                //If an owner was found, let products be equal to the owner's products
                let products = owner.products;

                //Send a message stating that the products are being loaded alongside the products themselves
                res.json({ success: true, message: 'Loading products..', productsList: products });
            }
        }
        catch(error)
        {
            //If there was an error, display the error
            logger.debug(error);
            res.json({ success: false, message: error.message });
        }
    },
    addProducts:async function(req, res, next)//owner
    {
        //Prevent product picture upload until the actual product is added
        req.body.canUpload = false;

        //Set the ownerID to the ownerID from the token
        var ownerID = req.decoded.ownerID;

        //Check that the productName is not empty with a length between 3 and 20
        req.checkBody('productName', 'Invalid product name').notEmpty().len(3,20);

        //Check that the productID is not empty
        req.checkBody('productID', 'No ID Provided').notEmpty();

        //Check that the qunatity is not empty and is an integer
        req.checkBody('quantity', 'Invalid quantity').notEmpty().isInt({min:1});

        //Check that the price is not empty and is a decimal
        req.checkBody('price', 'Invalid price').notEmpty().isDecimal();

        //Wait for validation result
        var result = await req.getValidationResult();

        if (!result.isEmpty())
            //If there are validation errors, display the errors
            res.json({ success: false, message: " " + util.inspect(result.array()[0].msg)});
        else
        {
            //If there are no validation errors
            try
            {
                //Wait for the retrieval of the owner
                var owner = await Owner.findById(ownerID);

                if(!owner)
                    //If the owner was not found, send a message stating it
                   res.json({success: false, message:"could not find owner"});
                else
                {
                    //If the owner was found, create the product
                    let product =
                    {
                        productID: req.body.productID,
                        productName: req.body.productName,
                        quantity: req.body.quantity,
                        price: req.body.price
                    };
                    try
                    {
                        //Wait for the addition of the product
                        var updated = await Owner.addProduct(owner._id, product);

                        if(!updated)
                            //If there was a problem in the addition of the product, send a message stating it
                            res.json({ success: false, message: 'Could not add product'});
                        else
                        {
                            //If the addition of the product was successful, send a message stating it alongside the product
                            res.json({ success: true, message: 'product added successfully!', product: product});

                            //Allow the upload of the product picture
                            req.body.canUpload = true;

                            //Let the retirevedProductID used in the picture uploading be equal to the _id of the product added
                            req.body.retrievedProductID = req.body.productID;

                            //Set the picture type to Product
                            req.body.picType = "Product"

                            //Call the next function, in this case "uploadMiscPicture" to upload the product picture
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
            }
            catch(error)
            {
                //If there was an error, display the error
                logger.debug(error);
                res.json({ success: false, message: error.message });
            }
        }

    },
    editProducts:async function(req, res, next)//owner
    {
        //Prevent product picture upload until the actual product is edited
        req.body.canUpload = false;

        //Set the ownerID to the ownerID from the token
        var ownerID = req.decoded.ownerID;

        //Check that name is not empty
        req.checkBody('productName', 'Invalid product name').notEmpty().len(3,20);

        //Check that the productID is not empty
        req.checkBody('productID', 'No ID Provided').notEmpty().isMongoId();

        //Check that the quantity is not empty and is an integer
        req.checkBody('quantity', 'Invalid quantity').notEmpty().isInt({min:0});

        //Check that the price is not empty and is an integer
        req.checkBody('price', 'Invalid price').notEmpty().isInt();

        //Wait for validation result
        var result = await req.getValidationResult();

        if (!result.isEmpty())
            //If there are validation errors, display the errors
            res.json({ success: false, message: " " + util.inspect(result.array()[0].msg)});
        else
        {
            //If there are no vaidation errors
            try
            {
                //Wait for the retrieval of the owner
                var owner = await Owner.findById(ownerID).exec();

                //Create the product
                let product =
                {
                    productID: req.body.productID,
                    productName: req.body.productName,
                    quantity: req.body.quantity,
                    price: req.body.price
                };
                try
                {
                    //Wait for the updating of the product
                    var updated = await Owner.updateProduct(owner._id, product);

                    if(!updated)
                        //If there was a problem with the updating of the product, send a message stating it
                        res.json({ success: false, message: 'Could not find product'});
                    else
                    {
                        //If the updating of the product was successful, send a message stating it alongside the product
                        res.json({ success: true, message: 'product edited successfully!', product: product});

                        //Allow the upload of the product picture
                        req.body.canUpload = true;

                        //Let the retirevedProductID used in the picture uploading be equal to the _id of the product added
                        req.body.retrievedProductID = req.body.productID;

                        //Set the picture type to Product
                        req.body.picType = "Product"

                        //Call the next function, in this case "uploadMiscPicture" to upload the product picture
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
            catch(error)
            {
                //If there was an error, display the error
                logger.debug(error);
                res.json({ success: false, message: error.message });
            }
        }

    },
    ownerAddAnnouncement:async function(req, res, next)//owner
    {
        //Prevent picture upload until the actual announcement is posted
        req.body.canUpload = false;

        //Set the ownerID variable to the ownerID from the token
        var ownerID = req.decoded.ownerID;
        //Check that the announcement is not empty
        req.checkBody('announcement', 'no announcement provided').notEmpty();
        //Wait for validation result
        var result = await req.getValidationResult();

        if (!result.isEmpty())
            //If there are validation errors, display the errors
            res.json({ success: false, message: " " + util.inspect(result.array()[0].msg)});
        else
        {
            //If there are no validation errors
            try
            {
                //Wait for the retrieval of the owner
                var owner = await Owner.findById(ownerID);

                if(!owner)
                    //If the owner was not found, send a message stating it
                    res.json({ success: false, message: 'Owner not found' });
                else
                {
                    //If the owner was found, create the announcement

                    let announcement =
                    {
                        body: req.body.announcement,
                        datePosted: Date.now()
                    };
                    console.log(announcement);
                    try
                    {
                        //Wait for the addition of the announcement
                        var updated = await Owner.addAnnouncement(owner._id, announcement);

                        if(!updated)
                            //If there was no announcement addded, send a message stating the failure of the announcement addition
                            res.json({ success: false, message: 'Announcement could not be added'});
                        else
                        {
                            //If the announcement was added successfully, Send a message stating it alongside the announcemet itself
                            res.json({ success: true, message: 'Announcement added successfully!', announcement: announcement});

                            //Allow the upload of the announcement picture
                            req.body.canUpload = true;

                            //Let the retirevedOwnerAnnouncementID used in the picture uploading be equal to the _id of the updated
                            req.body.retrievedOwnerAnnouncementID = updated._id;

                            //Set the picture type to OwnerAnnuoncement
                            req.body.picType = 'OwnerAnnouncement';

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
            }
            catch(error)
            {
                //If there was an error, display the error
                logger.debug(error);
                res.json({ success: false, message: error.message });
            }
        }
    },
    ownerRetrieveAnnouncements:async function(req,res)//owner
    {
        //Set the ownerID variable to the ownerID in the token
        var ownerID = req.decoded.ownerID;
        try
        {
            //Wait for the retrieval of the owner
            var owner = await Owner.findById(ownerID).exec();

            if(!owner)
                //If the owner was not found, send a message stating it
                res.json({ success: false, message: 'Owner not found' });
            else
            {
                //If the owner was found, let announcements be equal to the owner announcements
                let announcements = owner.announcements;

                //Send a message stating that the announcements are being loaded alongside the announcements themselves
                res.json({ success: true, message: 'Loading announcements..', announcements: announcements });
            }
        }
        catch(error)
        {
            //If there was an error, display the error
            logger.debug(error);
            res.json({ success: false, message: error.message });
        }
    },
    addSession:async function(req, res, next) //owner
    {
        //Prevent picture upload until the actual session is added
        req.body.canUpload = false;

        //Check that the title is not empty with a length between 3 and 20
        req.checkBody('title', 'Invalid Title').notEmpty().len(3,20);

        //Check that the timing is not empty and is a date
        req.checkBody('timing', 'Invalid Timing').notEmpty().isDate();

        //Check that the maxNumber is not empty and is an integer
        req.checkBody('maxNumber', 'Invalid Number').notEmpty().isInt();

        //Check that the description is not empty waith a length between 3 and 20
        req.checkBody('description', 'Invalid Description').notEmpty().len(3,20);

        //Check that the admssionFee is not empty and in an integer
        req.checkBody('admissionFee', 'Invalid admission fee').notEmpty().isInt();

        //Wait for validation result
        var result = await req.getValidationResult();

        if (!result.isEmpty())
            //If there are validation errors, display the errors
            res.json({ success: false, message: " " + util.inspect(result.array()[0].msg)});
        else
        {
            //If there are no validation errors, set the ownerID variable to the ownerID in the token
            var ownerID = req.decoded.ownerID;

            //Create the session
            let sessionAdded = new Session(
            {
                businessID: ownerID,
                title: req.body.title,
                timing: req.body.timing,
                description: req.body.description,
                maxNumber: req.body.maxNumber,
                admissionFee: req.body.admissionFee,
                clients: []
            });

            try
            {
                //Wait for the addition of the session
                var session = await sessionAdded.addSession();

                if(!session)
                    //If there was a problem with the addition of the session, send a message stating it
                    res.json({ success: false, message: 'Could not create session' });
                else
                {
                    //If the session wasusccessfully added, send a message stating it alongside the session
                    res.json({ success: true, message: 'Session created successfully',session:session});

                    //Allow the upload of the session picture
                    req.body.canUpload = true;

                    //Let the retirevedSessionID used in the picture uploading be equal to the _id of the session
                    req.body.retrievedSessionID = session._id;

                    //Set the picture type to Session
                    req.body.picType = "Session"

                    //Call the next function, in this case "uploadMiscPicture" to upload the announcement picture
                    next()
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
    removeSession:async function(req, res)//owner
    {
        //Set the sessionID to the sessionID passed in the query
        req.body.sessionID = req.query.sessionID;

        //Check that the sesionID is not empty and is a mongoID
        req.checkBody('sessionID', 'Invalid SessionID').notEmpty().isMongoId()

        //Wait for validation result
        var result = await req.getValidationResult();

        if (!result.isEmpty())
            //If there are validation errors, display the errors
            res.json({ success: false, message: " " + util.inspect(result.array()[0].msg)});
        else
        {
            //If there are no validation errors
            try
            {
                //Set the ownerID variable to the ownerID from the token
                var ownerID = req.decoded.ownerID;

                //Wait for the deletion of the session
                var session = await Owner.deleteSessionBySessionID(ownerID, req.body.sessionID);

                if(!session)
                    //If there was a problem with the removal of the session, send a message stating it
                    res.json({ success: false, message: 'Could not delete session' });
                else
                    //If the removal of the sesion was successful, send a message stating it alongside the updated sessions
                    res.json({ success: true, message: 'session deleted successfully!', updated: session});
            }
            catch(error)
            {
                //If there was an error, display the error
                logger.debug(error);
                res.json({ success: false, message: error.message });
            }
        }
    },
    retrieveSessions:async function(req, res)//owner
    {
        //Set the ownerID variable to the ownerID from the token
        var ownerID = req.decoded.ownerID;
        try
        {
            //Wait for the retrieval of the owner
            var owner = await Owner.findById(ownerID).exec()

            if(!owner)
                //If the owner was not found, send a message stating it
                res.json({ success: false, message: 'Owner not found' });
            else
            {
                //If the owner was found, create an empty sessions array
                var sessions = []

                //For each session provided by the owner
                async.forEach(owner.sessions, function (session, callback)
                {
                    logger.debug(session);
                    //Find the session
                    Session.findById(session, (err, ses) =>
                    {
                        if(!err && ses)
                            //If there were no errors, push the session to the session array created previously
                            sessions.push(ses);
                        callback();
                    })
                }, function(err)
                {
                    //If the loading of the session was successful, send a message stating it alongside the sessions themselves
                    res.json({ success: true, message: 'Loading sessions..', sessions: sessions });
                });
            }
        }
        catch(error)
        {
            //If there was an error, display the error
            logger.debug(error);
            res.json({ success: false, message: error.message });
        }
    },
    ownerRemoveAnnouncement:async function(req, res)//owner
    {
        //Set the ownerID variable to the ownerID in the token
        var ownerID = req.decoded.ownerID;

        //Set the announcementID to the announcementID from the query
        req.body.announcementID = req.query.announcementID;
        try
        {
            //Wait for the retrieval of the owner
            var owner = await Owner.findById(ownerID).exec();

            if(!owner)
                //If no owner was found, send a message stating it
                res.json({ success: false, message: 'Owner not found' });
            else
            {
                //If owner is found
                logger.debug(owner);

                //Set the variable len to the length of the owner's announcements
                var len = owner.announcements.length;
                try
                {
                    //Wait for the announcement deletion
                    var updated = await Owner.deleteAnnouncementByID(ownerID, req.body.announcementID)
                    {
                        if(!updated)
                            //If there was a problem with the announcement removal, send a message stating it
                            res.json({ success: false, message: 'Announcement could not be deleted'});
                        else
                        {
                            if(len != updated.announcements.length)
                                //If the announcement was removed successfully, send a message stating it alongside the updated announcements
                                res.json({ success: true, message: 'announcement deleted successfully!', updated: updated});
                            else
                                //If announcement was not found, send a message stating it
                                res.json({ success: false, message: 'please select a valid announcement'});
                        }
                    }
                }
                catch(error)
                {
                    //If there was an error, display the error
                    logger.debug(error);
                    res.json({ success: false, message: error.message });
                }
            }

        }
        catch(error)
        {
            //If there was an error, display the error
            logger.debug(error);
            res.json({ success: false, message: error.message });
        }
    },
    removeProduct:async function(req, res)//owner
    {
        //Set the productID to the productID from the query
        req.body.productID = req.query.productID;

        //Check that the productID is not empty
        req.checkBody('productID', 'Invalid Product ID').notEmpty();

        //Wait for validation result
        var result = await req.getValidationResult();

        if (!result.isEmpty())
            //If there are validation errors, display the errors
            res.json({ success: false, message: " " + util.inspect(result.array()[0].msg)});
        else
        {
            //If there are no validation errors
            try
            {
                //Set the ownerID variable to the ownerID in the token
                var ownerID = req.decoded.ownerID;

                //Wait for the owner retrieval
                var owner = await Owner.findById(ownerID).exec()

                if(!owner)
                    //If the owner was not found, send a message stating it
                    res.json({ success: false, message: 'Owner not found' });
                else
                {
                    //If the owner was found, set the len variable to the length of the owners products
                    var len = owner.products.length;
                    try
                    {
                        //Wait for the deletion of the product

                        var updated = await Owner.deleteProductByID(ownerID, req.body.productID);

                        if(!updated)
                            //If there is a problem with the product deletion, send a message stating it
                            res.json({ success: false, message: 'product could not be deleted'});
                        else
                            //If the product was removed successfuly, send a message stating it
                            res.json({ success: true, message: 'product deleted successfully!'});

                    }
                    catch(error)
                    {
                      console.log("591");
                        //If there was an error, display the error
                        logger.debug(error);
                        res.json({ success: false, message: error.message });
                    }
                }
            }
            catch(error)
            {
              console.log("600");
                //If there was an error, display the error
                logger.debug(error);
                res.json({ success: false, message: error.message });
            }
        }
    },
    editSession:async function(req,res,next)
    {
        ////Prevent picture upload until the actual session is edited
        req.body.canUpload = false;

        //Check that the sessionID is not empty and is a mongoID
        req.checkBody('sessionID', 'Invalid sessionID').notEmpty().isMongoId();

        //Check that the title is not empty with a length between 3 and 10
        req.checkBody('title', 'Invalid Title').notEmpty().len(3,20);

        //Check that the timing is not empty and is a date
        req.checkBody('timing', 'Invalid Timing').notEmpty().isDate();

        //Check that the maxNumber is not empty and is an integer
        req.checkBody('maxNumber', 'Invalid Number').notEmpty().isInt();

        //Check that the description is not empty with a length between 3 and 20
        req.checkBody('description', 'Invalid Description').notEmpty().len(3,20);

        //Check that the admissionFee is not empty and is an integer
        req.checkBody('admissionFee', 'Invalid admission fee').notEmpty().isInt();

        //Wait for validation result
        var result = await req.getValidationResult();

        if (!result.isEmpty())
            //If there are validation errors, display the errors
            res.json({ success: false, message: " " + util.inspect(result.array()[0].msg)});
        else
        {
            //If there are no validation errors
            try
            {
                //Set the ownerID variable to the ownerID in the token
                var ownerID = req.decoded.ownerID;

                //Set the sessionID variable to the sessionID from the body
                var sessionID = req.body.sessionID;

                //Wait for the update of the session
                var output = await Session.findOneAndUpdate({_id:sessionID, businessID:ownerID},{title:req.body.title, timing:req.body.timing, description:req.body.description, maxNumber:req.body.maxNumber, admissionFee:req.body.admissionFee},{new: true}).exec();

                if(!output)
                    //If the session was not found, send a message stating it
                    res.json({ success: false, message: 'Could not find session' });
                else
                {
                    //For each client registered to this session
                    async.forEach(output.clients, function (client, callback)
                    {
                        //Send a notification to update the clients with the update in the session
                        var notification = Client.addNotification(client,"A session you registered to has been updated: \n" +"title: " + output.title + "\n" + "timing: " +output.timing + "\n" + "Description: " + output.description);
                        callback();
                    }, function(err)
                    {
                        if(err)
                            //If there is an error, throw an error
                            throw err;
                        else
                        {
                            //If the session was edited successfully, send a message stating it alongside the session itself
                            res.json({ success: true, message: 'session updated successfully',session: output });

                            //Allow the upload of the session picture
                            req.body.canUpload = true;

                            //Let the retirevedSessionID used in the picture uploading be equal to the sessionID
                            req.body.retrievedSessionID = sessionID;

                            //Set the picture type to Session
                            req.body.picType = "Session"

                            //Call the next function, in this case "uploadMiscPicture" to upload the session picture
                            next()
                        }
                    });
                }
            }
            catch(error)
            {
                //If there was an error, display the error
                res.json({ success: false, message: error });
            }
        }
    },
    notifications: async function(req,res)
    {
        //Set the ownerID variable to the ownerID in the token
        var ownerID = req.decoded.ownerID;

        //Wait for the retieval of owner's notifications
        var list = await Owner.findById(ownerID).select('notifications').exec();

        if(!list)
            //If no notifications were found, send a message stating it
            res.json({success: false, message: "no notifications!"});
        else
        {
            //If there are notifications found
            try
            {
                //Wait for the notifiations to be "read"
                var output = await  Owner.readNotification(ownerID);

                if(!output)
                    //If there was a problem with the reading of the notifications, send a message stating it
                    res.json({success: false, message: "no notifications!!"});
                else
                    //If the notifications were read successfully, send a message stating it alongside the notifications
                    res.json({success: true, message: "loading notifications..", notifications: list});
            }
            catch(error)
            {
                //If there was an error, display the error
                res.json({ success: false, message: error });
            }
        }
     },
     changeOrderStatus: async function(req, res)
     {
        //Check that the status is not empty and is a valid orderStatusType
        req.checkBody('status', 'Invalid order status').notEmpty().isOrderStatusType();

        //Check that the orderID is not empty and is a mongoID
        req.checkBody('orderID', 'Invalid order id').notEmpty().isMongoId();

        //Wait for validation result
        var result = await req.getValidationResult();

        if (!result.isEmpty())
            //If there are validation errors, display the errors
            res.json({ success: false, message: " " + util.inspect(result.array()[0].msg)});
        else
        {
            try
            {
                //Wait for the changing of the order status
                await Order.changeOrderStatus(req.body.orderID, req.decoded.ownerID, req.body.status);

                //Send a message stating that the changing of the order status was successful
                res.json({success: true, message: "successful"});
            }
            catch(error)
            {
                //If there was an error, display the error
                res.json({ success: false, message: error.message });
            }
        }
     },
     addMembershipOption: async function(req, res)
     {
        //Check that the cost is not empty and is a decimal with a minmum value of 0
        req.checkBody('cost', 'Invalid order status').notEmpty().isDecimal({min: 0});

        //Check that the months is not empty and is an integer with a value between 1 and 24
        req.checkBody('months', 'Invalid order id').notEmpty().isInt({min:1 , max:24});

        //Wait for validation result
        var result = await req.getValidationResult();

        if (!result.isEmpty())
            //If there are validation errors, display the errors
            res.json({ success: false, message: " " + util.inspect(result.array()[0].msg)});
        else
        {
            //If there are no validation errors
            try
            {
                //Wait for the addition of the membership option
                var added = await Owner.addMembershipOption(req.decoded.ownerID, req.body.months, req.body.cost);

                if(!added)
                    //If there was a problem with the addition of the membership option, send a message stating it
                    res.json({success: false, message: "Could not add option"});
                else
                    //If the addition of the membership option was successful, send a message stating it
                    res.json({success: true, message: "Option added"});
            }
            catch(error)
            {
                //If there was an error, display the error
                res.json({ success: false, message: error.message });
            }
        }
     },
     removeMembershipOption: async function(req, res)
     {
        //Set the optionID to the optionID from the query
        req.body.optionID = req.query.optionID;

        //Check that optionID is not empty and is a mongoID
        req.checkBody('optionID', 'Invalid order status').notEmpty().isMongoId();

        //Wait for validation result
        var result = await req.getValidationResult();

        if (!result.isEmpty())
            //If there are validation errors, display the errors
            res.json({ success: false, message: " " + util.inspect(result.array()[0].msg)});
        else
        {
            //If there are no validation errors
            try
            {
                //Wait for removal of the membership option
                var added = await Owner.removeMembershipOption(req.decoded.ownerID, req.body.optionID);

                if(!added)
                    //If there is a problem with the removal of the membership option, send a message stating it
                    res.json({success: false, message: "Could not remove option"});
                else
                    //If the membership option was removed usccessfully, send a messae stating it
                    res.json({success: true, message: "Option removed"});
            }
            catch(error)
            {
                //If there was an error, display the error
                res.json({ success: false, message: error.message });
            }
        }
     },
     addMember: async function(req,res)
     {
        //Check that the clientID is not empty and is a mongoID
        req.checkBody('clientID', 'Invalid client id').notEmpty().isMongoId();

        //Check that the duration is not empty and is an integer with a minimum value of 1
        req.checkBody('duration', 'Invalid duration').notEmpty().isInt({min: 1});

        //Wait for validation result
        var result = await req.getValidationResult();

        if (!result.isEmpty())
            //If there are validation errors, display the errors
            res.json({ success: false, message: " " + util.inspect(result.array()[0].msg)});
        else
        {
            try
            {
                //Wait for the subscription of the client
                var done = await Owner.subscribeClient(req.decoded.ownerID, req.body.clientID, req.body.duration);

                //Send a message stating that subscribed client alongside the client
                res.json({success: true, message: "Subscribed client",date:done});
            }
            catch(error)
            {
                //If there was an error, display the error
                logger.debug(error)
                res.json({ success: false, message: error.message });
            }
        }
     }

}
module.exports = controller;
