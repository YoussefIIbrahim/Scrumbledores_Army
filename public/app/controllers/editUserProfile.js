App.controller('editUserProfileCtrl', function($scope, $location, UserSrv, SweetAlert) {
    $scope.ProfilePicture;
    $scope.CoverPhoro;
    var myctrl = this;
    $scope.show = false;
    var container1 = angular.element("body");
    var content1 = container1.innerHTML;
    container1.innerHTML = content1;
    $scope.checkAuth(['Client']);
    UserSrv.profile().then(function(response) {
        myctrl.newProfile = response.data;
        var container = angular.element("login-wrap");
        var content = container.innerHTML;
        container.innerHTML = content;
        $scope.show = true;
    });
    myctrl.newProfile = {
        profile: {},
        user: {}
    };
    myctrl.profile = function() {
        myctrl.newProfile.user = myctrl.newProfile.profile;
        UserSrv.uploadFile($scope.ProfilePicture, 'ProfilePicture').then(function(response) {
            // console.log(response);
        });
        UserSrv.uploadFile($scope.CoverPhoto, 'CoverPhoto').then(function(response) {
            // console.log(response);
        });
        if (UserSrv.getFirst()) {
            UserSrv.addProfile(myctrl.newProfile).then(function(response) {
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
            UserSrv.editProfile(myctrl.newProfile).then(function(response) {
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
