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
    loginUser:async function(req, res)//login
    {
        //Check that the username is not empty
        req.checkBody('username', 'No username provided').notEmpty();

        //Check that the password is not empty
        req.checkBody('password', 'No password provided').notEmpty();

        //Wait for validation result
        var result = await req.getValidationResult()

        if (!result.isEmpty())
            //If there are validation errors, display the errors
            res.json({ success: false, message: " " + util.inspect(result.array()[0].msg)});
        else
        {
            try
            {
                //If there are no validation errors, wait for the retieval of the user
                var user = await User.getUserByUserame(req.body.username.toLowerCase());

                if (!user)
                    //If the user was not found, send a message stating it
                    res.json({ success: false, message: 'Username not found' });
                else
                {
                    //If the user was found, compare the entered password with that of the found user
                    user.comparePassword(req.body.password, (err, isMatch) =>
                    {
                        if (!isMatch)
                            // If the password does not match the password in the database, send a message stating it
                            res.json({ success: false, message: 'Incorrect password' });
                        else
                        {
                            // If the password matchs the password in the database, create a token for that user which will expire after 24 hours
                            var token = jwt.sign({ _id: user._id }, config.JWTKey, { expiresIn: '24h' }); // Logged in: Give user token
                            if(!user.ownerID)
                                //If there is no ownerID, send a message stating that the user is authnticated alongside the token, user, and a nullID with a value of true
                                res.json({ success: true, message: 'User authenticated!', token: token, user: user, nullID: true });
                            else
                            {
                                //If there is an ownerID, set the model variable according to the user's userType. If the userType is neither client nor owner set model to null
                                var model = user.userType == 'Client' ? Client:(user.userType == 'BusinessOwner'? Owner:null);
                                if(model != null)
                                {
                                    //If the model variable is not null find the user in their respective models
                                    model.findById(user.ownerID,(err,doc)=>
                                    {
                                        if (err)
                                            //If there is an error, send a message stating the error
                                            res.json({ success: false, message: err.message });
                                        else if (!doc)
                                            //If there was no error but a user was not found, send a message stating it
                                            res.json({ success: false, message: 'could not find user' });
                                        else
                                        //If there were no errors and the user was found, send a message stating it alongside the token, user, an a nullID value of false
                                        res.json({ success: true, message: 'User authenticated!', token: token, user: user, profile: doc, nullID: false });
                                    });
                                }
                                else
                                    //If the model variable is null, send a message stating that the user is authenticated alongside the token, and user (Admin)
                                    res.json({ success: true, message: 'User authenticated!', token: token, user: user });
                            }
                        }
                    });
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
    // Middleware for Routes that checks for token - Place all routes after this route that require the user to already be logged in
    tokenCheck:(req, res, next) =>//login
    {
        //Check for token in the token query, or the headers
        var token = req.body.token || req.body.query || req.headers['x-access-token']; // Check for token in body, URL, or headers

        // Check if token is valid and not expired
        if (token)
        {
            // Function to verify token
            jwt.verify(token, config.JWTKey, async function(err, decoded)
            {
                if (err)
                    // If token has expired or is invalid, send a message stating it
                    res.json({ success: false, message: 'Token invalid' });
                else
                {
                    //If the token is valid, wait for the user's password retrieval
                    var user = await User.findById(decoded._id).select('-password').exec();
                    if(!user)
                        //If no user was found, send a message stating it
                        res.json({ success: false, message: 'could not find user' });
                    else
                    {
                        //If the user was found, set the token to that user to be used in the next() route
                        req.decoded = user;

                        // Required to leave middleware
                        next();
                    }
                }
            });
        }
        else
            // Return error if no token was provided in the request
            res.json({ success: false, message: 'Please sign in to continue!' });
    },
     // Route to provide the user with a new token to renew session
    renewSession:(req, res) =>//login
    {
        //Chec if user parameter is not empty
        req.checkParams('username', 'No username provided').notEmpty();

        //Find the user by usernme
        User.findOne({ username: req.params.username }).select('username email').exec(function(err, user)
        {
            if (err)
                //If there was an error, send a message stating it
                res.json({ success: false, message: err.message });
            else
            {
                //If there was no error, check if username was found in database
                if (!user)
                    //If the username was not found, send a message stating it
                    res.json({ success: false, message: 'No user was found' });
                else
                {
                    //Create token for the user
                    var token = jwt.sign({ _id: user._id, username: user.username, email: user.email, userType: user.userType, ownerID: (user.ownerID || null) }, config.JWTKey, { expiresIn: '24h' });
                    //Send a message stating the successful creation of the token alongside the token itself
                    res.json({ success: true, token: newToken }); // Return newToken in JSON object to controller
                }
            }
        });
    }
}
module.exports = controller;
