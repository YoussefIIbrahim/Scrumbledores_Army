var RateLimit = require('express-rate-limit');

module.exports = 
{
    createAccountLimiter: new RateLimit
    ({
        windowMs: 60*60*1000,
        max: 5,
        delayMs: 0,
        message: "Too many registeration requests"
    }),
    forgotPasswordLimiter: new RateLimit
    ({
        windowMs: 60*60*1000,
        max: 5,
        delayMs: 0,
        message: "Too many change password requests"
    }),
    resendVerificationLimiter: new RateLimit
    ({
        windowMs: 60*60*1000,
        max: 5,
        delayMs: 0,
        message: "Too many verification mail requests"
    }),
    contactUsLimiter: new RateLimit
    ({
        windowMs: 60*1000,
        max: 1,
        delayMs: 0,
        message: "Max allowed is one request per minute"
    }),
    apiLimiter: new RateLimit
    ({
        windowMs: 60*1000,  
        max: 60, 
        delayMs: 0,
        message: "Too many requests try again later"
    }),
    purchaseLimiter: new RateLimit
    ({
        windowMs: 24*60*60*1000,
        max: 3, 
        delayMs: 0,
        message: "Max purchases exceeded for today"
    }),
    uploadLimiter: new RateLimit
    ({
        windowMs: 60*60*1000,
        max: 10, 
        delayMs: 0,
        message: "Max uploads exceeded"
    }),
    fileLimiter: new RateLimit
    ({
        windowMs: 60*60*1000,
        max: 100, 
        delayMs: 0,
        message: "Max files retreived"
    })
}