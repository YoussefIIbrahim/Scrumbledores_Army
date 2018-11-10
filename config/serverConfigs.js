module.exports =
{
    URL: 'http://54.244.211.116:8000/',
    verifyTimeout: 86400,
    forgotPassTimeout: 86400,
    JWTKey: 'pjwtsec',
    logLevel: 'debug',
    logFileName: 'serverLog',
    maxAge: 150,
    bodyLimit: '5mb',
    httpPort: process.env.PORT || 8000,
    httpsPort: 8443,
    chatPort: 8001,
    publicFolder : '/public',
    gender: ['Male', 'Female','Other'],
    picTypes : ['ProfilePicture','CoverPhoto', 'Product', 'Session', 'Announcement', 'OwnerAnnouncement'],
    docTypes : ['FitnessProgram','NutritionProgram'],
    maxFileSize: '3mb',
    maxFields: '5',
    maxFiles: 5,
    usersFolder : './public/Users/',
    announcementsFolder : './public/HomeAnnouncements',
    usersRoute: '/Users',
    defaultPic: "/FNF.jpg",
    defaultProductPic: "/DP.png",
    defaultAnnouncementPic: "/DAP.jpg",
    defaultCoverPhoto: "/DCP.jpg",
    defaultProfilePic: "/DPP.jpg",
    defaultSessionPic: "/DSP.gif",
    sessionPenalty : 0.05,
    purchaseOptions : ['Cash On Delivery', 'Wallet'],
    orderStatus: ['Pending', 'Delivering', 'Delivered', 'Refunded'],
    importPass:'sQo5KBOzDp1Ns8jt04lF',
    passPhrase: 'VmHqULgNrHgraYPb0M5c',
    paymentMuliplier: 1,
    ownerCategories: ['Personal Trainer', 'Dance Classes', 'Yoga and Meditation', 'Cardio', 'Crossfit', 'Martial Arts', 'Gyms', 'Other'],
    allowedPicTypes: ['image/png','image/jpg','image/jpeg'],
    allowedDocTypes: ['application/pdf','application/msword'],
    adminInfo:
    [
        {
            username:'admin',
            password:'Admin1234$',
            email:'admin@localhost.com'
        }
    ]
};
