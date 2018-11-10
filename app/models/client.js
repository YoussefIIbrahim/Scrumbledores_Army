var mongoose = require('mongoose');
var Bluebird = require('bluebird');
mongoose.Promise = Bluebird;
var Schema = mongoose.Schema;
var triggers = require('./triggers');
var SchemaConfig = require('../../config/schemaNames');
var config = require('../../config/serverConfigs')
var async = require('async');
var logger = require('../../config/logger');
var serverConfig = require('../../config/serverConfigs');
var moment = require('moment');

  var ClientSchema = new Schema({
        //_id of this user in the User model
        ownerID: {type : mongoose.SchemaTypes.ObjectId, unique: true, ref: SchemaConfig.User},

        firstName: {type: String, required:true},
        lastName: {type: String, required:true},
        birthDate: {type: Date, required:true},
        gender: {type: String, required: true, enum: ['Male', 'Female','Other']},
        address: {type: String, required:false},
        height: {type: String, required:false},
        weight: {type: String, required:false},

        //The wallet containing the points of the Client
        wallet: {balance:{type: Number, required: true,default: 0.00}},

        //The weight progress of the client
        weightProgress:
        [{
            weight:{type:Number, required:true},
            date:{type:Date, required:true, default: Date.now()}
        }],

        //The details of the cart of the Client
        cart:
        [{
            ID: {type: mongoose.SchemaTypes.ObjectId, required: true},
            ownerID: {type: mongoose.SchemaTypes.ObjectId, required: true, ref: SchemaConfig.BusinessOwner},
            quantity: {type: Number, default:1},
        }],

        //The sessions the client is registered to (References the Sessions model)
        sessions:
        [{type: mongoose.SchemaTypes.ObjectId, required: true, ref: SchemaConfig.Session}],

        //Array of notifications of the Client alongside their read status
        notifications:
        [{
            notification:{type: String, required: true},
            read:{type: Boolean, required: true, default: false}
        }],
        dateCreated: {type: Date, required:true, default: Date.now()},
        dateUpdated: {type: Date}

  });

//Creating indices for the subdocuments
ClientSchema.index({_id: 1, "notifications.notification": 1}, {sparse:true});
ClientSchema.index({_id: 1, "sessions": 1}, {unique: true, sparse:true});
ClientSchema.index({_id: 1, "cart._id": 1, "cart.ownerID": 1}, {unique: true, sparse:true});

//After saving a Client
ClientSchema.post('save', async function(doc) 
{
    try
    {
        //Update with the User info in the User model
        await mongoose.model(SchemaConfig.User).findByIdAndUpdate(doc.ownerID, { ownerID: doc._id }).exec();
    }
    catch(error)
    {
        //If an error occured, rollback and remove the document and throw an error
        doc.remove();
        throw error;
    }
});

//After updating, update the lastUpdated date
ClientSchema.pre('update', triggers.updateDates);

//Save a Client after adding them
ClientSchema.methods.addClient = function()
{
    return this.save();
}

//Calculate the cart total of the Client
ClientSchema.methods.cartTotal = async function()
{
    //Initlaize total variable to calculate the total amount of the cart
    var total = 0;

    //For each item in the cart
    for(let cartItem of this.cart)
    {
        //Wait for the retrieval of the item pricw
       var price = await mongoose.model(SchemaConfig.BusinessOwner).getPrice(cartItem.ownerID, cartItem.ID);
       if(!price)
        //If no price was determined, send a promise with a value of unll
        return Promise.resolve(null);

        //Add to the total the total price of all of the quanitity of that specific item
        total += (price * cartItem.quantity);
    }
    //return a promise with a value of the total
    return Promise.resolve(total);
}

//Get the cart of the Client
ClientSchema.methods.getMyCart = async function(id)
{
    //Initialize the cartInfo array
    var cartInfo = [];

    //For each item in the cart
    for (cartItem of this.cart) 
    {
        //Wait for the retrieval of the item info
        var itemInfo = await mongoose.model(SchemaConfig.BusinessOwner).getItemInfo(cartItem.ownerID, cartItem.ID)

        //Add the item info to the cartInfo array
        cartInfo.push({cartItemID: cartItem._id, ownerID: cartItem.ownerID, quantity:cartItem.quantity, item:itemInfo})
    }
    //retur the cartInfo array
    return cartInfo;
}

//Delete a Client given their id
ClientSchema.statics.delete = function(id)
{
    return this.findByIdAndRemove(id, callback).exec();
}

//Retrieve a Client given their id
ClientSchema.statics.getClientByID = function(id)
{
    return this.findById(id, callback).exec();
}

//Retrieve a Client given their User id
ClientSchema.statics.getClientByOwnerID = function(oid)
{
    return this.findOne({ownerID: oid}, callback).exec();
}

//Retrieve a Client given their first name
ClientSchema.statics.getClientByFirstName = function(firstName)
{
    return this.findOne({firstName: firstName}).exec();
}

//Retrieve a Client given their last name
ClientSchema.statics.getClientByLastName = function(lastName)
{
    return this.findOne({lastName: lastName}).exec();
}

//Retrieve a Client given their gender
ClientSchema.statics.getClientByGender = function(gender)
{
    return this.findOne({gender: gender}).exec();
}

//Registration of the Client in a session
ClientSchema.statics.registerToSession = async function(id, sID)
{
    //Wait for the retrieval of the session
    var exists = await mongoose.model(SchemaConfig.Session).findById(sID).exec();
    try
    {
        if(exists)
        {
            //if the session was found
            if(exists.clients.length >= exists.maxNumber || exists.timing <= Date.now())
                //If the number of clients in the session is greater than or equal the maximum capacity of the session or the timing is past due, return a promise with a value of null
                return Promise.resolve(null);

            //If there is a vacany for the client in the session, wait for the update
            var numAffected = await this.update({_id : id,  "sessions": {$ne: sID}}, {$push: {sessions: sID}}, {safe: true, upsert: true, new: true}).exec()

            if(numAffected.n > 0)
            {
                //If there were modifications for the client, wait for the addition of the client in the list of attendees in the Session model
                var nAffected = await mongoose.model(SchemaConfig.Session).addClient(sID, id);

                if(nAffected.n  == 0)
                    //If no modifications were made, rollback and remove this session from the client
                    return this.deleteSessionBySessionID(id, sID);
                else
                    //If there were modifications for the session, return a promise with a value of the number affected by the update
                    return Promise.resolve(nAffected);
            }
            else
                //If there were no modificationss made for the client, return a proise with a value of null
                return Promise.resolve(null);
        }
        else
            //If the session was not found, return a promise with a value of null
            return Promise.resolve(null);
    }
    catch(error)
    {
        //If there was an error, return a promise with a value of null
        Promise.resolve(null);
    }
}

//Unregistration of the Client from a session
ClientSchema.statics.unRegisterFromSession = async function(id, sID)
{
    //Wait for the retrieval of the session
    var session = await mongoose.model(SchemaConfig.Session).findById(sID).exec();

    if(!session)
        //If the session was not found, send a promise with a value of null
        return Promise.resolve(null);

    if(session.timing <= Date.now())
        //If the session was found but the timing was past due, send a promise with a value of null
        return Promise.resolve(null);

    //If the session is found with a suitable timing for the client, wait for the removal of the client from the session's list of attendees from the Session model
    var numAffected  = await mongoose.model(SchemaConfig.Session).removeClient(sID, id);


    if((!numAffected)||numAffected.nModified==0)
        //If no session was modified, return a promise with a value of null
        return Promise.resolve(null);
    else
    {
        //If there were sessions modified, wait for the removal of the fees from the business
        await mongoose.model(SchemaConfig.BusinessOwner).decrementFromWallet(session.businessID, session.admissionFee);

        //Wait for the addition of the admission fees back to the client with a penality deducion from the client
        await this.addToWallet(id, session.admissionFee - (session.admissionFee*serverConfig.sessionPenalty))

        //Return the deletion of the session from the client's list of registered sessions
        return this.deleteSessionBySessionID(id, sID);
    }
}

//Add a notification for the Client
ClientSchema.statics.addNotification = function(id, notificationContent)
{
    return this.findByIdAndUpdate(id, {$push:{notifications: {notification: notificationContent}}}, {safe: true, upsert: true, new: true}).exec();
}

//Delete a session that was registered by the Client given the session's _id
ClientSchema.statics.deleteSessionByID = function(id, sID)
{
    return this.findByIdAndUpdate(id, {$pull:{sessions: {_id: sID}}},{safe: true, new: true}).exec();
}

//Delete a session that was registered by the client given the sessionID
ClientSchema.statics.deleteSessionBySessionID = function(id, sID)
{
    return this.findByIdAndUpdate(id, {$pull:{sessions: sID}}).exec();
}

//Remove an item from the cart of the Client
ClientSchema.statics.removeFromCart =async function(id, cartID)
{
    //Wait for the updating
    var numAffected = await this.update({"_id":id}, {$pull:{cart:{_id : cartID}}}).exec();

    if(numAffected.nModified>0)
        //If the updating was carried out successfully, send a promise with a value of true
        return Promise.resolve(true);
    else
        //If the updating was not carried out successfully, send a promise with a value of false
        return Promise.resolve(false);
}

//Edit the cart of the Client
ClientSchema.statics.editCart = async function(id, cartID, quantity)
{
    //Wait for the updating
    var numAffected = await this.update({"_id":id, "cart._id": cartID}, {$set:{"cart.$.quantity": quantity}}).exec();

    if(numAffected.nModified>0)
         //If the updating was carried out successfully, send a promise with a value of true
        return Promise.resolve(true);
    else
        //If the updating was not carried out successfully, send a promise with a value of false
        return Promise.resolve(false);
}

//Addition of items to the cart
ClientSchema.statics.addToCart = async function(id, cartContent)
{
    //Wait for the check
    var hasProd = await mongoose.model(SchemaConfig.BusinessOwner).hasProduct(cartContent.ownerID, cartContent.ID);

    if(hasProd)
        //If the BusinessOwner has the product, return the updating of the cart
        return this.findByIdAndUpdate(id, {$push:{cart: cartContent}}, {safe: true, upsert: true, new: true}).exec();
    else
    {
        //If the BusinessOwner does not have the product, return a promise with a value of false
        return Promise.resolve(false);
    }
}

//Purchase of an item by the Client
ClientSchema.statics.purchaseProduct = async function(id, bID, pID, count)
{
    //Wait for the decrementing of the product count
    var isPurc = await mongoose.model(SchemaConfig.BusinessOwner).decrementProductCount(bID, pID, count);

    if(isPurc)
        //If the decrementing of the product was carried out successfully, send a promise with a value of true
        return Promise.resolve(true);
    else
        //If the decrementing of the product was not carried out successfully, send a promise with a value of null
        return Promise.resolve(null);
}

//Purchase of all items in the cart of the Client
ClientSchema.statics._purchaseAll = async function(id, client)
{
    //Initalize of the variables required to keep track of the purchase procedure
    var Client = this;
    var purcs = [];
    var valid = true;
    var rejCause;

    //For each cart item
    for(let cart of client.cart)
    {
        //Wait for the purchase of this cart item
        var purc = await Client.purchaseProduct(id, cart.ownerID, cart.ID, cart.quantity);
        if(purc)
            //If the purchase of that item was carried out successfully, add the item to the purcs array
            purcs.push(cart);
        else
        {
            //If the purchase of that item was not carried out successfully, break out of the loop indicating using valid flag being set to false
            valid = false;
            rejCause = cart;
            break
        }
    }
    if(valid)
        //If the purchase of all items was carried out successfully, retun a promise with a value of the items in the cart purchased
        return Promise.resolve(purcs);
    else
    {
        //If the purchase of all items was not carried out successfully, for each of the "purchased" items
        async.forEach(purcs, async function(cart, callback)
        { 
            //Wait for the rollback of the purchase by incrementing the product count at the BusinessOwner
            var inc = await mongoose.model(SchemaConfig.BusinessOwner).incrementProductCount(cart.ownerID, cart.ID, cart.quantity)

            if(!inc)
                //If the incrementing of the product count was not carried out successfully, return an error with a message that the purchase could not have been rolled back
                return new Error("Could not roll back purchase");
            else
            callback();
        }, function(err) 
        {
            if(err)
            {
                //If there was an error, display that error
                logger.debug(err);
                throw err;
            }
        });
        //reject the promise with a value of rejCause
        return Promise.reject(rejCause);
    }
}

//Purchase of all items in the cart of the Client
ClientSchema.statics.purchaseAll = async function(id, client)
{
    //Wait for the purchase of all items in the cart
    var purchase = await this._purchaseAll(id, client);

    if(purchase && purchase.length > 0)
        //If there was a purchase if items that was carried out successfully, wait for the clearing of the cart
        await this.clearCart(id);

    //Return a promise with a value of the purchase
    return Promise.resolve(purchase);
}

//Clear the cart of the client
ClientSchema.statics.clearCart = function(id)
{
    return this.findByIdAndUpdate(id, {cart: []}).exec();
}

//Read the notification of the Client
ClientSchema.statics.readNotification = async function (id)
{
    //Wait for the retrieval of the client
    var client = await this.findById(id).exec(); 

    //For each notification
    async.forEach(client.notifications, function (notification, callback)
    {
        //Set the notification status to read          
        notification.read = true;
        callback();
    }, function(err) 
    {
        if(err)
            //If there was an error, throw an error
            throw err;
        else
            //If there was no error, save the document
            client.save();
    });
    //Return a promise with a value of true 
    return Promise.resolve(true);
}

//Get the weight progress of the client
ClientSchema.statics.getMyWeightProgress = function (id)
{
    return this.findById(id).select("weightProgress").exec();
}

//Update the weight progress of the client
ClientSchema.statics.updateMyWeightProgress = function (id, weight)
{
    return this.findByIdAndUpdate(id, {$push: {weightProgress: {weight:weight, date:Date.now()}}}).exec();
}

//Reset the weight progress of the client
ClientSchema.statics.resetMyWeightProgress = function (id)
{
    return this.findByIdAndUpdate(id, {weightProgress: []}).exec();
}

//Get the session that the Client are registered in
ClientSchema.statics.getAllSessions = async function (id)
{
    return this.findById(id).select('sessions').populate('sessions', '-clients').exec()
}

//Add to the wallet of the Client
ClientSchema.statics.addToWallet = async function (id,amount)
{
    return this.findByIdAndUpdate(id,{$inc:{'wallet.balance': amount}}).select('wallet').exec();
}

//Remove from the wallet of the Client
ClientSchema.statics.removeFromWallet = async function (id,amount)
{
    //Wait for the updaint
    var client = await this.findOneAndUpdate({_id: id,"wallet.balance":{$gte:amount}},{$inc:{'wallet.balance': -1*amount}}).exec();


    if(!client)
        //If the removal of the funds from the wallet was not successful, return a promise with a value of null
        return Promise.resolve(null);

    //If the removal of the funds from the wallet was successful, return a promise with a value of true
    return Promise.resolve(true);
}

//Subscription to a BusinessOwner by the Client
ClientSchema.statics.subscribeToBusiness = async function(id, busID, optionID)
{
    //Wait for the retrieval of the client
    var client = await this.findById(id);

    if(!client)
        //If the client was not found, return a promise with a message stating that the client could not be found
        return Promise.reject({message: 'Could not find client'});

    //Wait for the retrieval of the owner
    var business = await mongoose.model(SchemaConfig.BusinessOwner).findById(busID);
    if(!business)

        //If the owner was not found, return a promise with a message stating that the client could not be found
        return Promise.reject({message: 'Could not find business'});
    if(!business.approved)

        //If the owner was not yet approved, return a promise with a message stating that the business is not approved
        return Promise.reject({message: 'Business is not approved'});

    //Set the membershipOption to the membership options subdocument given the optionID    
    var membershipOption = business.membershipOptions.id(optionID);

    if(!membershipOption)
        //If the membershipOption was not retrieved successfully, return a promise with a message stating that the membership option could not be found
        return Promise.reject({message: 'Could not find membership option'});

    //Wait for the removal of the cost from the client's wallet
    var removedCredit = await this.removeFromWallet(id, membershipOption.cost);

    if(!removedCredit)
        //If the removal of the cost was not carried out successfully, return a promise with a message stating that the client does not have enough credit
        return Promise.reject({message: 'You do not have enough credit'});

    //Calculate the end date of the subscription
    var gDate = moment().add(membershipOption.months, 'months');

    //Wait for the subscription
    var subscription = await mongoose.model(SchemaConfig.Membership).addMembership(busID, id, gDate);
    if(!subscription)
    {
        //If the subscription was not carried out successfully, rollback and add the cost back to the client's wallet
        await this.addToWallet(id, membershipOption.cost);

        //Return a promise with a message that the client could not subscribe to the business
        return Promise.reject({message: 'Could not subscribe to business'});  
    }
    else
    {
        //If the subscription was carried out successfully, wait for the addition of the cost to the owner's wallet
        await mongoose.model(SchemaConfig.BusinessOwner).addToWallet(busID, membershipOption.cost);

        //return a promise with value of true
        return Promise.resolve(true);
    }
}

//Decrement from the wallet of the client
ClientSchema.statics.decrementFromWallet = async function (id,amount)
{
    //Wait for the updating
    var client = await this.findOneAndUpdate({_id: id},{$inc:{'wallet.balance': -1*amount}}).exec();

    if(!client)
        //If the updating was not carried out successfully, return a promise with a value of null
        return Promise.resolve(null);

    //If the updating was carried out successfully, return a promise with a value of true
    return Promise.resolve(true);
}



module.exports = mongoose.model(SchemaConfig.Client, ClientSchema);;
