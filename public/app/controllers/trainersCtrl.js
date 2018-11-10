const trainersCtrl = function($scope, $location, UserSrv) {

    

    

    ////////////////////////////////////////////////

    $scope.isEditable = false;
    $scope.editableText = 'Commodo id natoque malesuada sollicitudin elit suscipit magna.';

    $scope.toggleEditable = function() {
     $scope.isEditable = !$scope.isEditable;
    };

    ////////////////////////////////////////////////

    $scope.ham = false;
    $scope.toggleHam = function() {
      console.log($scope.ham);
     $scope.ham = !$scope.ham;
      console.log($scope.ham);

    };

    ////////////////////////////////////////////////

     $scope.search = false;
    $scope.toggleSearch = function() {
      console.log($scope.search);
     $scope.search = !$scope.search;
      console.log($scope.search);

    };

    ///////////////////////////////////////////////
    $scope.ncolor = '#C96666'; //to make new notification with a red color;
    $scope.notification = false;
    $scope.toggleNotification = function() {
      console.log($scope.notification);
     $scope.notification = !$scope.notification;
      console.log($scope.notification);

    };

    ///////////////////////////////////////////////

    $scope.chat = false;
    $scope.toggleChat = function() {
      console.log($scope.chat);
     $scope.chat = !$scope.chat;
      console.log($scope.chat);

    };

    ///////////////////////////////////////////////
    $scope.addReview = false;
              $scope.leaveReviews = function() {

               $scope.addReview = !$scope.addReview

              };

              $scope.doneReviewing= function()
              {
                $scope.addReview = !$scope.addReview
              }

              $scope.range = [1,2,3,4,5];

        $scope.update = function(value) {
          $scope.rate = value;
          if ($scope.onUpdate) {
            $scope.onUpdate({value: value});
          }
        };

    ////////////////////////////////////////////////




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





  }


sessionsCtrl.$inject = ['$scope', '$location', 'UserSrv'];
App.controller('trainersCtrl', trainersCtrl);