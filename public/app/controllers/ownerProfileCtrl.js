App.controller('ownerProfileCtrl', function($scope, $location, UserSrv, SweetAlert) {
    var ctrl = this;
    ctrl.user = {};
    $scope.myorders = [];
    $scope.show = false;
    var container1 = angular.element("body");
    var content1 = container1.innerHTML;
    container1.innerHTML = content1;
    $scope.logged = true;
    $scope.fetchPicsOwner = function() {
        UserSrv.profile().then(function(response) {
            if (response.data.success) {
                var UID = response.data.user._id;
                ctrl.profilePicPath = "../../../Users/" + UID + "/ProfilePicture";
                ctrl.coverPicPath = "../../../Users/" + UID + "/CoverPhoto ";
            }
        });
    };
    $scope.fetchPicsOwner();
    UserSrv.profile().then(function(response) {
        console.log(response.data);
        if (response.data.success && response.data.user.userType === 'BusinessOwner') {
            console.log(response);
            $scope.myProfile = response.data;
            ctrl.user = response.data;
            var container = angular.element("container");
            var content = container.innerHTML;
            container.innerHTML = content;
        } else {
            $location.url('/unauth');
        }
        $scope.show = true;
    });
    UserSrv.orders().then(function(response) {
        if (response.data.success) {
            $scope.myorders = response.data.orders;
            ctrl.user.orders = response.data.orders;
            console.log($scope.myorders);
        }
    });
    $scope.changeStatus = function(order, status) {
        if (status != 'Refunded') {
            order.status = status;
            order.orderID = order._id;
            UserSrv.changeOrderStatus(order).then(function(response) {
                console.log(response.data);
            });
        } else {}
    };
    $scope.ham = false;
    $scope.toggleHam = function() {
        console.log($scope.ham);
        $scope.ham = !$scope.ham;
        console.log($scope.ham);
    };
    $scope.search = false;
    $scope.toggleSearch = function() {
        console.log($scope.search);
        $scope.search = !$scope.search;
        console.log($scope.search);
    };
    $scope.ncolor = '#C96666';
    $scope.notification = false;
    $scope.toggleNotification = function() {
        console.log($scope.notification);
        $scope.notification = !$scope.notification;
        console.log($scope.notification);
        $scope.readNotifications();
        var container = angular.element("mySidenav");
        var content = container.innerHTML;
        container.innerHTML = content;
        var container1 = angular.element("main");
        var content1 = container1.innerHTML;
        container1.innerHTML = content1;
    };
    $scope.chat = false;
    $scope.toggleChat = function() {
        console.log($scope.chat);
        $scope.chat = !$scope.chat;
        console.log($scope.chat);
    };
    $scope.orders = false;
    $scope.toggleOrders = function() {
        console.log($scope.orders);
        $scope.orders = !$scope.orders;
        console.log($scope.orders);
    };
    $scope.trigger = 'hamburger';
    $scope.overlay = 'overlay';
    $scope.isClosed = false;
    $scope.triggerClick = function() {
        $scope.hamburger_cross();
    };
    $scope.hamburger_cross = function() {
        if (isClosed == true) {
            $scope.overlay.hide();
            $scope.trigger.removeClass('is-open');
            $scope.trigger.addClass('is-closed');
            $scope.isClosed = false;
        } else {
            $scope.overlay.show();
            $scope.trigger.removeClass('is-closed');
            $scope.trigger.addClass('is-open');
            $scope.isClosed = true;
        }
    };
});
