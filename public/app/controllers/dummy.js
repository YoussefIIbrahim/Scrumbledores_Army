App.controller ('dummy',function ($scope) {
  $scope.show = true ;
  var container1 = angular.element("body");
  var content1 = container1.innerHTML;
  container1.innerHTML = content1;
});
