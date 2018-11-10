var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var SchemaConfig = require('../../config/schemaNames');
var logger = require('../../config/logger');
var config = require('../../config/serverConfigs');
var async = require('async');
var logger = require('../../config/logger');


module.exports.init = 
{
    createAdmin: async function()
    {
        try
        {
            //Set the model variable to the User model
            var model = mongoose.model(SchemaConfig.User);

            //For each adminInfo found in the configuration
            async.forEach(config.adminInfo, async function (adminInformation, callback)
            { 
                //Wait for the retrieval of the admin
                var admin = await model.findOne({username:adminInformation.username, email:adminInformation.email});

                if(admin)
                    //If the admin was found, return
                    return;

                //If the admin was not found, create a new admin
                var admin = new model
                ({
                    username: adminInformation.username,
                    password: adminInformation.password,
                    email: adminInformation.email,
                    userType: 'Admin'
                })

                //Save the admin
                admin.save();
            }, function(err) 
            {
                if(err)
                    //If there was an error, display that error
                    logger.debug(err);
            }); 
        }
        catch(error)
        {
            //If there was an error, display a message sating that the database was not yet created
            logger.debug('DB not yet created')
        }
    }
}