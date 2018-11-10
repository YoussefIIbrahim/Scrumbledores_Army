var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var Schema = mongoose.Schema;
var triggers = require('./triggers');
var SchemaConfig = require('../../config/schemaNames');
var logger = require('../../config/logger');

var HomeAnnouncementsSchema = new Schema
({    
      body: {type: String, required:true},
      date: {type:Date , required:true, default:Date.now()},
      dateCreated: {type: Date, required:true, default: Date.now()},
      dateUpdated: {type: Date}
});

//After updating, update the lastUpdated date
HomeAnnouncementsSchema.pre('update', triggers.updateDates);

//Add a HomeAnnouncement
HomeAnnouncementsSchema.methods.addAnnouncement = function()
{
    return this.save();
}
module.exports = mongoose.model(SchemaConfig.HomeAnnouncemens, HomeAnnouncementsSchema);

