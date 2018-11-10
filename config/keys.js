var fs = require('fs');
var config = require('./serverConfigs')
var privateKey = fs.readFileSync('./Keys/privateKey.pem');
var publicKey = fs.readFileSync('./Keys/publicCert.pem');
module.exports = 
{
    key: privateKey,
    cert: publicKey,
    passphrase: config.passPhrase
}