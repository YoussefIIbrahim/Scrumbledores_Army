App.controller ('paymentMethodsCtrl',function($scope,$location,UserSrv, SweetAlert){
  var ctrl = this;

  $scope.setCash = function () {
      $location.url('/cash');
  }
  $scope.setWallet = function () {
      $location.url('/myWallet');
  }


});
