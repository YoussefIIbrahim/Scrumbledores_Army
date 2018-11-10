App.controller('LoginCtrl', function($scope, $location, UserSrv, AuthToken, SweetAlert) {
    $scope.user = {};
    $scope.showErrMsg = false;
    $scope.errMsg = {};
    $scope.show = true;
    $scope.hideErr = function() {
        $scope.showErrMsg = false;
        $scope.errMsg = {};
    };
    $scope.showErr = function(errMsg) {
        $scope.showErrMsg = true;
        $scope.errMsg = errMsg;
    };
    UserSrv.profile().then(function(response) {
        if (response.data.success) {
            SweetAlert.swal({
                title: "You are already Logged in ",
                type: "warning",
                confirmButtonColor: '#14ad8f',
                confirmButtonText: "Go to FITHUB"
            }, function() {
                $location.url('/');
            });
        }
    });
    $scope.login = function() {
        UserSrv.login($scope.user).then(function(response) {
            if (response.data.success) {
                var user = response.data.user;
                // console.log(response);
                user.token = response.data.token;
                user.profile = response.data.profile;
                UserSrv.setUser(user);
                AuthToken.setToken(user.token);
                $scope.firstTimeLogin = response.data.nullID;
                UserSrv.setFirstTime(response.data.nullID);
                AuthToken.saveX(response.data.nullID);
                // console.log($scope.logged);
                $scope.logged = true;
                SweetAlert.swal({
                    title: "Login Successful",
                    text: "Welcome to FITHUB",
                    type: "success",
                    confirmButtonColor: '#14ad8f',
                    confirmButtonText: "Let's Start"
                }, function() {
                    $scope.show = false;
                    var container = angular.element("body");
                    var content = container.innerHTML;
                    container.innerHTML = content;
                    $scope.logged = true;
                    if ($scope.firstTimeLogin) {
                        if (user.userType === 'Client') {
                            $location.url('/editUserProfile');
                            $scope.userType = 'Client';
                        } else if (user.userType === 'BusinessOwner') {
                            $location.url('/editOwnerProfile');
                            $scope.userType = 'BusinessOwner';
                        } else {
                            $scope.userType = 'Admin';
                            $location.url('/adminpage');
                        }
                    } else {
                        if (user.userType === 'Client') {
                            $location.url('/userProfile');
                            $scope.userType = 'Client';
                        } else if (user.userType === 'BusinessOwner') {
                            $location.url('/ownerProfile');
                            $scope.userType = 'BusinessOwner';
                        } else {
                            $scope.userType = 'Admin';
                            $location.url('/adminpage');
                        }
                    }
                });
            } else {
                SweetAlert.swal({
                    title: "Login Failure",
                    text: response.data.message,
                    type: "warning",
                    confirmButtonText: "Try Again"
                });
            }
        });
        $scope.user = {};
    };
});
