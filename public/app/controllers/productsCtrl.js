App.controller('productsCtrl', function($scope, $location, UserSrv, AuthToken, SweetAlert) {
    $scope.products = [];
    $scope.isOwner = false;
    var ctrl = this;
    $scope.show = false;
    var container1 = angular.element("body");
    var content1 = container1.innerHTML;
    container1.innerHTML = content1;
    $scope.showEdit = false ;
    console.log("products ctrl");
    UserSrv.getAll().then(function(response) {
        for (var i = 0; i < response.data.business.length; i++) {
            if (AuthToken.getSelectedBusiness() === response.data.business[i].ownerID) {
                ctrl.business = response.data.business[i];
                console.log("Bussiness ");
                console.log(ctrl.business);
                UserSrv.profile().then(function(response) {
                    ctrl.thisuser = response.data;
                    if (ctrl.business._id === ctrl.thisuser.profile._id) {$scope.isOwner = true;
                      if($scope.isOwner){
                        if(ctrl.business.products.length >0){
                          $scope.showEdit = true;
                        }
                      }
                    }
                });
            }
        }
    });


    $scope.retrieveProducts = function() {
        UserSrv.products().then(function(response) {
            if (response.data.success) {
                $scope.products = response.data.productsList;
                if($scope.isOwner){
                  if($scope.products.length >0){
                    $scope.showEdit = true;
                  }
                }
                console.log($scope.products);
                var container = angular.element("main");
                var content = container.innerHTML;
                container.innerHTML = content;
            } else

                SweetAlert.swal({
                    title: "Failure",
                    text: response.data.message,
                    type: "warning",confirmButtonColor: '#14ad8f',
                    confirmButtonText: "Close"
                });
            $scope.show = true;
        });
    }
    $scope.retrieveProducts();
    $scope.deleteProduct = function(id) {
        UserSrv.removeProduct(id).then(function(response) {
            console.log(response);
            if (response.data.success) {
                SweetAlert.swal({
                    title: "Success",
                    text: "Product deleted successfully",
                    type: "success",confirmButtonColor: '#14ad8f',
                    confirmButtonText: "Close"
                });
                $scope.retrieveProducts();
            } else {

                  SweetAlert.swal({
                      title: "Failure",
                      text: response.data.message,
                      type: "warning",confirmButtonColor: '#14ad8f',
                      confirmButtonText: "Close"
                  });
            }
        });
    };
    $scope.isEditable = false;
    $scope.editableText = 'Commodo id natoque malesuada sollicitudin elit suscipit magna.';
    $scope.toggleEditable = function() {
        $scope.isEditable = !$scope.isEditable;
        if (!$scope.isEditable) {
            for (var i = 0; i < $scope.products.length; i++) {
                var j = $scope.products[i];
                UserSrv.editProduct(j).then(function(response) {
                    console.log(response);
                    if (i === $scope.products.length - 1) $scope.retrieveProducts();
                });
            }
        }
    };
});
