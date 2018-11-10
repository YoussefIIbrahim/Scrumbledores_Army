App.controller ('aNPCtrl',function($scope,$location,UserSrv){

  $scope.clientUser = "";
  $scope.doc;
  $scope.FName="";
  $scope.docType="NutritionProgram";

  var ctrl = this ;
 $scope.submitNutritionPlan= function () {
  UserSrv.uploadDocument($scope.doc,$scope.FName,$scope.docType,$scope.clientUser).then(function (response) {
    if(response.data.success){
        ctrl.body = "";

}
});
}
});
