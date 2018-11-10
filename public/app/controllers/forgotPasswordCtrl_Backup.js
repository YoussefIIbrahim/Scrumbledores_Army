App.controller ('forgotPasswordCtrl',function($scope,$location,UserSrv, SweetAlert){
  $scope.forgotPassword = {} ;
  $scope.show = true ;
  $scope.forgotPassword1 = function () {

      UserSrv.forgotPassword().then(function(response) {
          if (response.data.success){
            SweetAlert.swal({
               title: "Success",
               text: "Email sent successfully",
               type: "success",
               confirmButtonColor:'#14ad8f',
              confirmButtonText: "Go Back"
              },
            function(){
                $location.url('/login') ;
            });

          }
          else {
            SweetAlert.swal({
               title: "Failure",
               text: response.data.message,
               type: "warning",
              confirmButtonText: "Try Again"
            });
          }
      });
  } ;

});
