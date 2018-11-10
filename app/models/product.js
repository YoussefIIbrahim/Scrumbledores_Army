var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var Schema = mongoose.Schema;
var triggers = require('./triggers');
var SchemaConfig = require('../../config/schemaNames');
var logger = require('../../config/logger');

var ProductSchema = new Schema(
    {
        productID: {type: String, required: true, unique: true},
        productName: {type: String, required: true, unique: true},
        dateCreated: {type: Date, required:true, default: Date.now()},
        dateUpdated: {type: Date}
        //add product details like nutrition facts ?
    })
ProductSchema.pre('update', triggers.updateDates);
ProductSchema.methods.addProduct = function()
{
    return this.save();
}
ProductSchema.statics.updateProductName = function(id, name)
{
    return this.findByIdAndUpdate(id, {productName: name}).exec();
}
ProductSchema.statics.removeProductByID = function(id, cb)
{
    return this.findByIdAndRemove(id, cb).exec();
}
ProductSchema.statics.removeProductByProductID = function(pid)
{
  console.log("here31");
  console.log(pid);
    return this.findOneAndRemove({productID: pid}).exec();
}
ProductSchema.statics.removeProductByName = function(name)
{
    return this.findOneAndRemove({productName: name}).exec();
}
ProductSchema.statics.getProductByName = function(name)
{
    return this.findOne({productName: name}).exec();
}
module.exports = mongoose.model(SchemaConfig.Product, ProductSchema);
