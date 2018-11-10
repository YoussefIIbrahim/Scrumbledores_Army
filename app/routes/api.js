var userController = require('../controller/userController');
var adminController = require('../controller/adminController');
var clientController = require('../controller/clientController');
var ownerController = require('../controller/ownerController');
var loginController = require('../controller/loginController');
var profileController = require('../controller/profileController');
var searchController = require('../controller/searchController');
var verificationController = require('../controller/verificationController');
var uploadController = require('../controller/uploadController');
var serverConfig = require('../../config/serverConfigs')
var User = require ('../models/user') ;
var limiter = require('../../config/rateLimiter');

module.exports= function (router)
{
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //adminController//

    // Route to add announcements(admin)
    router.post('/addAnnouncementsAdmin',loginController.tokenCheck, verificationController.isAdmin, adminController.adminAddAnnouncement, uploadController.uploadMiscPicture);

    // Route to get announcements (admin)
    router.get('/announcementsAdmin', adminController.adminRetrieveAnnouncements);

    // Route to remove announcements(admin)
    router.delete('/removeAnnouncementAdmin',loginController.tokenCheck, verificationController.isAdmin, adminController.adminRemoveAnnouncement);

    // Route to approve business owner
    router.put('/approveOwner',loginController.tokenCheck, verificationController.isAdmin, adminController.approveOwner);

    // Route to remove owner (admin)
    router.delete('/removeOwner',loginController.tokenCheck, verificationController.isAdmin, adminController.adminRemoveOwner);

    // Route to add balance to user (admin)
    router.post('/addBalance',loginController.tokenCheck,verificationController.isAdmin,adminController.addBalance);

    //Route to get all owner (approved & not approved)(admin)
    router.get('/viewOwnersAdmin',loginController.tokenCheck, verificationController.isAdmin, adminController.viewAllOwners);

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //clientController//

    //Router to post a review to a Business
    router.post('/postReview', loginController.tokenCheck, verificationController.isClient, clientController.postReview);

    // Route for clients to register to sessions
    router.post('/registerToSession',loginController.tokenCheck, verificationController.isClient,clientController.registerToSession);

    // Route for clients to unRegister From Session
    router.post('/unRegisterFromSession',loginController.tokenCheck,verificationController.isClient, clientController.unRegisterFromSession);

    // Route to add products to cart
    router.post('/addToCart',loginController.tokenCheck, verificationController.isClient,clientController.addToCart);

    // Route to add progress
    router.post('/addProgress',loginController.tokenCheck, verificationController.isClient,clientController.addProgress);

    // Route to view progress
    router.get('/viewProgress',loginController.tokenCheck, verificationController.isClient,clientController.viewProgress);

     // Route to reset progress
    router.put('/resetProgress',loginController.tokenCheck, verificationController.isClient,clientController.resetProgress);

    // Route to checkout
    router.post('/purchase'/*, limiter.purchaseLimiter*/, loginController.tokenCheck, verificationController.isClient,clientController.purchase);

    // Route to send mail to contact us
    router.post('/contactUs', limiter.contactUsLimiter, loginController.tokenCheck,verificationController.isClient,clientController.contactUs);

    // Route to retrieve client's notifications
    router.get('/notificationsClient',loginController.tokenCheck,verificationController.isClient,clientController.notifications);

    // Route to retrieve client's schedule
    router.get('/schedule',loginController.tokenCheck,verificationController.isClient,clientController.sessions);

    // Route to view products in cart
    router.get('/cart',loginController.tokenCheck,verificationController.isClient,clientController.viewCart);

    // Route to remove products from cart
    router.put('/removeFromCart',loginController.tokenCheck,verificationController.isClient,clientController.removeFromCart);

    // Route for clients to buy coins for wallet
    router.post('/buyCoins',loginController.tokenCheck,verificationController.isClient,clientController.buyCoins);

    // Route to refund a pending order
    router.post('/refund',loginController.tokenCheck,verificationController.isClient,clientController.refund);

    //Route for client to subscribe to business
    router.post('/subscribeToBusiness',loginController.tokenCheck,verificationController.isClient,clientController.subscribeToBusiness)

    //Route for client to edit cart
    router.put('/editCart',loginController.tokenCheck,verificationController.isClient,clientController.editCart);

    //Route for client to view docs
    router.get('/viewDocs',loginController.tokenCheck,verificationController.isClient,clientController.viewDocs);

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //loginController//

    // Route to manage login
    router.post('/login', loginController.loginUser);

    // Route to provide the user with a new token to renew session
    router.get('/renewToken/:username', loginController.tokenCheck, loginController.renewSession);

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //ownerController//

    // Route to get owner's products
    router.get('/products', loginController.tokenCheck, verificationController.isBusinessOwner, verificationController.isApproved,ownerController.retrieveProducts);

    // Route to add products
    router.post('/addProducts',loginController.tokenCheck, verificationController.isBusinessOwner, verificationController.isApproved, ownerController.addProducts, uploadController.uploadMiscPicture);

    // Route to add announcements(owner)
    router.post('/addAnnouncements',loginController.tokenCheck, verificationController.isBusinessOwner, verificationController.isApproved, ownerController.ownerAddAnnouncement,uploadController.uploadMiscPicture);

    // Route to get announcements (owner)
    router.get('/announcements',loginController.tokenCheck, verificationController.isBusinessOwner, verificationController.isApproved, ownerController.ownerRetrieveAnnouncements);

    // Route to add session
    router.post('/addSession',loginController.tokenCheck, verificationController.isBusinessOwner, verificationController.isApproved, ownerController.addSession, uploadController.uploadMiscPicture);

    // Route to get sessions
    router.get('/sessions',loginController.tokenCheck, verificationController.isBusinessOwner, verificationController.isApproved, ownerController.retrieveSessions);

    // Route to remove announcements(owner)
    router.delete('/removeAnnouncement',loginController.tokenCheck,verificationController.isBusinessOwner, verificationController.isApproved, ownerController.ownerRemoveAnnouncement);

    // Route to remove products
    router.delete('/removeProduct',loginController.tokenCheck,verificationController.isBusinessOwner, verificationController.isApproved, ownerController.removeProduct);

    // Route to remove sessions(owner)
    router.delete('/removeSession',loginController.tokenCheck,verificationController.isBusinessOwner, verificationController.isApproved, ownerController.removeSession);

    // Route to edit current product
    router.put('/editProducts',loginController.tokenCheck, verificationController.isBusinessOwner, verificationController.isApproved, ownerController.editProducts, uploadController.uploadMiscPicture);

    // Route to edit specific session
    router.put('/editSession',loginController.tokenCheck,verificationController.isBusinessOwner, verificationController.isApproved, ownerController.editSession, uploadController.uploadMiscPicture);

    // Route to retrieve client's notifications
    router.get('/notificationsOwner',loginController.tokenCheck,verificationController.isBusinessOwner, verificationController.isApproved, ownerController.notifications);

    // Route to change an order's status (Owner)
    router.put('/changeOrderStatus',loginController.tokenCheck,verificationController.isBusinessOwner,ownerController.changeOrderStatus);

    // Route to add membership options (owner)
    router.post('/addMembershipOption',loginController.tokenCheck,verificationController.isBusinessOwner,ownerController.addMembershipOption);

    // Route to remove membership options (owner)
    router.delete('/removeMembershipOption',loginController.tokenCheck,verificationController.isBusinessOwner,ownerController.removeMembershipOption);

    // Route to add a client to a subscription (manually)
    router.post('/addMember',loginController.tokenCheck,verificationController.isBusinessOwner,ownerController.addMember);

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //profileController//

    // Route to get user profile
    router.get('/profile', loginController.tokenCheck, profileController.getProfile);

    // Route to add user to the schema matching its type
    router.post('/addProfile',loginController.tokenCheck, profileController.addProfile);

    // Route to retrieve all businesses
    router.get('/getBusinessList',profileController.retrieveBusinesses);

    // Route to edit profile
    router.put('/editProfile',loginController.tokenCheck,profileController.editProfile);

    // Route to change password
    router.put('/changePassword',loginController.tokenCheck,profileController.changePass);

    // Route to get user's orders
    router.post('/orders',loginController.tokenCheck,profileController.getOrders);

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //searchController//

    // Route to get search results for searching for businesses
    router.post('/searchBusinesses',searchController.searchBusinesses);

   //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //uploadController//

    // Route to add nutrition plans of fitness programs to client
    router.post('/uploadDocument', loginController.tokenCheck, limiter.uploadLimiter, verificationController.isBusinessOwner, verificationController.isApproved, uploadController.uploadDoc);

    // Route to upload profile pictures and cover photos
    router.post('/uploadPicture', loginController.tokenCheck, limiter.uploadLimiter, uploadController.uploadPicture);

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //userController//

    router.post('/register', limiter.createAccountLimiter, userController.registerUser);
    // Route to activate the user's account

    router.get('/verifyaccount', userController.verifyAccount);

    router.post('/forgotpassword', limiter.forgotPasswordLimiter, userController.forgotPassword);

    router.post('/restorePass', userController.restorePass);

    router.post('/resend', limiter.resendVerificationLimiter, userController.resendVerification);

    //Route to get any session
    router.post('/businessSessions',userController.viewSessions);

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    return router ;
} ;
