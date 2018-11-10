App=angular.module ('App',['appRoutes',  '720kb.datepicker','oitozero.ngSweetAlert','stripe']).config(function ($httpProvider) {
  $httpProvider.interceptors.push('AuthInterceptors') ;
}).config(function() {
  Stripe.setPublishableKey('pk_test_08MIMUue0AnqaR8PTLfj6RQo');
});
