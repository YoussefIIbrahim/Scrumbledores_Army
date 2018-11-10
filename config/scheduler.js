var schedule = require('node-schedule');

var membershipRule = new schedule.RecurrenceRule();
membershipRule.hour = 0;
module.exports.membership = membershipRule;
