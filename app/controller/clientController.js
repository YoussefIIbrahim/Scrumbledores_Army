var User = require('../models/user');
var Token = require('../models/passToken');
var Owner = require('../models/businessOwner');
var Client = require('../models/client');
var Session = require('../models/session');
var Order = require('../models/order');
var Membership = require('../models/membership');
var Evaluation = require('../models/evaluation');
var Announcement = require('../models/homeAnnouncments');
var config = require('../../config/serverConfigs');
var mailer = require('../../config/mailer');
var mailer2 = require('../../config/mailer2');
var jwt = require ('jsonwebtoken');
var async = require('async');
var logger = require('../../config/logger');
var util = require('util');
var CustomError = require('node-custom-error');
var fs = require('fs');
var stripeConfig = require('../../config/stripe')
var stripe = require("stripe")(stripeConfig.testSecretKey);

var controller =
{
    postReview: async function(req,res)//client
    {
        //Check that rating is not empty and is a number between 1 and 5
        req.checkBody('rating', 'please check rating').notEmpty().isInt({min:1, max:5});

        //The review is optional, can be empty or not
        req.checkBody('review', 'review cant be empty').optional();

        //Check that the ownerID is not empty and is a mongoID
        req.checkBody('OwnerID', 'Invalid ownerID').notEmpty().isMongoId();

        //Wait for validation result
        var result = await req.getValidationResult();

        if (!result.isEmpty())
            //If there are validation errors, display the errors
            res.json({ success: false, message: " " + util.inspect(result.array()[0].msg)});
        else
        {
            try
            {
                //If there are no validation errors, wait for retieval of the owner
                var owner = await Owner.findById(req.body.OwnerID).exec();

                if(!owner)
                    //If no owner was found, send a message stating it
                    res.json({success: false, message: "could not find owner"});
                else
                {
                    //If the owner was found

                    if(!owner.approved)
                        //If the owner was not approved yet, send a message stating it
                        res.json({success: false, message: "owner not approved"});
                    else
                    {
                        //If the owner was approved, create the review
                        var review = new Evaluation
                            ({
                                ownerID: owner._id, 
                                posterID:req.decoded.ownerID, 
                                rating:req.body.rating, 
                                review:req.body.review
                            });

                        //Wait for the addtion of the evaluation
                        var output = await Owner.addEvaluation(owner._id, review);

                        if(!output)
                            //If no review was posted, send a message stating it
                            res.json({success: false, message: "review was not posted"});
                        else
                            //If the review was posted successfully, send a message stating it
                            res.json({success: true, message: 'Review posted successfully'});
                    }
                }
            }
            catch(error)
            {
                //If there was an error, display the error
                res.json({success: false, message: error.message});
            }
        }
    },
    registerToSession:async function(req, res)//client
    {
        //Check that the sessionID is not empty and is a mongoID
        req.checkBody('sessionID', 'please check session ID').notEmpty().isMongoId();

        //Wait for validation result
        var result = await req.getValidationResult();

        if (!result.isEmpty())
            //If there are validation errors, display the errors
            res.json({ success: false, message: " " + util.inspect(result.array()[0].msg)});
        else
        {
            try
            {
                //If there are no validation errors, wait for session retrieval
                var ownerSession = await Session.findById(req.body.sessionID).exec();

                if(!ownerSession)
                    //If no session was found, send a message stating it
                    res.json({success: false, message: "could not find session"});
                else
                {
                    //If the session was found, wait for client retrieval
                    var client = await Client.findById(req.decoded.ownerID);

                    if(client.wallet.balance >= ownerSession.admissionFee)
                    {
                        //If the client wallet balance is greater than or equal the session admssion fee, wait for the removal of the fee from the wallet
                        await Client.removeFromWallet(client._id, ownerSession.admissionFee);

                        //Wait for the registration of the client in the session
                        var session = await Client.registerToSession(req.decoded.ownerID, req.body.sessionID);

                        if(!session)
                        {
                            //If there was no registration in the session, rollback and add the fees back to the client
                            Client.addToWallet(client._id, ownerSession.admissionFee);

                            //Send a message stating the client could not register to the session
                            res.json({success: false, message: "could not register to session"});
                        }
                        else
                        {
                            //If the registration was successful, wait for the session retrieval
                            var output = await Session.findById(req.body.sessionID).exec();

                            if (!output)
                                //If no session was found, send a message stating it
                                res.json({success: false, message: "could not find session"});
                            else
                            {
                                //Wait for the sending of the notification to the client
                                await Client.addNotification(req.decoded.ownerID, "Registered to session " + output.title);

                                //Wait for the addition of the fees to the onwer's wallet
                                await Owner.addToWallet(ownerSession.businessID, ownerSession.admissionFee);

                                //Wait for the sending of the notification to the owner
                                await Owner.addNotification(ownerSession.businessID, "A client has registered to your " + ownerSession.title + " Session")

                                //Send a message stating that the registration to the session was successfull
                                res.json({ success: true, message: 'Registered to session'});
                            }
                        }
                    }
                    else
                        //If the client wallet balance is less than the session admssion fee, send a message stating it
                        res.json({success: false, message: "You do not have enough credits"});
                }
            }
            catch(error)
            {
                //If there was an error, display the error
                res.json({success: false, message: error.message});
            }
        }
    },
    unRegisterFromSession: async function(req, res)//client
    {
        //Check that sessionID is not empty and is a mongoID
        req.checkBody('sessionID', 'please check session ID').notEmpty().isMongoId();

        //Wait for validation result
        var result = await req.getValidationResult();

        if (!result.isEmpty())
            //If there are validation errors, display the errors
            res.json({ success: false, message: " " + util.inspect(result.array()[0].msg)});
        else
        {
            try
            {
                //If there are no validation errors, wait for the client unregistration
                var session = await Client.unRegisterFromSession(req.decoded.ownerID, req.body.sessionID);
                if(!session)
                    //If session unregistration was unsuccessful, send a message stating it
                    res.json({ success: false, message: 'can not unregister from an expired session'});
                else
                    //If session unregistration was successful, send a message stating it
                    res.json({ success: true, message: 'Successfully unregistered from session'});
            }
            catch(error)
            {
                //If there was an error, display the error
              res.json({success: false, message: error.message});
            }
        }
    },
    addToCart: async function(req, res) //client
    {
        //Check that count is not empty and is an integer with a value of at least 1
        req.checkBody('count', 'please check rating').notEmpty().isInt({min:1});

        //CHeck that the productID is not empty and is a mongoID
        req.checkBody('productID', 'invalid productID').notEmpty().isMongoId();

        //Check that the businessID is not empty and is a mongoID
        req.checkBody('businessID', 'Invalid ownerID').notEmpty().isMongoId();

        //Wait for validation result
        var result = await req.getValidationResult();

        if (!result.isEmpty())
            //If there are validation errors, display the errors
            res.json({ success: false, message: " " + util.inspect(result.array()[0].msg)});
        else
        {
            try
            {
                //If there are validation errors, create the cart content
                let cartContent =
                {
                    ID:req.body.productID,
                    ownerID: req.body.businessID,
                    quantity: req.body.count
                }

                //Wait for the addition to the cart of the client
                var doc = await Client.addToCart(req.decoded.ownerID, cartContent);

                if(!doc)
                    //If the addition was not successful, send a message stating it
                    res.json({success: false, message:"Could not add to cart"});
                else
                    //If the addition was successful, send a message stating it
                    res.json({success: true, message:"successfully added to cart"});
            }
            catch(error)
            {
                //If there was an error, display the error
                res.json({success: false, message:error.message});
            }
        }
    },

    subscribeToBusiness: async function(req, res)
    {
        //Check that the businessID is not empty and is a mongoID
        req.checkBody('businessID', 'Invalid business id').notEmpty().isMongoId();

        //Check that the optionID is not empty and is a mongoID
        req.checkBody('optionID', 'Invalid option id').notEmpty().isMongoId();

        //Wait for validation result
        var result = await req.getValidationResult();

        if (!result.isEmpty())
        {
            //If there are validation errors, display the errors
            res.json({ success: false, message: " " + util.inspect(result.array()[0].msg)});
        }
        else
        {
            try
            {
                //If there are no validation errors, wait for the subscription fo the client to the business
                await Client.subscribeToBusiness(req.decoded.ownerID, req.body.businessID, req.body.optionID);

                //Send a message stating that the subscripion was successful
                res.json({success:true,message:'successfully subscribed'})
            }
            catch(error)
            {
                //If there was an error, display the error
                res.json({ success: false, message: error.message });
            }
        }
    },
    purchase: async function(req, res)//client
    {
        //Check that the paymentType is not empty and is a valid paymentType
        req.checkBody('paymentType', 'Invalid payment type').notEmpty().isPaymentType();

        //Wait for validation result
        var result = await req.getValidationResult();

        if (!result.isEmpty())
            //If there are validation errors, display the errors
            res.json({ success: false, message: " " + util.inspect(result.array()[0].msg)});
        else
        {
            try
            {
                //If there are no validation errors, asign the isWalletPayment variable according to the paymentType if equal to "Wallet"
                var isWalletPayment = req.body.paymentType == "Wallet"

                //Set ownerID variable to the ownerID present in the token
                var ownerID = req.decoded.ownerID;

                //Wait for the retrieval of the client
                var output = await Client.findById(ownerID).exec();

                if(!output)
                    //If no client was found, send a message stating it
                    res.json({success: false, message:"No user found"});

                else if (output.cart.length<1)
                    //If a client was found and the cart elements are 0, send a message stating it
                    res.json({success: false, message:"Cart is empty"});
                else
                {
                    //If the cart was not empty, wait for the calculation of the total cost of the cart elements
                    var cartTotal = await output.cartTotal();

                    if(!cartTotal)
                        //If there was no total cost for the cart, send a message stating it
                        res.json({success: false, message:"cart total invalid"});
                    else
                    {
                        //If there was a total cost for the cart

                        if(isWalletPayment && output.wallet.balance < cartTotal)
                            //If the paymentType is Wallet and the wallet ballance is less than the cart total cost, send a message stating it
                            res.json({success: false, message:"You don't have sufficient funds!"});
                        else
                        {
                            //If the paymentType is Wallet and the wallet ballance is greater than or equal the cart total cost

                            if(isWalletPayment)
                                //If the paymentType is wallet, wait for the removal of the cart total fees from the client's wallet
                                var newWallet = await Client.removeFromWallet(ownerID,cartTotal);
                            try
                            {
                                //Wait for the purchase of all of the cart items
                                var purchases = await Client.purchaseAll(ownerID, output);

                                if(purchases.length > 0)
                                {
                                    //If there are purchase elements, wait for the addition of the order
                                    await Order.addOrder(ownerID,output.cart, req.body.paymentType)

                                    //Defning the mail to be sent to the client
                                    let mailOptions =
                                    {
                                        from: 'Do Not Reply <admin@gmail.com>',//to be changed
                                        subject: 'Cart checkout',
                                        html: 'you successfully made a purchase with total of '+ cartTotal +'</p>',
                                        text: 'you successfully made a purchase with total of: ${'+ cartTotal +'}',
                                        to: req.decoded.email
                                    };
                                    //Send the email
                                    mailer.sendMail(mailOptions, async function(error, info)
                                    {
                                        try
                                        {
                                            if (error)
                                                //If there was an error in the sending of the email, send a message stating it
                                                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                                            else
                                            {
                                                //If there was no error in the sending of the email send a message stating the successful purchase of the cart items
                                                res.json({ success: true, message: 'items purchased successfully'});
                                            }
                                        }
                                        catch(error)
                                        {
                                            //If there was an error, display the error
                                            logger.debug(error);
                                            res.json({success: false, message:error.message});
                                        }
                                    });
                                }
                                else
                                    //If there were no purchase elements
                                    res.json({success: false, message:"Can not purchase products"});
                            }
                            catch(error)
                            {
                                //Check if there was an error in the quantity
                                if(error.quantity)
                                {
                                    if(isWalletPayment)
                                        //If the paymentType was Wallet, rollback and add back the fees to the client's wallet
                                        await Client.addToWallet(ownerID, cartTotal);
                                    res.json({success: false, message:error });
                                }
                                else
                                {
                                    //If there was an error, display the error
                                    logger.debug(error);
                                    res.json({success: false, message:error.message});
                                }
                            }
                        }
                    }
                }
            }
            catch(error)
            {
                //If there was an error, display the error
                logger.debug(error);
                res.json({success: false, message:error.message});
            }
        }
    },




    //api to send an email to ourselves with the client's issue and his email to reply to him directly
    //parameters used are the clients email extracted from the token, subject and body extracted from the body
    contactUs: async function(req,res)
    {
        //Check that the subject is not empty
        req.checkBody('subject', 'please include a subject').notEmpty();

        //Check that the text is not empty
        req.checkBody('text', 'can not send an empty mail').notEmpty();

        //Wait for validation result
        var result = await req.getValidationResult();

        if (!result.isEmpty())
            //If there are validation errors, display the errors
            res.json({ success: false, message: " " + util.inspect(result.array()[0].msg)});
        else
        {
            try
            {
                //If there are no validation errors, set the email variable to the email from the token
                var email = req.decoded.email;

                //Define the email to be sent
                let mailOptions =
                {
                    from: 'Do Not Reply <admin@gmail.com>',//to be changed
                    subject: req.body.subject,
                    html: 'issue from: '+ email + '\n' + req.body.text +'</p>',
                    text: ' ' + req.body.text,
                    to: 'm7sherif@hotmail.com' //to be changed
                };
                //Send the email
                mailer2.sendMail(mailOptions, (error, info) =>
                {
                    if (error || !info)
                        //If there was an error in the sending o the email, send a message stating it
                        res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!'});
                    else
                        //If there was no error in the sending of the email, send a message stating that the email was sent successfully
                        res.json({ success: true, message: 'Email sent successfully'});
                });
            }
            catch(error)
            {
                //If there was an error, display the error
                res.json({success: false, message:error.message});
            }
        }
    },
    notifications: async function(req,res)
    {
        //Set the ownerID variable to the ownerID in the token
        var ownerID = req.decoded.ownerID;

        //Wait for the client notifications retrieval
        var list = await Client.findById(ownerID).select('notifications').exec();

        if(!list)
            //If no notifications were found, send a message stating it
            res.json({success: false, message: "no notifications!"});
        else
        {
            //If there were notifications found, wait for the "reading"" o the notifications
            var output = await  Client.readNotification(ownerID);
            if(!output)
                //If no notifications were read, send a message stating it
                res.json({success: false, message: "no notifications!!"});
            else
                //If the notifications were read, send a message stating it alongside the notifications themselves
                res.json({success: true, message: "loading notifications..", notifications: list});
        }
     },
     addProgress: async function(req,res)
     {
        //Check that the weight is not empty and is an integer between 20 and 1000
        req.checkBody('weight', 'please include a weight entry').notEmpty().isInt({min:20, max:1000});

        //Wait for validation result
        var result = await req.getValidationResult();

        if (!result.isEmpty())
            //If there are validation errors, display the errors
            res.json({ success: false, message: " " + util.inspect(result.array()[0].msg)});
        else
        {
            //If there were no validation errors, wait for the updating of the client's progress
            var output = await Client.updateMyWeightProgress(req.decoded.ownerID, req.body.weight);

            if(!output)
                //If there was a problem in the updating of the progress, sned a message stating
                res.json({success: false, message: "Could not add progress"});
            else
                //If there was nor problem in the updating of the progress send a message stating that the progress was updated successfully
                res.json({success: true, message: "Progress added successfully"});
        }
     },
     viewProgress: async function(req,res)
     {
        //Wait for the retrieval of the weight progress of the client
        var output = await Client.getMyWeightProgress(req.decoded.ownerID);

        if(!output)
            //If there was a problem in the retrieval of the weight progres, send a message stating it
            res.json({success: false, message: "Could not get your progress"});
        else
            //If there was no problem in the retrieval of the weight progress send a message stating it alongside the progress
            res.json({success: true, progress:output});
     },
     resetProgress: async function(req,res)
     {
        //Wait for the reseting of the weigt progress of the client
        var output = await Client.resetMyWeightProgress(req.decoded.ownerID);

        if(!output)
            //If there was a problem in the resting of the weight progress, send a message stating it
            res.json({success: false, message: "Could not get your progress"});
        else
            //If there was no problem in the resting of the weight progress, send a message stating it
            res.json({success: true, message: "Progress reset successful"});
     },
     //api to retrieve all sessions the client is registered to, to be scheduled in the front end
     sessions: async function(req,res)
     {
         //Wait for the retrieval of the sessions of the client
         var sess = await Client.getAllSessions(req.decoded.ownerID);

         if(!sess || sess.sessions.length < 1)
            //If there were no sessions found, send a message stating it
            res.json({success: false, message: "no sessions found"});
         else
            //If there were sessions found, send a message stating it alongside the sessions themseves
            res.json({success: true, message: "loading your schedule", sessions: sess});
     },
     //api to remove a specific product from a client's cart
    removeFromCart: async function(req,res)
    {
        //Check tht the cartID is not empty and is a mongoID
        req.checkBody('cartID', 'please enter a valid product ID').notEmpty().isMongoId();

        //Wait for validation result
        var result = await req.getValidationResult();

        if (!result.isEmpty())
            //If there are validation errors, display the errors
            res.json({ success: false, message: " " + util.inspect(result.array()[0].msg)});
        else
        {
            //If there are nov validation errors, set the ownerID variable to the ownerID from the token
            var ownerID = req.decoded.ownerID;

            //Set the cartID cariable to the cartID from the body
            var cartID = req.body.cartID;

            //Wait for the removal of the item from the cart
            var cart = await Client.removeFromCart(ownerID, cartID);
            if(!cart)
                //If there was a problem in the removing of the item, send a message stating it
                res.json({success: false, message:"Could not remove from cart"});
            else
                //If there was no problem in the removal of the item, send a message stating that the removal was successful
                res.json({success: true, message:"successfully removed from cart"});
        }
    },
    viewCart: async function(req, res)
    {
        //Set the ownerID variable to the ownerID from the token
        var ownerID = req.decoded.ownerID;

        try
        {
            //Wait for the retrieval of the client's cart
            var clientCart = await Client.findById(ownerID).select('cart').exec();

            //Wait for the retireval of the details of the items present in the cart
            var cart = await clientCart.getMyCart();

            //Initaliza variable message to be sent to the client
            var message;

            if(!cart || cart.length < 1)
                //If there are no elements present in the cart, state it in the message
                message = "cart is currently empty";
            else
                //If there are elements present in the cart, state it in the message
                message = "loading cart..";

            //Send a message to the client stating the status of the cart alongside the elements of the cart if there are any
            res.json({success: true, message:message, cart: cart});
        }
        catch(error)
        {
            //If there was an error, display the error
            logger.debug(error);
            res.json({success: false, message:error});
        }
    },
    buyCoins: async function(req, res)
    {
        //Check that the amount is not empty and is a decimal with a value of at least 20
        req.checkBody('amount', 'please enter a valid amount minimum 20').notEmpty().isDecimal({min:20});

        req.checkBody('stripeToken', 'no token provided').notEmpty();

        //Wait for validation result
        var result = await req.getValidationResult();

        if (!result.isEmpty())
            //If there are validation errors, display the errors
            res.json({ success: false, message: " " + util.inspect(result.array()[0].msg)});
        else
        {
            //If there are no validation errors, assign to the convertedAmount a value of the amount*100 as amount is the least currency unit available
            var convertedAmount = req.body.amount * 100;

            //Set the charge details
            stripe.charges.create
            ({
                amount: convertedAmount,
                currency: "usd",
                source: req.body.stripeToken, // obtained with Stripe.js
                description: "Charge for " + req.decoded.username + " of amount :" + convertedAmount,
            }, async function(err, charge)
            {
                if(err)
                    //If there was a problem in the purchase of the points, send a message stating it
                    res.json({success: false, message:"Could not purchase points"});
                else
                {
                    //If there was no problem in the purchase of the points, remove the points equivalent from the client's wallet
                    await Client.addToWallet(req.decoded.ownerID, charge.amount * 100);

                    var wallet = charge.amount * 100;

                    //If the amount was successfully added to the client's wallet, send a message stating it alongside the client's wallet
                    res.json({success: true, message:"amount added successfully to wallet", wallet: wallet});
                }
            });
        }
    },
    refund: async function(req, res)
    {
        //Check that the orderID is not empty is a mongoID
        req.checkBody('orderID', 'please enter a valid orderID').notEmpty().isMongoId();

        //Wait for validation result
        var result = await req.getValidationResult();

        if (!result.isEmpty())
            //If there are validation errors, display the errors
            res.json({ success: false, message: " " + util.inspect(result.array()[0].msg)});
        else
        {
            try
            {
                //If there were no validation errors, wait for the client refund
                await Order.clientRefundOrder(req.body.orderID,req.decoded.ownerID);

                //Send a message stating that the refund was successful
                res.json({success: true, message:"order refunded successfully"});
            }
            catch(error)
            {
                //If there was an error, display the error
                res.json({success: false, message:error.message});
            }
        }
    },
    editCart: async function(req, res)
    {
        //Check that the cartID is not empty and is a mongoID
        req.checkBody('cartID', 'please enter a valid cartID').notEmpty().isMongoId();

        //Check that the quantity is not empty and ia an integer with a value of at least 1
        req.checkBody('quantity', 'please enter a valid quantity').notEmpty().isInt({min: 1});

        //Wait for validation result
        var result = await req.getValidationResult();

        if (!result.isEmpty())
            //If there are validation errors, display the errors
            res.json({ success: false, message: " " + util.inspect(result.array()[0].msg)});
        else
        {
            try
            {
                //If there are no validation errors, wait for the editing of the client's cart
                var edited = await Client.editCart(req.decoded.ownerID, req.body.cartID, req.body.quantity);

                if(edited)
                    //If the editing of the cart was successful, send a message stating it
                    res.json({success: true, message:"Cart edited"});
                else
                    //If the editing of the cart was not successful, send a message stating it
                    res.json({success: false, message:"Failed to edit cart"});
            }
            catch(error)
            {
                //If there was an error, display the error
                res.json({success: false, message:error.message});
            }
        }
    },
    viewDocs: async function(req, res)
    {
        req.checkQuery('type', 'please enter a valid doc type').notEmpty().isProgram();

        var result = await req.getValidationResult();

        if (!result.isEmpty())
            res.json({ success: false, message: " " + util.inspect(result.array()[0].msg)});
        else
        {
            fs.readdir(config.usersFolder + req.decoded._id + "/"+ req.query.type, (err, files) => 
            {
                if(err)
                    res.json({success: false, message:"Could not retrieve docs"});
                else
                {
                    var names = []
                    async.forEach(files, function (file, callback)
                    {
                        names.push(file)
                        callback();
                    }, function(err)
                    {
                        if(err)
                            res.json({success: false, message:"Could not retrieve docs"});
                        else
                        res.json({success: true, docs:names});
                    });
                }
            })
        }
    }

}

module.exports = controller;
