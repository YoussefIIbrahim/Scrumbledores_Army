var winston = require('winston');
var Config = require('./serverConfigs')
var logger = new (winston.Logger)
({
    transports: 
    [
      new (winston.transports.Console)({ level: Config.logLevel })
      //new (winston.transports.File)({ filename: Config.logFileName + "_" + Date.now(), level: Config.logLevel })
    ]
})
module.exports = logger;