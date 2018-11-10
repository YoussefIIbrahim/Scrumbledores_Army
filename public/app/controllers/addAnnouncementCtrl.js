App.controller('AddAnnouncementsCtrl', function($scope, $location, UserSrv, SweetAlert) {
    $scope.AnnPic;
    var ctrl = this;
    $scope.show = true;
    $scope.addAnnouncement = function() {
        UserSrv.uploadAnnouncementOwner($scope.AnnPic, ctrl.announcement.announcement).then(function(response) {
          // console.log( ctrl.announcement.announcement);
            if (response.data.success) {
                SweetAlert.swal({
                    title: "Success",
                    text: "Announcement added successfully",
                    type: "success",
                    confirmButtonColor: '#14ad8f',
                    confirmButtonText: "Close"
                }, function() {
                    $location.url('/GymHomepage');
                });
            } else {
                SweetAlert.swal({
                    title: "Failure",
                    text: "please check that the announcement picture is less that 3 MB and you included an announcement body",
                    type: "warning",
                    confirmButtonText: "Close"
                });
            }
        });
    }
    $scope.deleteAnnouncement = function(announce) {
        UserSrv.removeAnnouncement(announce).then(function(res) {
            if (response.data.success) {
                SweetAlert.swal({
                    title: "Success",
                    text: "Announcement deleted successfully",
                    type: "success",
                    confirmButtonColor: '#14ad8f',
                    confirmButtonText: "Close"
                }, function() {
                    $location.url('/GymHomepage');
                });
            } else {
                SweetAlert.swal({
                    title: "Failure",
                    text: $scope.somethingWentWrong,
                    type: "warning",
                    confirmButtonText: "Close"
                });
            }
        });
    };
});
