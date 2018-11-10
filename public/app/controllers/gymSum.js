App.controller ('gymSumCtrl',function($scope,$location,UserSrv,AuthToken){
  var ctrl = this ;
  $scope.show = false ;
  var container1 = angular.element("body");
  var content1 = container1.innerHTML;
  container1.innerHTML = content1;
$scope.checkAuth('All');
  $scope.show = true ;
$scope.selectCategory(AuthToken.getCategory());
// console.log($scope.selectedCategory);
$scope.setSelected = function(business) {
    AuthToken.setSelectedBusiness(business);
    $location.url('/GymHomepage');
};
});
