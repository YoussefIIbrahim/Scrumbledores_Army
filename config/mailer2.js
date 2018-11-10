const nodemailer = require('nodemailer');
const mconfig = require('./mail2');

var mailer2 = nodemailer.createTransport(mconfig);
module.exports = mailer2;