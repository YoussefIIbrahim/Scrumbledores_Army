/*
npm install express --save
npm install morgan
npm install mongoose
npm install --save path
npm install body-parser
npm install --save bcrypt-nodejs
npm install --save jsonwebtoken
*/
require("babel-polyfill");
require("babel-register");
var express = require('express');
var app = express();
var morgan = require('morgan');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var bodyParser = require('body-parser');
var router = express.Router();
var appRoutes = require('./app/routes/api')(router);
var fileRoutes = require('./app/routes/fileRoutes')(router);
var path = require('path');
var nev = require('email-verification')(mongoose);
var expressValidator = require('express-validator');
var serverConfig = require('./config/serverConfigs');
var validationConfig = require('./config/requestValidation');
var logger = require('./config/logger');

var limiters = require('./config/rateLimiter');
var fileUpload = require('express-fileupload');
var uploadLimits = require('./config/fileUpload');
var path = require('path');
var scheduler = require('node-schedule');
var schemaConfig = require('./config/schemaNames');
var schedularConfig = require('./config/scheduler');
var https = require('https');
var http = require('http');
var keys = require('./config/keys');
var helmet = require('helmet');
var helmetConfig = require('./config/helmetSettings');
var dbEvents = require('./app/models/events');
var chatControl= require('./app/controller/chatControl');
var io = require('socket.io');
global.appRoot = path.resolve(__dirname);

app.disable('x-powered-by');
//app.use(morgan('dev'));
app.use(helmet.hsts(helmetConfig));
app.use(bodyParser.json({
    limit: serverConfig.bodyLimit
}));
app.use(bodyParser.urlencoded({
    extended: true,
    limit: serverConfig.bodyLimit
}));
app.use(fileUpload(uploadLimits));
app.use(expressValidator(validationConfig));
app.use(express.static(__dirname + serverConfig.publicFolder));
app.use('/api', limiters.apiLimiter, appRoutes);
app.use(serverConfig.usersRoute, limiters.fileLimiter, fileRoutes);

// connect to db first


mongoose.connect('mongodb://admin:admin@ds137340.mlab.com:37340/scrumbledores_army', function(err)
    { //mongodb://admin:admin@ds137340.mlab.com:37340/scrumbledores_army
        if (err)
            logger.error("not connected : " + err);
        else
            logger.info('connected');

    });



app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/app/views/index.html'));

});
/*app.post('*', function(req, res)
{
    res.redirect('/public/app/views/pages/notFound.html');
});*/
var httpServer = http.createServer(app);
var chatServer = http.createServer(app);
var httpsServer = https.createServer(keys, app);
httpServer.listen(serverConfig.httpPort);
logger.info("running http server .... port : " + serverConfig.httpPort)
chatServer.listen(serverConfig.chatPort);
logger.info("running chat server .... port : " + serverConfig.chatPort)
httpsServer.listen(serverConfig.httpsPort);
logger.info("running https server .... port : " + serverConfig.httpsPort)


chatControl(httpServer);

scheduler.scheduleJob(schedularConfig.membership, () => {
    if (mongoose.model(schemaConfig.Membership))
        mongoose.model(schemaConfig.Membership).removeExpiredMemberShips();
});

process.nextTick(() => {
    for (var prop in dbEvents.init) {

        dbEvents.init[prop]();
    }
});
