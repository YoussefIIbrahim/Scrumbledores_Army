var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');
var triggers = require('./triggers');
var nev = require('email-verification')(mongoose);
var nevConf = require('../../config/nev');
var validators = require('./validators');
var SchemaConfig = require('../../config/schemaNames');
var logger = require('../../config/logger');
var config = require('../../config/serverConfigs');
var rimraf = require('rimraf');
var async = require('async');

  var UserSchema = new Schema({

      //The _id of the user in the Client or the BusinessOwner schema (Not existant if userType is admin)
      ownerID: {type : mongoose.SchemaTypes.ObjectId, unique: true, sparse: true},
      username: {type: String, lowercase: true, required:true, unique:true, validate: validators.usernameValidator},
      password: {type: String, required:true, validate: validators.passwordValidator},
      email: {type: String, required: true, lowercase: true, unique: true, validate: validators.emailValidator},
      userType: {type: String, enum: ['Client', 'Admin', 'BusinessOwner']},
      dateCreated: {type: Date, required:true, default: Date.now()},
      dateUpdated: {type: Date}
  });


//Before saving a User
UserSchema.pre('save',function(next)
{
    //Set the newPass variable to the password provided
    var newPass = this.password;

    //Hash the password
    bcrypt.genSalt(10, (err, salt) =>
    {   
        bcrypt.hash(newPass, salt, (err, hash) =>
        {
            //If there was an error, go to the next function with the parameters given
            if(err) next(err, null);

            //If there was no error, hash the password
            newPass = hash;
            this.password = newPass;

            //Go to the next function with the given parameters
            next(null, this);
        });
    });
});

//After updating, update the lastUpdated date
UserSchema.pre('update', triggers.updateDates);

//After removing a User
UserSchema.post('remove', function(doc) 
{
    //Set the pathUser variable to the folder of the user
    var pathUser = config.usersFolder + doc._id;

    //Remove the folder of the user
    rimraf(pathUser, function () {});
});

//Save a User after adding them
UserSchema.methods.addUser = function(callback)
{
    this.save(callback);
}

//Compare a password with the password of the User
UserSchema.methods.comparePassword = function(pass, callback)
{
    bcrypt.compare(pass, this.password, function(err, isMatch)
    {
        //If there was an error, callback with the given parameters
        if(err) callback(err, null);

        //If there were no errors, callback with the given parameters
        else callback(null, isMatch);
    });
}

//Update the password of the User
UserSchema.statics.updatePassword = function(id, newPass, callback)
{
    //Intialize a variable model and set it to the model variable to the User model
    var model = this;

    //Hash the new password
    bcrypt.genSalt(10, function(err, salt)
    {   
        bcrypt.hash(newPass, salt, function(err, hash)
        {
            //If there was an error, callback with the parameters given
            if(err) callback(err, null);

            //If there was no error, hash the password
            newPass = hash;

            //Update the password in the user's model
            model.findOneAndUpdate({_id : id},{password : newPass} , callback);
        });
    });
}

//Delete a User given their id
UserSchema.statics.delete = async function(id)
{
    var user = await this.findById(id).exec();
    await user.remove();
     return Promise.resolve(true);
}

//Get a user given their id
UserSchema.statics.getUserByID = function(id)
{
    return this.findById(id).exec();
}

//Get a user given their ownerID
UserSchema.statics.getUserByOwnerID = function(oid)
{
    return this.findOne({ownerID: id}).exec();
}

//Get a User given their username
UserSchema.statics.getUserByUserame = function(username)
{
    return this.findOne({username: username}).exec();
}

//Get a user given their email
UserSchema.statics.getUserByEmail = function(email)
{
    return this.findOne({email: email}).exec();
}

var User = mongoose.model(SchemaConfig.User, UserSchema);

//Create the Schema for the temporary User model to be created given the User model
nev.configure(nevConf(User),
  function(error, options)
  {
      if(error)
        logger.debug(error);
  }
);

//Generate a temporary User model for Users yet to be registered
nev.generateTempUserModel(User, function(err, tmpModel)
{

    if(err)
        logger.debug(err);
});

module.exports = User;
module.exports.nev = nev;

