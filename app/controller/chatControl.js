var User = require('../models/user');
var Token = require('../models/passToken');
var Owner = require('../models/businessOwner');
var Client = require('../models/client');
var Session = require('../models/session');
var Announcement = require('../models/homeAnnouncments');
var config = require('../../config/serverConfigs');
var mailer = require('../../config/mailer');
var jwt = require ('jsonwebtoken');
var logger = require('../../config/logger');
var io = require('socket.io');

var users = [];
var connections = [];
var chatServer;

var initServer = function(server)
{
  chatServer = io.listen(server);
  chatServer.sockets.on('connection', onConnect);
}
var onConnect = function(socket)
{
  connections.push(socket);
  logger.info('Connected %s sockets connected', connections.length);
  socket.on('disconnect', data => controller.onDisconnect(socket, data));

  socket.on('send message', data => controller.onData(socket, data));

  socket.on('new user', (data, callback) => controller.onAccess(socket, data, callback));
}
var updateUsernames = function()
{
    chatServer.sockets.emit('get users', users);
}
var controller =
{
    onDisconnect:function(socket, data)
    {
      // disconnect
      users.splice(users.indexOf(socket.username), 1);
      updateUsernames();
      connections.splice(connections.indexOf(socket), 1);
      logger.info('disconnected %s sockets connected', connections.length);
    },
    onData:function(socket, data)
    {
      if(data.message && data.message.length > 0)
        chatServer.sockets.emit('new', {username:socket.username, id:socket.businessID, message:data.message});
    },
    onAccess: async function(socket, data, callback)
    {
      if(!data.token || !data.id)
        callback(false);
      jwt.verify(data.token, config.JWTKey, async function(err, decoded)
      {
          if (err)
              callback(false)
          else
          {
              var decuser = await User.findById(decoded._id).exec();
              if(!decuser)
                  callback(false);
              else
              {
                  socket.username = decuser.username;
                  var user = {};
                  user.username = socket.username;
                  user.businessID = data.id ;

                  var b = true ;
                  if(users.includes(socket.username))
                  {
                    b = false ;
                  }

                  if(b)
                  {
                    users.push(user);
                    callback(true);
                  }
                  else
                  {
                    callback(false);
                  }
                  logger.info(users);
                  updateUsernames();
              }
          }
      });
    },
    rebootServer: function()
    {
      users = [];
      connections = [];
    }
};
module.exports = initServer;
