var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var Schema = mongoose.Schema;
var triggers = require('./triggers');
var SchemaConfig = require('../../config/schemaNames');
var logger = require('../../config/logger');
var group = require('group-array');
var async = require('async')
var SchemaConfig = require('../../config/schemaNames');
var scheduleConfig = require('../../config/scheduler');

var MembershipSchema = new Schema
({
    //The _id of the BusinessOwner in the BusinessOwner model
    businessID : {type: mongoose.SchemaTypes.ObjectId, required: true, ref: SchemaConfig.BusinessOwner},

    //The _id of the Client in the Client model
    clientID : {type: mongoose.SchemaTypes.ObjectId, required: true, ref: SchemaConfig.Client},
    dateEnds: {type: Date, required: true},
    dateCreated: {type: Date, required:true, default: Date.now()},
    dateUpdated: {type: Date},
})

//Create the indices
MembershipSchema.index({businessID: 1}, {sparse:true});
MembershipSchema.index({clientID: 1}, {sparse:true});
MembershipSchema.index({businessID: 1,clientID: 1}, {unique:true, sparse:true});
MembershipSchema.index({dateEnds: 1}, {sparse:true});

//After updating, update the lastUpdated date
MembershipSchema.pre('update', triggers.updateDates);

//Add a membership
MembershipSchema.statics.addMembership = async function(busID, clientID, dateEnds)
{
    //Wait for the retrieval of the client
    var client = mongoose.model(SchemaConfig.Client).findById(clientID).exec();

    if(!client)
        //If the client was not found, reject the promise with a message stating that the client is not registered
        return Promise.reject('Client is not registered')

    //Create a variable model and set it to the Membersip model
    var model = this;

    //Create membership
    var membership =  new model 
    ({
        businessID: busID,
        clientID: clientID,
        dateEnds: dateEnds
    })
    try
    {
        //Wait for the saving of the membership
        var saved = await membership.save();

        if(saved)
            //If the membership was saved successfully, return a promise with a value of true
            return Promise.resolve(true)
        else
            //If the membership was saved successfully, return a promise with a value of true
            return Promise.resolve(null)
    }
    catch(error)
    {
        //If there was an error, return a promise with a value of null
        return Promise.resolve(null)
    }
}

//Remove a Membership
MembershipSchema.statics.removeMemberShip = function(busID, clientID)
{
    this.findOneAndRemove({businessID: busID, clientID: clientID})
}

//Extend a Membership 
MembershipSchema.statics.extendMemberShip = async function(memberShipID, duration)
{
    //Wait for the retrieval of the memerbship
    var membership = await this.findById(memberShipID).exec();

    if(!membership)
        //If no membership was found, reject the promise with a message stating that the membership could not be found
        return Promise.reject({message:"could not find membership"});

    //Add the duration extension to calculate the new date when the membreship ends
    membership.dateEnds = membership.dateEnds.setMonth(membership.dateEnds.getMonth() + duration);

    //Wait for the saving of the membership
    var saved = await membership.save();

    if(!saved)
        //If the membership was not saved successfully, reject the promise with a message stating that the membership could not be extended
        return Promise.reject({message:"could not extend membership"})
    else
        //If the membership was saved successully, return a promise with a value of true
        return Promise.resolve(true);
}

//Remove a Membership
MembershipSchema.statics.removeExpiredMemberShips = function()
{
    this.remove({dateEnds: {$lte: Date.now()}});
}

//Remove all Memberships of a given BusinessOwner
MembershipSchema.statics.removeAllBusinessMemberships = function(busID)
{
    return this.remove({businessID:busID}).exec();
}
module.exports = mongoose.model(SchemaConfig.Membership, MembershipSchema);
