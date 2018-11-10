App.controller('myCartCtrl', function($scope, $location, UserSrv, SweetAlert) {
    var ctrl = this;
    $scope.show = false;
    var container1 = angular.element("body");
    var content1 = container1.innerHTML;
    container1.innerHTML = content1;
    $scope.isEditable = false;
    $scope.editableText = 'Commodo id natoque malesuada sollicitudin elit suscipit magna.';
    $scope.toggleEditable = function() {
        $scope.isEditable = !$scope.isEditable;
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
    $scope.addReview = false;
    $scope.leaveReviews = function() {
        $scope.addReview = !$scope.addReview
    };
    $scope.doneReviewing = function() {
        $scope.addReview = !$scope.addReview
    }
    $scope.range = [1, 2, 3, 4, 5];
    $scope.update = function(value) {
        $scope.rate = value;
        if ($scope.onUpdate) {
            $scope.onUpdate({
                value: value
            });
        }
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
    ctrl.cart = [];
    ctrl.c = "Cash On Delivery";
    ctrl.w = "Wallet";
    ctrl.total = 0;
    ctrl.balance = 0;
    ctrl.newBalance = 0;
    $scope.loadBalance = function() {
        console.log("fail");
        UserSrv.profile().then(function(response) {
            if (response.data.success) {
                ctrl.balance = response.data.profile.wallet.balance;
            }
        });
    }
    $scope.loadCart = function() {
        UserSrv.cart().then(function(response) {
            if (response.data.success) {
                ctrl.cart = response.data.cart;
                var len = response.data.cart.length;
                ctrl.total = 0 ;
                for (var i = 0; i < len; i++) {
                    ctrl.total = ctrl.total + (ctrl.cart[i].item.product.price * ctrl.cart[i].quantity);
                }
                ctrl.newBalance = ctrl.balance - ctrl.total;
            }
            $scope.show = true;
        });
    }
    $scope.editCart = function(id, q) {
        var newQ = {
            "cartID": id,
            "quantity": q
        }
        UserSrv.editCart(newQ).then(function(response) {
          console.log(response);
            ctrl.total = 0;
            $scope.loadCart();
        });
    }
    $scope.shop = function() {
        $location.url('/');
    }
    $scope.checkout = function() {
        $location.url('/paymentMethods');
    }
    $scope.purchase = function(x) {
        if (ctrl.total != 0) {
            console.log(x);
            var inp = {
                "paymentType": x
            }
            UserSrv.purchase(inp).then(function(response) {
                console.log(response.data);
                if (response.data.success) {}
                $location.url('/userProfile');
            });
        } else {
            console.log("failed");
        }
    }
    $scope.deleteFromCart = function(x) {
        var inpx = {
            "cartID": x
        }
        UserSrv.removeFromCart(inpx).then(function(response) {
            console.log(response);
            if (response.data.success) {
                ctrl.total = 0;
                $scope.loadCart();
                $location.url('/myCart');
            }
        });
    }
    $scope.loadBalance();
    console.log(ctrl.balance);
    $scope.loadCart();
});
