var serverConfig = require('./serverConfigs');

module.exports = 
{
    customValidators: 
    {
       isValidUserType: function(value)
       {
            return (value == "Client" || value == "BusinessOwner");
       },
       isValidPicType: function(value)
       {
            return serverConfig.picTypes.includes(value);
       },
       isProgram: function(value)
       {
           return serverConfig.docTypes.includes(value);
       },
       isPaymentType: function(value)
       {
           return serverConfig.purchaseOptions.includes(value);
       },
       isOrderStatusType: function(value)
       {
           return serverConfig.orderStatus.includes(value);
       },
       isValidCategory: function(value)
       {
           return serverConfig.ownerCategories.includes(value);
       },
       isValidGender: function(value)
       {
           return serverConfig.gender.includes(value);
       }
    }
};