const nodemailer = require('nodemailer');
const mconfig = require('./mail');

var mailer = nodemailer.createTransport(mconfig);
module.exports = mailer;