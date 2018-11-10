var loginController = require('../controller/loginController');
var verificationController = require('../controller/verificationController');

module.exports= function (router)
{
    router.get('/:id/NutritionProgram/*',loginController.tokenCheck,verificationController.isFolderOwner, verificationController.fileRequest);
    router.get('/:id/FitnessProgram/*',loginController.tokenCheck,verificationController.isFolderOwner, verificationController.fileRequest);
    router.get('/:id/:param1', verificationController.profileFileRequest);
    router.get('/:id/:param1/:param2', verificationController.ownerFileRequest); 
    router.get('/:id/*', verificationController.fileRequest);
    return router ;
} ;
