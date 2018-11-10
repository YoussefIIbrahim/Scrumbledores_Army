App.controller ('checkCartCtrl',function($scope,$location,UserSrv, SweetAlert){
$scope.show = true ;
var container1 = angular.element("body");
var content1 = container1.innerHTML;
container1.innerHTML = content1;
$scope.checkAuth(['Client']);
  $scope.purchaseCtrl = function () {
    UserSrv.purchase().then(function(response){
      if(response.data.success){
        SweetAlert.swal({
           title: "Success",
           text: "Purchase completed successfully",
           type: "success",
           confirmButtonColor:'#14ad8f',
          confirmButtonText: "Close"
          },
        function(){
            $location.url('/') ;
        });

      }
      else {
        SweetAlert.swal({
           title: "Failure",
           text: $scope.somethingWentWrong,
           type: "warning",
          confirmButtonText: "Close"
        });
      }
    });





  } ;

});
