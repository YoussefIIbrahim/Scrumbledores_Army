const nodemailer = require('nodemailer');

var mailer =
{
    service: 'Gmail',
    auth: 
    {
        user: '253michaeltest@gmail.com',
        pass: 'michaeltest1234'
    }
};
module.exports = mailer;