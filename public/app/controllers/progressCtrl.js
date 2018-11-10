App.controller('progressCtrl', function(UserSrv, SweetAlert){
var ctrl = this ;
ctrl.weight = 0  ;
$scope.show = true ;
ctrl.addProgress = function () {
UserSrv.addProgress(ctrl.weight).then(function (response) {

});
};

ctrl.viewProgress= function () {
UserSrv.viewProgress().then(function (response) {

});
};

ctrl.resetProgress = function () {
UserSrv.resetProgress().then(function (response) {

});
};




}) ;
