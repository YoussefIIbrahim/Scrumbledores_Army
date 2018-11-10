var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var Schema = mongoose.Schema;
var triggers = require('./triggers');
var SchemaConfig = require('../../config/schemaNames');
var logger = require('../../config/logger');
var group = require('group-array');
var async = require('async')
var SchemaConfig = require('../../config/schemaNames')

var OrderSchema = new Schema
({
    //_id of the BusinessOwner in the BusinessOwner model
    businessID : {type: mongoose.SchemaTypes.ObjectId, required: true, ref: SchemaConfig.BusinessOwner},

    //_id of the Client in the Client model
    clientID : {type: mongoose.SchemaTypes.ObjectId, required: true, ref: SchemaConfig.Client},

    //Status of the order
    status: {type: String, required:true, enum: ['Pending', 'Delivering', 'Delivered', 'Refunded'], default: "Pending"},
    dateCreated: {type: Date, required:true, default: Date.now()},
    dateUpdated: {type: Date},

    //The total of the order
    total: {type: Number,required: true},

    //Array of the items ordered
    order:
    [{
        productID: {type: String, required: true},
        quantity : {type: Number, required: true},
        price: {type: Number, required: true}
    }],

    //Payment type chosen by the CLient
    paymentType: {type: String, enum: ['Cash On Delivery', 'Wallet']}
})

//Creating indices for the businessID and the clientID
OrderSchema.index({"businessID": 1}, {sparse:true});
OrderSchema.index({"clientID": 1}, {sparse:true});
OrderSchema.index({"businessID": 1,"clientID": 1}, {sparse:true});
OrderSchema.index({"_id": 1,"order.productID": 1}, {sparse:true});

//Add an Order
OrderSchema.statics.addOrder = function(clientID, cart, paymentType)
{
    //Initalize variables model for thi model and an empty array busCarts
    var model = this;
    var busCarts = {};

    //For each cart element
    async.forEach(cart, async function (cartItem, callback)
    {
        //Set the busID variable to the item's ownerID
        var busID = cartItem.ownerID;

        //Create an empty array nCart
        var nCart = {};

        //Wait for the retrieval of the product info
        var prodInfo = await mongoose.model(SchemaConfig.BusinessOwner).getProdInfo(busID, cartItem.ID);

        //Assign the nCart info to the prodInfo
        nCart.productID = prodInfo.prodID;
        nCart.quantity = cartItem.quantity;
        nCart.price = prodInfo.cost;

        if(!busCarts[busID])
            //If there were no elements added, set the owner's items to an empty array with a total of 0.0
            busCarts[busID] = {items:[], total:0.0};

        //Add the nCart to the busCarts in the owner's index in the array
        busCarts[busID].items.push(nCart);

        //Add to the total the total cost of the item given the price and quantity
        busCarts[busID].total += cartItem.quantity * prodInfo.cost;
        callback();
    }, function(err)
    {
        if(err)
            //If an error occured, thhrow an error
            throw err;
        else
        {
            //For each BusinessOwner in the busCarts array
            for (var prop in busCarts)
            {
                //Create a new order to be added to the Order model
                var newOrder = new model
                ({
                    businessID: prop,
                    clientID: clientID,
                    total: busCarts[prop].total,
                    order: busCarts[prop].items,
                    paymentType: paymentType
                })
                //Save the Order
                newOrder.save();

                //Add a notification for the BusinessOwner notifying them of the order
                mongoose.model(SchemaConfig.BusinessOwner).addNotification(prop, "A pending purchase of total:" + busCarts[prop].total + " has been made from your store");
            }
        }
    });

    //Return a promise with a value of true
    return Promise.resolve(true);
}

//Get the business orders with a certain status of a certain BusinessOwner
OrderSchema.statics.getBusinessOrders = function(busID)
{
    return this.find({businessID: busID}).populate({path:'clientID',select:'address ownerID',populate:{path:'ownerID',select:'username'}}).exec();
}

//Get the client orders with a certain status of a certain Client
OrderSchema.statics.getClientOrders = function(cID)
{
    return this.find({clientID: cID}).populate('businessID','organizationName address phoneNumber').exec();
}

//Change the order status of a certain Order
OrderSchema.statics.changeOrderStatus = async function(orderID, ownerID, status)
{
    //Wait for the retrieval of the order
    var order = await this.findById(orderID).exec();

    if(!order)
        //If the order was not found, reject the promise with a message stating that the order could not be found
        return Promise.reject({message:"Could not find order"})
    if(!order.businessID.equals(ownerID))
        //If the ownerID in the Order is not the same as the BusinessOwner'_id, reject the promise with a message stating that the order does not belong to you
        return Promise.reject({message:"This order does not belong to you"})

    if(order.status == 'Refunded' || order.status == 'Delivered')
        //If the order status is either Refunded or Delivered, reject the promise with a message stating that the order status can not be changed after reaching a final state of the order's status
        return Promise.reject({message:"Can not change order status after reaching a final status of:" + order.status});

    if(status == 'Pending')
        //If the order status to be changed to is Pending, reject the promise with a message stating that an order's status can not be changed to poending
        return Promise.reject({message:"Can not change an order's status to pending"})

    switch(status)
    {
       case 'Delivering':
       {
            //If the order status to be changed to is Delivering
            if(order.status != 'Pending')
                //If the order's status is not Pending, reject the promise with  message stating that the order's status can not be changed from the order's status to Delivering
                return Promise.reject({message:"Can not change an order's status from " + order.status + " to " +status})

            //Change the order status to delivering
            order.status = 'Delivering';

            //Save the Order
            await order.save();

            //Return a promise with a value of true
            return Promise.resolve(true);
       } break;
       case 'Delivered':
       {
            //If the order status to be changed to is Delivered
            if(order.status != 'Delivering')
                //If the order's status is not Delivering, reject the promise with a message stating that the order's status can not be changed from the order's status to Delivered
                return Promise.reject({message:"Can not change an order's status from " + order.status + " to " +status})

            if(order.paymentType == 'Wallet')
            {
                //If the paymentType is Wallet, wait for the addition of the order total to the BusinessOwner's wallet
                var added = await mongoose.model(SchemaConfig.BusinessOwner).addToWallet(ownerID, order.total);

                if(added)
                {
                    //If the addition of the order total to the BusinessOwner's wallet was successful, chnge the order status to Delivered
                    order.status = 'Delivered';

                    //Save the order
                    await order.save();

                    //Return a promise with a value of true
                    return Promise.resolve(true);
                }
                else
                    //If the addition of the order total to the BusinessOwner's wallet was not successful, reject the promise with a message stating that there was a failure in adding the credit to your account
                    return Promise.reject({message:"Failed to transfer credit to your account"})
            }
            else
            {
                //If the paymentType was Cash On Delivery, change the order status to Delivered
                order.status = 'Delivered';

                //Save the order
                await order.save();

                //Return a promise with a value of true
                return Promise.resolve(true);
            }
       } break;
       case 'Refunded':
       {
            //If the order status to be changed to is Refunded
            if(order.status != 'Pending' || order.status != 'Delivering')
                //If the order status is neither Pending nor Delivering, reject the promise with a message stating that the order's status can not be changed from the order's status to Refunded
                return Promise.reject({message:"Can not change an order's status from " + order.status + " to " + status})

            if(order.paymentType == 'Wallet')
            {
                //If the paymentType is Wallet, wait for the addition of the order total to the client' wallet
                var added = await mongoose.model(SchemaConfig.Client).addToWallet(order.clientID, order.total);
                if(added)
                {
                    //If the addition of the order total to the Client's wallet was successful, change the order status to Refunded
                    order.status = 'Refunded';

                    //Save the order
                    await order.save();

                    //Return a promise with a value of true
                    return Promise.resolve(true);
                }
                else
                    //If the addition of the order total to the Client's wallet was not successful, reject the promise with a message stating that there was a failure in the refunding of the product
                    return Promise.reject({message:"Failed to refund product"})
            }
            else
            {
                //If the paymentType was Cash On Delivery, change the order status to Refunded
                order.status = 'Refunded';

                //Save the order
                await order.save();

                //Return a promise with a value of true
                return Promise.resolve(true);
            }

       } break;
    }
}

//Refund Order for a client
OrderSchema.statics.clientRefundOrder = async function(orderID, clientID)
{
    //Wait for the retrieval of the order
    var order = await this.findById(orderID).exec();

    if(!order)
        //If the order was not found, reject the promise with a message stating that the order could not be found
        return Promise.reject({message:"Could not find order"})

    if(!order.clientID.equals(clientID))
        //If the clientID in the Order is not the same as the Client's_id, reject the promise with a message stating that the order does not belong to you
        return Promise.reject({message:"This order does not belong to you"})

    if(order.status != "Pending")
        //If the order status is not Pending, reject the promise with a message stating that you can onluy refund unprocessed orders
        return Promise.reject({message:"You can only refund unprocessed orders"});

    if(order.paymentType == 'Wallet')
    {
        //If the paymentType is Wallet, wait for the addition of the order total to the client's wallet
        var added = await mongoose.model(SchemaConfig.Client).addToWallet(clientID, order.total);

        if(added)
        {
            //If the addition of the order total to the Client's wallet was successful, change the order status to Refunded
            order.status = 'Refunded';

            //Save the order
            await order.save();

            //Return a promise with a value of true
            return Promise.resolve(true);
        }
        else
            //If the addition of the order total to the Client's wallet was not successful, reject the promise with a message stating that there was a failure in the refunding of the product
            return Promise.reject({message:"Failed to refund product"})
    }
    else
    {
        //If the paymentType was Cash On Delivery, change the order status to Refunded
        order.status = 'Refunded';

        //Save the order
        await order.save();

        //Return a promise with a value of true
        return Promise.resolve(true);
    }
}

//After updating, update the lastUpdated date
OrderSchema.pre('update', triggers.updateDates);
module.exports = mongoose.model(SchemaConfig.Order, OrderSchema);
