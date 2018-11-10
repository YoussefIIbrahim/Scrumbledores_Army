App.controller('editOwnerProfileCtrl', function($scope, $location, $route, UserSrv, SweetAlert) {
    $scope.OwnerProfilePicture;
    $scope.OwnerCoverPhoto;
    var myctrl = this;
    $scope.checkAuth(['BusinessOwner']);
    $scope.show = false;
    var container1 = angular.element("body");
    var content1 = container1.innerHTML;
    container1.innerHTML = content1;
    UserSrv.profile().then(function(response) {
        myctrl.ownerProfile = response.data;
        var container = angular.element("login-wrap");
        var content = container.innerHTML;
        container.innerHTML = content;
        $scope.show = true;
    });
    myctrl.setCategory = function(x) {
        if (myctrl.ownerProfile) myctrl.ownerProfile.profile.category = x;
        else {
            myctrl.ownerProfile = {
                profile: {
                    category: x
                }
            };
        }
    };
    myctrl.profile = function() {
        myctrl.ownerProfile.user = myctrl.ownerProfile.profile;
        UserSrv.uploadFile($scope.OwnerProfilePicture, 'ProfilePicture').then(function(response) {
            // console.log(response);
        });
        UserSrv.uploadFile($scope.OwnerCoverPhoto, 'CoverPhoto').then(function(response) {
            // console.log(response);
        });
        // console.log(UserSrv.getFirst());
        if (UserSrv.getFirst()) {
            UserSrv.addProfile(myctrl.ownerProfile).then(function(response) {
                // console.log(response);
                if (response.data.success) {
                    SweetAlert.swal({
                        title: "Success",
                        text: "Profile added successfully",
                        type: "success",
                        confirmButtonColor: '#14ad8f',
                        confirmButtonText: "Close"
                    }, function() {
                        $scope.goToProfile();
                    });
                    UserSrv.setFirstTime(false);
                } else {
                    SweetAlert.swal({
                        title: "Failure",
                        text: response.data.message,
                        type: "warning",confirmButtonColor: '#14ad8f',
                        confirmButtonText: "Close"
                    });
                }
            });
        } else {
            UserSrv.editProfile(myctrl.ownerProfile).then(function(response) {
              // console.log(response);
                if (response.data.success) {
                    SweetAlert.swal({
                        title: "Success",
                        text: "Profile edited successfully",
                        type: "success",
                        confirmButtonColor: '#14ad8f',
                        confirmButtonText: "Close"
                    }, function() {
                        $scope.goToProfile();
                    });
                } else {
                    SweetAlert.swal({
                        title: "Failure",
                        text: response.data.message,
                        type: "warning",confirmButtonColor: '#14ad8f',
                        confirmButtonText: "Close"
                    });
                }
            });
        }
    };
    myctrl.putValue = function(x) {
        if (x) return x;
        return '';
    };
});
