var User = require('../models/user');
var Token = require('../models/passToken');
var Owner = require('../models/businessOwner');
var Client = require('../models/client');
var Session = require('../models/session');
var Evaluation = require('../models/evaluation');
var Announcement = require('../models/homeAnnouncments');
var config = require('../../config/serverConfigs');
var mailer = require('../../config/mailer');
var jwt = require ('jsonwebtoken');
var async = require('async');
var logger = require('../../config/logger');
var util = require('util');
var mkdirpr = require('mkdir-promise');
var SchemaConfig = require('../../config/schemaNames');
var Order = require('../models/order');
var fs = require('fs');

var controller =
{
    getProfile:async function(req, res)//profile
    {
        //Set the id variable to the _id in the token
        var id = req.decoded._id;
        try
        {
            //Wait for the user retrieval
            var user = await User.getUserByID(id);

            if(!user)
                //If the user is not found, send a message stating it
                res.json({ success: false, message: 'No user was found' });
            else
            {
                //If the user is found
                if(user.userType == 'BusinessOwner')
                {
                    //If the userType is BusinessOwner, wait for the retrieval of the owner
                    var profile = await Owner.findById(user.ownerID).lean().exec();

                    if(!profile)
                        //If no profile was found, send a message stating it
                        res.json({ success: true, message: 'Could not retrieve profile' , user: user});

                    else if(!profile.approved){
                      //If the profile was found and the owner is approved, wait for the evaluations of the owner
                      var evaluation = await Evaluation.find({ownerID:user.ownerID}).populate({path:'posterID',select:'ownerID',populate:{path:'ownerID',select:'username'}}).select('posterID rating review dateCreated').exec();

                      //Set the evaluation of the profile to the evaluation retrieved
                      profile.evaluation = evaluation;

                        //If the owner is not approved yet, send a message stating it

                        res.json({ success: true, message: 'Account not yet approved by system admins, please come back later..', user:user , profile:profile });
                  }  else
                    {
                        //If the profile was found and the owner is approved, wait for the evaluations of the owner
                        var evaluation = await Evaluation.find({ownerID:user.ownerID}).populate({path:'posterID',select:'ownerID',populate:{path:'ownerID',select:'username'}}).select('posterID rating review dateCreated').exec();

                        //Set the evaluation of the profile to the evaluation retrieved
                        profile.evaluation = evaluation;

                        //If retrieval of profile and evaluations of the owner are successful, send a message stating it alongside the profile, and the user
                        res.json({ success: true, message: 'redirecting to profile!', profile: profile, user: user });
                    }
                }
                else if(user.userType == 'Client')
                {
                    //If the userType is Client, wait for the retrieval of the client
                    var profile = await Client.findById(user.ownerID).lean().exec();

                    if(!profile)
                        //If no profile was found, send a message stating it
                        res.json({ success: true, message: 'Could not retrieve profile' , user :user });
                    else
                    {
                        //Wait for the rerieval of the order history of the client
                        var history = await Order.find({clientID: user.ownerID})

                        //Set the purchase history to the history retrieved
                        profile.purchaseHistory = history;

                        //If the profile and history are retrieved successfuly, send a message stating it alongside the profile, and the user
                        res.json({ success: true, message: 'redirecting to profile!', profile: profile, user: user });
                    }
                }
                else
                    //Send a message stating an invalid account type alongside the user (Admin)
                    res.json({ success: true, message: 'Invalid account type', user: user });
            }
        }
        catch(error)
        {
            //If there was an error, display the error
            logger.debug(error);
            res.json({ success: false, message: error.message });
        }
    },
    addProfile: async function(req,res)//profile
    {
        //Set the user variable to the token
        var user = req.decoded;


        if (user.userType == 'Client' && await validateClient(req, res))
        {
            //Check if the user is a valid client
            var clientExists = await Client.findById(req.decoded.ownerID)

            if(clientExists)
                //If the client already has a profile, send a message stating it
                res.json({success: false, message:'you already have a profile'});
            else
            {
                //If the suer does not have a profile yet, create the client profile
                let client = new Client(
                {
                    ownerID: user._id,
                    firstName: req.body.user.firstName,
                    lastName: req.body.user.lastName,
                    birthDate: req.body.user.birthDate,
                    gender: req.body.user.gender,
                    address: req.body.user.address,
                    height: req.body.user.height,
                    weight: req.body.user.weight,
                    sessions: [],
                    weightProgress: [],
                    cart: [],
                    notifications: [],
                    evaluations: []
                });
                try
                {
                    //Wait for the addition of the client
                    var output = await client.addClient();

                    if(!output)
                        //If there was a problem with the addition of the client, send a message stating it
                        res.json({success: false, message:'Could not add client'});
                    else
                    {
                        //Create a folder for the client using their _id
                        var pathClient = config.usersFolder + user._id;
                        var clientFolder = await mkdirpr(pathClient)

                        //Create a folder for the client's nutrition programs
                        var nutritionPlanFolder = await mkdirpr(pathClient+"/NutritionProgram")

                        //Create a folder for the client's fitness programs
                        var fitnessProgramFolder = await mkdirpr(pathClient+"/FitnessProgram")

                        if(!fitnessProgramFolder || !nutritionPlanFolder || !clientFolder)
                        {
                            //If none of the client folders were created, rollback and remove the client
                            await Client.findByIdAndRemove(output._id);

                            //Send a message stating that the client could not be added
                            res.json({success: false, message:'Could not add Client'});
                        }
                        //If all folders were created successfully, send a message stating that the client was added successfully alongside the user, and the profile
                        res.json({success: true, message:'Information updated successfully', user: user, profile: output});
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
        else if (user.userType == 'BusinessOwner' && await validateOwner(req, res))
        {
            //Check if the user is a valid owner
            var ownerExists = await Client.findById(req.decoded.ownerID)

            if(ownerExists)
                //If the owner already has a profile, send  message stating it
                res.json({success: false, message:'you already have a profile'});
            else
            {
                //If the user does not have a profile yet, create the owner profile
                let owner = new Owner(
                {
                    ownerID: user._id,
                    products: [],
                    announcements: [],
                    sessions: [],
                    notifications: [],
                    ownerName: req.body.user.ownerName,
                    organizationName: req.body.user.organizationName,
                    phoneNumber: req.body.user.phoneNumber,
                    address: req.body.user.address,
                    description: req.body.user.description,
                    website: req.body.user.website,
                    category: req.body.user.category,
                    membershipOptions: []
                });
                try
                {
                    //Wait for the addition of the owner
                    var output = await owner.addOwner();

                    if(!output)
                        //If there was a problem with the addition of the owner, send a message stating it
                        res.json({success: false, message:'Could not add owner'});
                    else
                    {
                        //Create a folder for the client using their _id
                        var pathOwner = config.usersFolder + user._id;
                        var ownerFolder = await mkdirpr(pathOwner);

                        //Create a folder for the owner's products
                        var productsFolder = await mkdirpr(pathOwner+"/Product");

                        //Create a folder for the owner's sessions
                        var sessionsFolder = await mkdirpr(pathOwner+"/Session");

                        //Create a folder for the owner's announcements
                        var announcementsFolder = await mkdirpr(pathOwner+"/OwnerAnnouncement");

                        if(!ownerFolder || !productsFolder || !sessionsFolder || !announcementsFolder)
                        {
                            //If none of the owner folders were created, rollback and remove the owner
                            await Owner.findByIdAndRemove(output._id).exec();

                            //Send a message stating that the owner could not be added
                            res.json({success: false, message:'Could not add owner'});
                        }
                        //If all folders were created successfully, send a message stating that the owner was added successfully alongside the user, and the profile
                        res.json({success: true, message:'Information updated successfully', user: user, profile: output});
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
    },
    retrieveBusinesses: async function(req, res)//profile
    {
        try
        {
            //Wait for the retrieval of the owners that were approved
var owners = await Owner.find({}).populate('sessions','-businessID -clients').populate({path:'evaluations',select:'-ownerID',populate:({path:'posterID',select:'ownerID',populate:{path:'ownerID',select:'username'}})}).select('ownerID products announcements membershipOptions category ownerName organizationName phoneNumber address description website sessions evaluations approved').exec();
            //Send a message stating that the businesses are being loaded alongside the businesses
            res.json({success: true, message:'Loading businesses',business : owners});
        }
        catch(error)
        {
            //If there was an error, display the error
            logger.debug(error);
            res.json({ success: false, message: error.message });
        }
    },
    editProfile: async function(req,res) //profile
    {
        //Set the user variable to the token
        var user = req.decoded;

        if (user.userType == 'Client' && await validateClient(req, res))
        {
            //If the user is a valid client
            try
            {
                //Wait for the updating of the client info using the inputs
                var output = await Client.findByIdAndUpdate(user.ownerID,
                {
                    firstName: req.body.user.firstName,
                    lastName: req.body.user.lastName,
                    birthDate: req.body.user.birthDate,
                    gender: req.body.user.gender,
                    address: req.body.user.address,
                    height: req.body.user.height,
                    weight: req.body.user.weight
                }).exec();
                if(!output)
                    //If there were a problem with the updating of the profile, send a message stating it
                    res.json({success: false, message:'Could not update information'});
                else
                    //If the information was updated successfully, send a message stating it
                    res.json({success: true, message:'information updated successfully'});
            }
            catch(error)
            {
                //If there was an error, display the error
                logger.debug(error);
                res.json({ success: false, message: error.message });
            }
        }
        else if (user.userType == 'BusinessOwner' && await validateOwner(req, res))
        {
            //If the user is a valid owner
            try
            {
                //Wait for approval status


                    //If the owner is approved, wait for the updating of the owner usng the inputs
                    var output = await Owner.findByIdAndUpdate(user.ownerID,
                    {
                        ownerName: req.body.user.ownerName,
                        organizationName: req.body.user.organizationName,
                        phoneNumber: req.body.user.phoneNumber,
                        address: req.body.user.address,
                        description: req.body.user.description,
                        website: req.body.user.website
                    }).exec();
                    if(!output)
                        //If there were a problem with the updating of the profile, send a message stating it
                        res.json({success: false, message:'Could not update information'});
                    else
                        //If the information was updated successfully, send a message stating it
                        res.json({success: true, message:'information updated successfully'});

            }
            catch(error)
            {
                //If there was an error, display the error
                logger.debug(error);
                res.json({ success: false, message: error.message });
            }
        }
    },
    getOrders: async function(req, res)
    {
        //Check that the status is not empty and is a valid orderStatusType
        // req.checkBody('status', 'Invalid order status').notEmpty().isOrderStatusType();

        //Wait for validation result
        var result = await req.getValidationResult();

        if (!result.isEmpty())
            //If there are validation errors, display the errors
            res.json({ success: false, message: " " + util.inspect(result.array()[0].msg)});
        else
        {
            //If there are no validation errors, initializa a variable orders
            var orders;

            if(req.decoded.userType == 'BusinessOwner')
                //If the userType is BusinessOwner, wait for owner's order retrieval
                orders = await Order.getBusinessOrders(req.decoded.ownerID);
            else if (req.decoded.userType == 'Client')
                //If the userType is Client, wait for owner's order retrieval
                orders = await Order.getClientOrders(req.decoded.ownerID);
            if(orders && orders.length > 0)
                //If there are orders, send a message stating that the orders are being loaded alongsde the orders themselves
                res.json({success: true, message: "loading orders..", orders: orders});
            else
                //If there are no orders send a message stating it
                res.json({success: false, message:'Could not get orders'});
        }
    },
    changePass: (req, res) => //profile
    {
        //Set the user variable to the token
        var user = req.decoded;

        //Find the user by the _id in the user variable
        User.findOne({_id: user._id}).select('password').exec(function(err,output)
        {
            if(err)
                //If there was an error, display the error
                res.json({ success: false, message: err.message });
            else if(!output)
                //If the user was not found, send a message stating it
                res.json({ success: false, message: "user not found" });
            else
            {
                //If the user was found compare the password provided with the user's password in the database
                User.comparePassword(output.password, req.body.oldPassword, function(err,isMatch)
                {
                    if(err)
                        //If there was an error, display the error
                        res.json({ success: false, message: err.message });
                    else if(!isMatch)
                        //If the passwords do not match, send a message stating it
                        res.json({ success: false, message: "old Password does not match" });
                    else
                    {
                        //If the passwords match, update the password
                        User.updatePassword(user._id,req.body.newPassword, function(err,output)
                        {
                            if(err)
                                //If there was an error, display the error
                                res.json({ success: false, message: err.message });
                            else if(!output)
                                //If there was a problem with the updating the password, send a message stating it
                                res.json({ success: false, message: "could not update password" });
                            else
                                //If the password updating was successful, send a message stating it
                                res.json({success:true,message:"password updated successfully"});
                        });
                    }
                });
            }
        });
    }
}
var validateOwner = async function(req, res)
    {
        //Check that the user is not empty
        req.checkBody('user', 'Empty user').notEmpty();

        //Check that the user.ownerName is not empty with a length between 3 and 35
        req.checkBody('user.ownerName', 'Invalid owner name').notEmpty().len(3,35);

        //Check that the user.organizationName is not empty with a length between 2 and 30
        req.checkBody('user.organizationName', 'Invalid organization name').notEmpty().len(2,30);

        //Check that the user.phoneNumber is not empty and is a decimal
        req.checkBody('user.phoneNumber', 'Invalid phone number').notEmpty().isDecimal();

        //Check that the user.address is not empty with a length between 4 and 100
        req.checkBody('user.address', 'Invalid address').notEmpty().len(4,100);

        //Check that the user.website is not empty and is a URL
        req.checkBody('user.website', 'Invalid website').notEmpty().isURL();

        //Check that the user.description is not empty
        req.checkBody('user.description', 'Invalid description').notEmpty();

        //Check that the user.category is not empty and is a validCategory
        req.checkBody('user.category', 'Invalid category').notEmpty().isValidCategory();

        //Wait for validation result
        var result = await req.getValidationResult();

        if (!result.isEmpty())
        {
            //If there are validation errors, display the errors
            res.json({ success: false, message: " " + util.inspect(result.array()[0].msg)});
            return false;
        }
        else
            return true;
    }
var validateClient = async function(req , res)
    {
        //Check that the user is not empty
        req.checkBody('user', 'Empty user').notEmpty();

        //Check that the user.firstName is not empty with a length between 3 and 20
        req.checkBody('user.firstName', 'Invalid first name').notEmpty().len(3,20);

        //Check that the user.lastName is not empty with a length between 3 and 20
        req.checkBody('user.lastName', 'Invalid last name').notEmpty().len(3,20);

        //Check that the birthDate is not empty and is a date
        req.checkBody('user.birthDate', 'Invalid birth date').notEmpty().isDate();

        //Check that the user.gender is not empty and is a validGender
        req.checkBody('user.gender', 'Invalid gender').notEmpty().isValidGender();

        //Check that the user.address is not empty with a length between 4 and 100
        req.checkBody('user.address', 'Invalid address').notEmpty().len(4,100);

        //Check that the user.height is not empty and is an integer with a value between 90 and 300
        req.checkBody('user.height', 'Invalid height').notEmpty().isInt({min:90, max:300});

        //Check that the user.weight is not empty and is an integer with a value between 40 and 1000
        req.checkBody('user.weight', 'Invalid weight').notEmpty().isInt({min:40, max:1000});

        //Wait for validation result
        var result = await req.getValidationResult();

        if (!result.isEmpty())
        {
            //If there are validation errors, display the errors
            res.json({ success: false, message: " " + util.inspect(result.array()[0].msg)});
            console.log(util.inspect(result.array()))
            return Promise.resolve(false);
        }
        else
            return Promise.resolve(true);
    }
module.exports = controller;
