var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var Schema = mongoose.Schema;
var config = require('../../config/serverConfigs');
var SchemaConfig = require('../../config/schemaNames');
var logger = require('../../config/logger');

var PasswordTokenSchema = new Schema(
{
    //The _id of the user in the User model
    accountID: {type : mongoose.SchemaTypes.ObjectId, unique: true, ref:SchemaConfig.User},
    expireAt: {type: Date, default: Date.now}
});

//Create an index for the expiry
PasswordTokenSchema.index({ expireAt: 1 }, { expireAfterSeconds : config.forgotPassTimeout});

//Save a Token after adding it
PasswordTokenSchema.methods.addToken = function()
{
    return this.save();
}

//Get a Token given its id
PasswordTokenSchema.statics.getTokenByID = function(id)
{
    return this.findById(id).exec();
}

//Get the Token given the account's id
PasswordTokenSchema.statics.getTokenByAccountID = function(aid)
{
    return this.findOne({accountID: id}).exec();
}

//Get the Token given the mail
PasswordTokenSchema.statics.getTokenByEmail = function(mail)
{
    return this.findOne({email: mail}).exec();
}
module.exports = mongoose.model(SchemaConfig.PassToken, PasswordTokenSchema);;




