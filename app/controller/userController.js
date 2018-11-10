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
    forgotPassword:async function(req, res)//user
    {
        //Check that the email is not empty and is an email
        req.checkBody('email', 'Invalid email').notEmpty().isEmail();

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
                //Wait for retrieval of user
                var user = await User.getUserByEmail(req.body.email)
                if(!user)
                    //If no user is found, send a message stating it
                    res.json({ success: false, message: 'Email not registered' });
                else
                {
                    //If a user is found, create a token
                    let newToken = new Token(
                    {
                        accountID: user._id,
                        expireAt: new Date()
                    });

                    //Wait for the addition of the token
                    var token = await newToken.addToken()
                    var URL = config.URL + "api/restorePass?token=" + token._id;

                    //Configure mail details
                    let mailOptions =
                    {
                        from: 'Do Not Reply <admin@gmail.com>',//to be changed
                        subject: 'Password Recovery',
                        html: 'Click the following link to confirm your account:</p><p>'+ URL +'</p>',
                        text: 'Please confirm your account by clicking the following link: ${'+ URL +'}',
                        to: req.body.email
                    };

                    //Send the mail
                    mailer.sendMail(mailOptions, (error, info) =>
                    {
                        if (error)
                        {
                            Token.findByIdAndRemove(token._id);
                            //If there was a problem with the sending of the email, send a message stating it
                            res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for thisin convenience!' });
                        }
                        else
                            //If the email was sent successfully, send a message stating it alongside the token
                            res.json({ success: true, message: 'password reset email sent!'});
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
    restorePass:async function(req, res)//user
    {
        //Check that the token is not empty
        req.checkQuery('token', 'Empty token').notEmpty();

        //Check that the newPass is not empty with a length between 8 and 35 with the provided constraints
        req.checkBody('newPass', 'Invalid password').notEmpty().len(8,35).matches(/^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[\d])(?=.*?[\W]).{8,35}$/);

        //Wait for validation result
        var result = await req.getValidationResult();

        if (!result.isEmpty())
            //If there are validation errors, display the errors
            res.json({ success: false, message: " " + util.inspect(result.array()[0].msg)});
        else
        {
            try
            {
                //If there are no validation errrors, wait for token retrieval
                var token = await Token.getTokenByID(req.query.token)

                if(!token)
                    //If no token was found, send a message stating it
                    res.json({ success: false, message: 'Incorrect token' });
                else
                {
                    //If the token was found, wait for the retrieval of the user
                    var user = await User.getUserByID(token.accountID)

                    if(!user)
                        //If no user was found, send a message stating it
                        res.json({ success: false, message: 'User does not exist' });
                    else
                    {
                        //If the user was found, update the password of the user
                        User.updatePassword(user._id, req.body.newPass, (err, user) =>
                        {
                            if(err)
                                //If there was an error in the updating of the password, send a message stating it
                                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for thisin convenience!' });
                            else
                            {
                                //If the updating of the password wass successful, remove the token and redirect the user
                                token.remove();
                                res.redirect(config.URL + 'renew');
                            }
                        });
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
    registerUser:async function(req, res)//user
    {
        //Check that the user is noot empty
        req.checkBody('user', 'Empty user').notEmpty();

        //Check that the user.username is not empty with length between 3 and 25
        req.checkBody('user.username', 'Invalid Username').notEmpty().len(3,25);

        //Chek that the user.password is not empty with length between 8 and 35 with the provided constraints
        req.checkBody('user.password', 'Invalid password').notEmpty().len(8,35).matches(/^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[\d])(?=.*?[\W]).{8,35}$/);

        //Check that the user.email is not empty and is an email
        req.checkBody('user.email', 'Invalid email').notEmpty().len(3,40).isEmail();

        //Check that the user.userType is not empty and is a valid userTyep
        req.checkBody('user.userType', 'Invalid user type').notEmpty().isValidUserType();

        //Wait for validation result
        var result = await req.getValidationResult();

        if (!result.isEmpty())
            //If there are validation errors, display the errors
            res.json({ success: false, message: " " + util.inspect(result.array()[0].msg)});
        else
        {
            //If there are no validation errors, create a new user
            let newUser = new User(
            {
                //ownerID: null,
                username: req.body.user.username,
                password: req.body.user.password,
                email: req.body.user.email,
                userType: req.body.user.userType,
                dateCreated: Date.now(),
                dateUpdated: null,
            })
            //Place the user in the temporary collection to be later verified by mail
            User.nev.createTempUser(newUser, function(err, existingPersistentUser, newTempUser)
            {
                // some sort of error
                if (err)
                {
                    //If there was an error, display the error
                    logger.debug(err);
                    res.json({ success: false, message: "please recheck your credentials" });
                }
                else
                {
                    if (existingPersistentUser)
                        // user already exists in persistent collection, send a message stating it alongside the user
                        res.json({ success: false, message: 'User already registered!', user: existingPersistentUser });
                    else
                    {
                        if (newTempUser)
                        {
                            //If the user is new, create the url for the mail verification
                            var URL = newTempUser[User.nev.options.URLFieldName];
                            User.nev.sendVerificationEmail(req.body.user.email, URL, function(err, info)
                            {
                                if (err)
                                    //If there was en error in the sending of the email, send a message stating it
                                    res.json({ success: true, message: 'Could not send verification email' });
                                else
                                    //If the email was sent successfully, send a message stating the successful registration of the user
                                    res.json({ success: true, message: 'User registered successfully!'});
                            });
                        }
                        else
                        {
                            // user already exists in temporary collection, send a message stating it
                            res.json({ success: false, message: 'User is already in temporary collection!'});
                        }
                    }
                }
            });
        }
    },
    //route to verify account
    verifyAccount:(req, res) =>//user
    {
        //Check that the token is not empty
        req.checkQuery('token', 'Empty token').notEmpty();

        //Wait for validation result
        req.getValidationResult().then(function(result)
        {
            if (!result.isEmpty())
                //If there are validation errors, display the errors
                res.json({ success: false, message: " " + util.inspect(result.array()[0].msg)});
            else
            {
                //If there are no validation errors, confirm the temporary user
                User.nev.confirmTempUser(req.query.token, function(err, user)
                {
                    if (err)
                    {
                        //If there was an error, display the error
                        logger.debug(err);
                        res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for thisin convenience!' });
                    }
                    if (user)
                    {
                        //If a user was found, redirect the user to the login page
                        User.nev.sendConfirmationEmail(user['email'], function(err, info)
                        {
                            res.redirect('http://54.244.211.116:8000/login');
                        });
                    }
                    else
                    {
                        //IF the user could not be retrieved, send a message stating it
                        res.json({ success: false, message: 'Could not retrieve user' });
                    }
                });
            }
        })
    },

    // Route to verify user credentials before re-sending a new activation link
    ///NOT FUNCTIONAL. no need for commenting
    reverify:(req, res) =>//user
    {
        User.findOne({ username: req.body.username }).select('username password verified').exec(function(err, user)
        {
            if (err)
            {
                res.json({ success: false, message: err.message });
            }
            else
            {
                // Check if username is found in database
                if (!user)
                {
                    res.json({ success: false, message: 'Could not authenticate user' }); // Username does not match username found in database
                }
                else if (user)
                {
                    // Check if password is sent in request
                    if (req.body.password)
                    {
                        User.comparePassword(user.password, req.body.password, (err, isMatch) =>
                        {
                            if (!isMatch)
                            {
                                res.json({ success: false, message: 'Could not authenticate password' }); // Password does not match password found in database
                            }
                            else if (user.verified)
                            {
                                res.json({ success: false, message: 'Account is already activated.' }); // Account is already activated
                            }
                            else
                            {
                                res.json({ success: true, user: user });
                            }
                        }); // Password was provided. Now check if matches password in database
                    }
                    else
                    {
                        res.json({ success: false, message: 'No password provided' }); // No password was provided
                    }
                }
            }
        });
    },

    resendVerification: (req, res) =>//user
    {
        //Check that email is not empty and is an email
        req.checkBody('email', 'Invalid email').notEmpty().isEmail();

        //Wait for validation result
        req.getValidationResult().then(function(result)
        {
            if (!result.isEmpty())
                //If there are validation errors, display the errors
                res.json({ success: false, message: " " + util.inspect(result.array()[0].msg)});
            else
            {
                //If there are no validation errors, resend the verification mail
                User.nev.resendVerificationEmail(req.body.email, function(err, userFound)
                {
                    if (err)
                        //If there was an error, display the error
                        res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for thisin convenience!' });
                    if (userFound)
                        //IF the user was found, send a message stating that the email was resent successfully alongside the user's email
                        res.json({ success: true, message: 'Email resent successfully!', email: req.body.email });
                    else
                        //If there was a problem with the sending of the mail, send a message stating it
                        res.json({ success: false, message: 'Could not send mail!' });
                });
            }
        })
    },
    viewSessions: async function(req,res)
    {
        //Check that the ownerID is not epty and is a mongoID
        req.checkBody('ownerID', 'Invalid ID').notEmpty().isMongoId();

        //Wait for validation result
        req.getValidationResult().then(async function(result)
        {
            if (!result.isEmpty())
                //If there are validation errors, display the errors
                res.json({ success: false, message: " " + util.inspect(result.array()[0].msg)});
            else
            {
                //If there are no validation errors, wait for the user's sessions retrieval
                var sessions = await Session.find({businessID:req.body.ownerID}).exec();

                //Send a message stating that the sessions are being loaded alongside the sessions
                res.json({success: true, message: 'loading..', sessions: sessions});
            }
        })
    }
}
module.exports = controller;
