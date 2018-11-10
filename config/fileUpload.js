var serverConfig = require('./serverConfigs')
module.exports =  
{   
    limits:
    {
        fileSize: serverConfig.maxFileSize,
        fields: serverConfig.maxFields,
        files: serverConfig.maxFiles
    }
}