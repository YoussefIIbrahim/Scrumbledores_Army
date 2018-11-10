var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var Schema = mongoose.Schema;
var triggers = require('./triggers');
var Session = require('./session');
var async = require('async');
var config = require('../../config/serverConfigs')
var SchemaConfig = require('../../config/schemaNames');
var logger = require('../../config/logger');
var moment = require('moment');

  var BusinessOwnerSchema = new Schema({
        //_id of this user in the User model
        ownerID: {type : mongoose.SchemaTypes.ObjectId, unique: true, ref: SchemaConfig.User},

        //Array of the products provided by this BusinessOwner with their details (productID is the ID given by the business)
        products:
        [{
            productID: {type: String, required: true},
            productName: {type: String, required: true},
            quantity: {type: Number, required: true, default:0},
            price: {type: Number, required: true}
        }],

        //Array of announcements made by the business
        announcements:
        [{
          body: {type: String, required: true},
          date: {type: Date, required:true, default: Date.now()}
        }],

        //Array of notifications of the BusinessOwner alongside their read status
        notifications:
        [{
            notification:{type: String, required: true},
            read:{type: Boolean, required: true, default: false}
        }],

        //Array of membership options offered by the BusinessOwner
        membershipOptions:
        [{
            cost:{type: Number, required: true},
            months:{type: Number, required: true}
        }],

        //The wallet containing the points of the BusinessOwner
        wallet: {balance:{type: Number, required: true, default: 0.00}},

        //Array of sessions provided by the BusinessOwner (References the Sessions model)
        sessions:[{type : mongoose.SchemaTypes.ObjectId , ref: SchemaConfig.Session}],

        //Array of evaluations provided by the client for the entity(references evaluation model)
        evaluations:[{type : mongoose.SchemaTypes.ObjectId , ref: SchemaConfig.Evaluation}],

        //Category of the BusinessOwner which has a value amongst given options
        category: {type: String, required:true, enum: ['Personal Trainer', 'Dance Classes', 'Yoga and Meditation', 'Cardio', 'Crossfit', 'Martial Arts', 'Gyms', 'Other']},


        ownerName: {type: String, required:true},
        organizationName: {type: String, required:true, unique: true},
        phoneNumber: {type: String, required:true, unique: true},
        address: {type: String, required:true},
        description: {type: String, required:true},
        approved: {type: Boolean, default: false},
        website: {type: String, required:false},
        dateCreated: {type: Date, required:true, default: Date.now()},
        dateUpdated: {type: Date}
  });

//Creating indices for the subdocuments
BusinessOwnerSchema.index({_id: 1, "notifications.notification": 1}, {sparse:true});
BusinessOwnerSchema.index({_id: 1, "products.productID": 1}, {unique:true, sparse:true});
BusinessOwnerSchema.index({_id: 1, "sessions": 1}, {unique: true, sparse:true});
BusinessOwnerSchema.index({_id: 1, "evaluations": 1}, {unique: true, sparse:true});
BusinessOwnerSchema.index({_id: 1, "announcements.body": 1}, {sparse:true});

//After saving a BusinessOwner
BusinessOwnerSchema.post('save', async function(doc)
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

//After removng a BusinessOwner
BusinessOwnerSchema.post('remove',async function(doc)
{
    //Delete sessions given by the BusinessOwner in the Sessions model
    await mongoose.model(SchemaConfig.Session).deleteSessionByOwnerId(doc._id);

    //Delete evaluations made about the BusinessOwner in the Evaluations model
    await mongoose.model(SchemaConfig.Evaluation).removeAllBusinessEvaluations(doc._id);

    //Delete memberships given by this BusinessOwner in the Membership model
    await mongoose.model(SchemaConfig.Membership).removeAllBusinessMemberships(doc._id);

    //Delete user from user schema
    await mongoose.model(SchemaConfig.User).delete(doc.ownerID);

});

//After updating, update the lastUpdated date
BusinessOwnerSchema.pre('update', triggers.updateDates);

//Save a BusinessOwner after adding them
BusinessOwnerSchema.methods.addOwner = function()
{
    return this.save();
}

//Delete a BusinessOwner given their id
BusinessOwnerSchema.statics.delete = function(id)
{
    return this.findByIdAndRemove(id).exec();
}

//Retrieve a BusinessOwner given their id
BusinessOwnerSchema.statics.getBusinessOwnerByID = function(id)
{
    return this.findById(id).exec();
}

//Retrieve a BusinessOwner given their User id
BusinessOwnerSchema.statics.getBusinessOwnerByOwnerID = function(oid)
{
    return this.findOne({ownerID: oid}).exec();
}

//Retrieve a BusinessOwner given their name
BusinessOwnerSchema.statics.getBusinessOwnerByName = function(name)
{
    return this.findOne({name: name}).exec();
}

//Add an evaluation for the BusinessOwner
BusinessOwnerSchema.statics.addEvaluation = async function(id, evaluation)
{
    //Add evaluation in the Evaluation model
    var evalu = await mongoose.model(SchemaConfig.Evaluation).addOrUpdateEvaluation(evaluation);

    if(!evalu)
        //If no evaluation was added, return a promise with a value of null
        return Promise.resolve(null);
    else
        //If the evaluation was added successfully, return a promise with a value of true
        return Promise.resolve(true);
}

//Add a product to the BusinessOwner
BusinessOwnerSchema.statics.addProduct = function(id, prod)
{
    return this.findOneAndUpdate({_id: id, "products.productID":{$ne: prod.productID}} , {$push: {products: prod}}, {safe: true, new: true}).exec();
}

//Update a product offered by the BusinessOwner
BusinessOwnerSchema.statics.updateProduct = async function(id, prod)
{
    //BusinessOwner.findByIdAndUpdate(id, {$push:{products: prod}}, {safe: true, upsert: true, new: true}, callback);

    var updated = await this.update({_id: id, "products._id": prod.productID } , {$set: {"products.$.quantity": prod.quantity, "products.$.price": prod.price, "products.$.productName": prod.productName}}, {safe: true, new: true}).exec();
    if(updated.nModified>0)
        return Promise.resolve(true);
    return Promise.resolve(null);
}
//delete product using the _id
BusinessOwnerSchema.statics.deleteProductByID = async function(id, prodID)
{
    //check if can remove
    var removed = await this.update({_id: id}, {$pull:{products: {_id: prodID}}}, {safe: true, new: true}).exec();
    //return removed or not
    if(removed.nModified>0)
            return Promise.resolve(true);
    return Promise.resolve(null)
}
//delete product using the productID
BusinessOwnerSchema.statics.deleteProductByProductID = async function(id, prodID)
{
    //check if can remove
    var removed = await this.update({_id: id}, {$pull:{products: {productID: prodID}}}, {safe: true, new: true}).exec();
    //return removed or not
    if(removed.nModified>0)
            return Promise.resolve(true);
    return Promise.resolve(null)
}

//Add an anouncement made by the BusinessOwner
BusinessOwnerSchema.statics.addAnnouncement = async function(id, annon)
{
    //Wait for the retrieval of the BusinessOwner
    var owner = await this.findById(id).exec();

    if(!owner)
        //If the BusinessOwner was not found, return a value of false
        return false;

    //If the BusinessOwner is found, add the announcement provided to the announcements array in the model
    owner.announcements.push(annon);

    //Save the change in the BusinessOwner
    var saved = await owner.save();

    //return the newly saved announcement
    return saved.announcements[saved.announcements.length - 1];
}

//Delete an announcement given it's subdocument _id
BusinessOwnerSchema.statics.deleteAnnouncementByID = function(id, annonID)
{
    return this.findByIdAndUpdate(id, {$pull:{announcements: {_id: annonID}}},{new:true}).exec();
}

//Add a session provided by the BusinessOwner
BusinessOwnerSchema.statics.addSession = function(id, sID)
{
    return this.findByIdAndUpdate(id, {$addToSet:{sessions: sID}}, {safe: true, new: true}).exec();
}

//Add a membership option provided by the BusinessOwner
BusinessOwnerSchema.statics.addMembershipOption = function(id, months, price)
{
    return this.findByIdAndUpdate(id, {$push:{membershipOptions: {cost: price, months:months}}}, {safe: true, new: true}).exec();
}

//Delete a membership option offered by the BusinessOwner given it's _id subdocument
BusinessOwnerSchema.statics.removeMembershipOption = async function(id, mID)
{
    //Wait for the removal of the membership option
    var removed = await this.update({_id: id}, {$pull:{membershipOptions: {_id: mID}}}, {safe: true, new: true}).exec();

    if(removed.nModified>0)
        //If there were any membership options modified, return a promise with a value of true
        return Promise.resolve(true);

    //If there were no membership options modified, return a promise with a value of null
    return Promise.resolve(null);
}

//Delete a sessions offered by the BusinessOwner given it's sessionID
BusinessOwnerSchema.statics.deleteSessionBySessionID = async function(id, sID)
{
    //Wait for the removal of the session
    var numAffected = await this.update({ _id: id } , {$pull:{sessions: sID}},{new:true});

    if(numAffected.nModified > 0)
    {
        //If there were any sessions modified, remove the session from the Sessions model
        mongoose.model(SchemaConfig.Session).deleteSession(sID);

        //Return a promise with the value of the sessionID
        return Promise.resolve(sID);
    }

    //If there were no sessions modified, return a promise with a value of null
    else return Promise.resolve(null);
}

//Remove a BusinessOwner given their _id
BusinessOwnerSchema.statics.removeOwnerByID = async function(id)
{
    //Wait for the retrieval of the owner
    var owner = await this.findById(id).exec();

    if(!owner)
        //If no owner was found, return a value of false
        return false;

    //If the owner was found, remove the owner
    owner.remove();

    //return a value of true
    return true;
}

//Decrement the count of a product provided by the BusinessOwner
BusinessOwnerSchema.statics.decrementProductCount = async function(id, pID, count)
{
    //Wait for the retrieval of the owner
    var doc = await this.findById(id).exec();

    //If the owner was not found, return a promise with a value of the value null
    if(!doc) return Promise.resolve(null);

    //If the owner was found, assign to the subDoc variable the product subdocument in the model given the productID
    var subDoc = doc.products.id(pID);


    if(subDoc.quantity >= count)
    {
        //If the quantity of the product is greater than or equal to the count, subtract the count from the qunatity
        subDoc.quantity -= count;

        //Save the document
        doc.save();

        //Return a promise with a value of true
        return Promise.resolve(true);
    }

    //Return a promise with a value of false
    return Promise.resolve(false);
}

//Increment the count of a product provided by the BusinessOwner
BusinessOwnerSchema.statics.incrementProductCount = async function(id, pID, count)
{
    try
    {
        //Wait for the updating
        var numAffected = await this.update({'_id': id, 'products._id': pID}, {$inc: { 'products.$.quantity': count }}).exec()

        if(numAffected.nModified > 0)
            //If there any products modified, return a promise with a value of true
            return Promise.resolve(true);
        else
            //If there no products modified, return a promise with a value of false
            return Promise.resolve(false);
    }
    catch(error)
    {
        //If there was an error, return a promise with a value of false
        return Promise.resolve(false);
    }
}

//Check if the BusinessOwner has a certain product
BusinessOwnerSchema.statics.hasProduct = async function(id, pID)
{
    //Wait for the retrieval of the owner
    var doc = await this.findById(id).exec();

    //If the owner was not found, return a promise with a value of false
    if(!doc) return Promise.resolve(false);

    //If the owner was found, send a promise with a value of the subdocument with the produtID given
    else return Promise.resolve(doc.products.id(pID));
}

//Add a notification to the BusinessOwner
BusinessOwnerSchema.statics.addNotification = function(id, notificationContent)
{
    return this.findByIdAndUpdate(id, {$push:{notifications: {notification: notificationContent}}}, {safe: true, upsert: true, new: true}).exec();
}

//Read the notification of the BusinessOwner
BusinessOwnerSchema.statics.readNotification = async function (id)
{
    //Wait for the retrieval of the owner
    var owner = await this.findById(id).exec();

    //For each notification
    async.forEach(owner.notifications, function (notification, callback)
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
            owner.save();
    });

    //Return a promise with a value of true
    return Promise.resolve(true);
}

//Get the price of a product offered by the BusinessOwner
BusinessOwnerSchema.statics.getPrice = async function(businessID,productID)
{
    //Wait for the retrieval of the owner
    var business = await this.findById(businessID).exec();

    if(!business)
        //If the owner was not found, return a promise with a value of null
        return Promise.resolve(null);

    //Set the product variable to the product subdocument given the productID
    var product = business.products.id(productID);

    if(!product)
        //If the product was not found, return a promise with a a value of null
        return Promise.resolve(null);

    //If the product was found, return a promise with a value of the price of the product
    return Promise.resolve(product.price);
}

//Get the details of a product offered by the BusinessOwner
BusinessOwnerSchema.statics.getProdInfo = async function(id, prodID)
{
    //Wait for the retrieval of the owner's products
    var business = await this.findById(id).select('products').exec();

    if(!business || !business.products.id(prodID))
        //If neither the business nor the product were found, return a promise with a value of null
        return Promise.resolve(null);
    else
    {
        //If both the owner and the product are found, set the prod variable to the subdocument of the product given the productID
        var prod = business.products.id(prodID)

        //Return a promise with a value of the productID and price
        return Promise.resolve({prodID:prod.productID, cost:prod.price});
    }
}

//Add to the wallet of the BusinessOwner
BusinessOwnerSchema.statics.addToWallet = async function (id,amount)
{
    return this.findByIdAndUpdate(id,{$inc:{'wallet.balance': amount}}).select('wallet').exec();
}

//Remove from the wallet of the BusinessOwner
BusinessOwnerSchema.statics.removeFromWallet = async function (id,amount)
{
    //Wait for the upadating
    var owner = await this.findOneAndUpdate({_id: id,"wallet.balance":{$gte:amount}},{$inc:{'wallet.balance': -1*amount}}).exec();

    if(!owner)
        //If the removal of the funds from the wallet was not successful, return a promise with a value of null
        return Promise.resolve(null);

    //If the removal of the funds from the wallet was successful, return a promise with a value of true
    return Promise.resolve(true);
}

//Add client to the subscribers of the BusinessOwner
BusinessOwnerSchema.statics.subscribeClient = async function (id, clientID, duration)
{
    //Calculate the end date of the subscription
    var gDate = moment().add(duration, 'months').format();

    //Wait for the subscription
    var subscribed = await mongoose.model(SchemaConfig.Membership).addMembership(id, clientID,gDate);

    if(!subscribed)
        //If the subscription was not carried out successfully, reject the promise with a messae stating that the client could not be subscribed
        return Promise.reject({message: "Could not subscribe client"});
    else
        //If the subscription was carried out successfully, return a promise with a value of true
        return Promise.resolve(true);
}

//Get the approval status of the BusinessOwner
BusinessOwnerSchema.statics.isApproved = async function (id)
{
    //Wait for the retrieval of the owner
    var owner = await this.findById(id).exec();

    if(!owner)
        //If the owner was not found, send a promise with a value of false
        return Promise.resolve(false);
    else
        //If the owner was found, send a promise with a value of the owner's approval status
        return Promise.resolve(owner.approved);
}

//Decrement from the wallet of the BusinessOwner
BusinessOwnerSchema.statics.decrementFromWallet = async function (id,amount)
{
    //Wait for the updating
    var owner = await this.findOneAndUpdate({_id: id},{$inc:{'wallet.balance': -1*amount}}).exec();

    if(!owner)
        //If the decrementing of the wallet was not carried out successfully, return a promise with a value of null
        return Promise.resolve(null);

    //If the decrementing of the wallet was carried out successfully, return a promise with a value of true
    return Promise.resolve(true);
}

//Get the details of a product offered by the BusinessOwner
BusinessOwnerSchema.statics.getItemInfo = async function(id, pID)
{
    //Wait for the retrieval of the owner
    var business = await this.findById(id).exec();

    if(!business)
        //If the owner was not found, return a message stating that the product info could not be retrieved alongside an organiationName of "Not Found"
        return {product:'Could not retrieve product Info', orgName: "Not found"}
    else
    {
        //If the owner is found, set the product variable to the product subdocument given the productID
        var product = business.products.id(pID);

        if(product)
            //If the product was found, return the product alongside the organizationName
            return {product:product, orgName: business.organizationName};
        else
            //If the product was not found, return a message stating that the product info could not be retrieved alongside the organiationName of the owner
            return {product:'Could not retrieve product Info', orgName: business.organizationName}
    }
}
//Add evaluation provided to the BusinessOwner
BusinessOwnerSchema.statics.addEval = function(id, eID)
{
    return this.findByIdAndUpdate(id, {$addToSet:{evaluations: eID}}, {safe: true, new: true}).exec();
}

BusinessOwnerSchema.statics.removeEval = function(id, eID)
{
    return this.findByIdAndUpdate(id, {$pull:{evaluations: eID}}, {safe: true, new: true}).exec();
}


module.exports = mongoose.model(SchemaConfig.BusinessOwner, BusinessOwnerSchema);;
