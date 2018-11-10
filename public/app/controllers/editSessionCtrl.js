App.controller('editSessionsCtrl', function($scope, $location, UserSrv, AuthToken, SweetAlert) {
    $scope.sessionID = AuthToken.getSession();
    $scope.session = {};
    $scope.sessions = [];
    $scope.show = false;
    var container1 = angular.element("body");
    var content1 = container1.innerHTML;
    container1.innerHTML = content1;
    $scope.checkAuth([$scope.userTypeOwner]);
    UserSrv.sessions($scope.ownerID).then(function(response) {
        $scope.sessions = response.data.sessions;
        for (var i = 0; i < $scope.sessions.length; i++) {
            if ($scope.sessions[i]._id === $scope.sessionID) $scope.session = $scope.sessions[i];
        }
        $scope.show = true;
    });
    $scope.saveEdit = function() {
        UserSrv.editSession($scope.session).then(function(response) {
            if (response.data.success) {
                SweetAlert.swal({
                    title: "Success",
                    text: "Session edited successfully",
                    type: "success",
                    confirmButtonColor: '#14ad8f',
                    confirmButtonText: "Go Back"
                }, function() {
                    $location.url('/sessions');
                });
            } else {
                SweetAlert.swal({
                    title: "Failure",
                    text: response.data.message,
                    type: "warning",
                    confirmButtonText: "Try Again"
                });
            }
        });
    };
});
