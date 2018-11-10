App.controller ('addFitnessProgramCtrl',function($scope,$location,UserSrv){

  $scope.clientUser = "";
  $scope.doc;
  $scope.FName="";
  $scope.docType="FitnessProgram";

  var ctrl = this ;
 $scope.submitFitnessProgram= function () {
  UserSrv.uploadDocument($scope.doc,$scope.FName,$scope.docType,$scope.clientUser).then(function (response) {
    // console.log(response);
    if(response.data.success){
        ctrl.body = "";

}
});
}
});
