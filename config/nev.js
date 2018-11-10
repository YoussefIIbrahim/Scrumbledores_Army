var mailConfig = require('./mail');
var serverConfig = require('./serverConfigs');

var nevConfig = (User) =>
{
    var conf =
    {
        verificationURL: serverConfig.URL + "api/verifyaccount?token=${URL}",
        persistentUserModel: User,
        tempUserCollection: 'tempusers',
        expirationTime: serverConfig.verifyTimeout,

        transportOptions: mailConfig,
        verifyMailOptions: 
        {
            from: 'Do Not Reply <admin@gmail.com>',//change
            subject: 'Please confirm account',
            html: 'Click the following link to confirm your account:</p><p>${URL}</p>',
            text: 'Please confirm your account by clicking the following link: ${URL}'
        }
    }
    return conf;
}
module.exports = nevConfig;