var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var Schema = mongoose.Schema;
var triggers = require('./triggers');
var async = require('async');
var SchemaConfig = require('../../config/schemaNames');
var logger = require('../../config/logger');
var logger = require('../../config/logger');

var SessionSchema = new Schema(
{
    //_id of the BusinessOwner offering the session in the BusinessOwner model
    businessID: {type : mongoose.SchemaTypes.ObjectId, ref: SchemaConfig.BusinessOwner},
    title: {type: String, required: true},
    timing: {type: Date, required: true},
    description: {type: String, required: true},

    //Maximum number of attendees
    maxNumber: {type: Number},

    //Array of clients _id registered to the session
    clients:[{type: mongoose.SchemaTypes.ObjectId, required: true, ref: SchemaConfig.Client}],
    admissionFee:{type: Number, required:true},
    dateCreated: {type: Date, required:true, default: Date.now()},
    dateUpdated: {type: Date}
});

//Create an index for the clients
SessionSchema.index({_id: 1, "clients": 1}, {unique: true, sparse:true});

//After saving a Session
SessionSchema.post('save', async function(doc)
{
    try
    {
        //Wait for the addition of the session in the BusinessOwner's model
        await mongoose.model(SchemaConfig.BusinessOwner).addSession(doc.businessID, doc._id);
    }
    catch(error)
    {
        //If there was an error in the addition of the session, rollback and delete the session
        await SessionSchema.deleteSession(doc._id);

        //Throw an error
        throw error;
    }
});

//After removing a Session
SessionSchema.post('remove', async function(doc)
{
    //For each client registered to the session
    async.forEach(doc.clients,async function(client, callback)
    {
        //Wait for the deletion of the session in the client's model
        await mongoose.model(SchemaConfig.Client).deleteSessionBySessionID(client, doc._id);
        callback();
    },
    function(err)
    {
        if(err)
            //If there was an error, throw an error
            throw err
    });
});

//After updating, update the lastUpdated date
SessionSchema.pre('update', triggers.updateDates);


//Save a Session after adding it
SessionSchema.methods.addSession = function()
{
    return this.save();
}

//Add a client to the clients regsitered in the Session
SessionSchema.statics.addClient = function(id, cID)
{
    return this.update({_id: id, "clients": {$ne: cID}} , {$push: {clients:  cID}}, {safe: true, upsert: true, new: true}).exec();
}

//Remove a client from the clients regsitered in the Session
SessionSchema.statics.removeClient = function(id, cID)
{
    return this.update({_id:id}, {$pull:{clients:  cID}},{new:true}).exec();
}

//Delete a Session given it's id
SessionSchema.statics.deleteSession = async function(id)
{
    //Wait for the retrieval of the session
    var session = await this.findById(id).exec();

    //Wait for the removal of the session
    await session.remove()

    //Return a promise with value of true
    return Promise.resolve(true);
}

//Delete Sessions given their BusinessOwner's id
SessionSchema.statics.deleteSessionByOwnerId = async function(id)
{
    //Initalize variable model and set it to the Sessions model
    var model = this;

    //Wait for the retrieval of all session of the owner
    var session = await this.find({ownerID:id}).exec();

    //For each session
    async.forEach(session,async function(sess, callback)
    {
        //Remove the session from the model
        await model.deleteSession(sess._id);
        callback();
    },
    function(err)
    {
        if(err)
            //If there was an error, throw an error
            throw err
    });
    //Return a promise with value of true
    return Promise.resolve(true);
}
module.exports = mongoose.model(SchemaConfig.Session, SessionSchema);
