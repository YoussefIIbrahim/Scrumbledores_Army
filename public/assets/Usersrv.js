var website = 'http://localhost:8000';
App.factory('UserSrv', function($http) {
        return {
            login: function(data) {
                return $http({
                    method: 'POST',
                    url: '/api/login',
                    data: data
                });

            },
            register: function(data) {
                return $http({
                    method: 'POST',
                    url: '/api/register',
                    data: data
                });
            },
            forgotPassword: function(data) {
                return $http({
                    method: 'POST',
                    url: '/api/forgotPassword',
                    data: data
                });
            },
            resendVerificationEmail: function(data) {
                return $http({
                    method: 'POST',
                    url: '/api/resend',
                    data: data
                });
            },
            restorePassword: function(data) {
                return $http({
                    method: 'POST',
                    url: '/api/restorePassword',
                    data: data
                });
            },

            getAll: function() {
                return $http({
                    method: 'GET',
                    url: '/api/getAll'

                });
            },
            setUser: function(user) {
                this.user = user;
              },
            getUser: function() {
              UserSrv.profile().then(function (response) {
                  return response.data.user;
              });

            },
            setFirstTime:function (f) {
              this.first = f ;
            },
            getFirst:function () {
              return this.first ;
            },
            profile: function() {
                return $http({
                    method: 'GET',
                    url: '/api/profile'
                });
            },
            verifyAccount: function(data) {
                return $http({
                    method: 'POST',
                    url: '/api/verifyAccount',
                    data: data
                });
            },
            postReview: function(data) {
                return $http({
                    method: 'POST',
                    url: '/api/postReview',
                    data: data
                });
            },
            addProfile: function(data) {
                return $http({
                    method: 'POST',
                    url: '/api/addProfile',
                    data: data

                });
            },
            products: function() {
                return $http({
                    method: 'GET',
                    url: '/api/products'
                });
            },
            addProducts: function(data) {
                return $http({
                    method: 'POST',
                    url: '/api/addProducts',
                    data: data
                });
            },
            addAnnouncements: function(data) {
                return $http({
                    method: 'POST',
                    url: '/api/addAnnouncements',
                    data: data
                });
            },
            announcements: function() {
                return $http({
                    method: 'GET',
                    url: '/api/announcements'
                });
            },
            announcementsAdmin: function() {
                return $http({
                    method: 'GET',
                    url: '/api/announcementsAdmin'
                });
            },
            addAnnouncementsAdmin: function(data) {
                return $http({
                    method: 'POST',
                    url: '/api/addAnnouncementsAdmin',
                    data: data
                });
            },
            sessions: function() {
                return $http({
                    method: 'GET',
                    url: '/api/sessions'
                });
            },
            addSession: function(data) {
                return $http({
                    method: 'POST',
                    url: '/api/addSession',
                    data: data
                });
            },
            getBusinessList: function() {
                return $http({
                    method: 'GET',
                    url: '/api/getBusinessList'
                });
            },
            searchBussinesses: function(data) {
                return $http({
                    method: 'POST',
                    url: '/api/searchBussinesses',
                    data: data
                });
            },
             removeProduct: function(data) {
               return $http.delete('/api/removeProduct', {params: {productID: data}} );
            },
            removeAnnouncementAdmin: function(data) {
              console.log(data);
              return $http.delete('/api/removeAnnouncementAdmin', {params: {announcementID: data}} );
            },
            removeAnnouncement: function(data) {
              console.log(data);
              return $http.delete('/api/removeAnnouncement', {params: {announcementID: data}} );
            },
            approveOwner: function(data) {
                return $http({
                    method: 'PUT',
                    url: '/api/approveOwner',
                    data: data
                });
            },
            editProfile: function(data) {
                return $http({
                    method: 'PUT',
                    url: '/api/editProfile',
                    data: data
                });
            },
            changePassword: function(data) {
                return $http({
                    method: 'PUT',
                    url: '/api/changePassword',
                    data: data
                });
            },
            removeSession: function(data) {
              return $http.delete('/api/removeSession', {params: {sessionID: data}} );
            },
            registerToSession: function(data) {
                return $http({
                    method: 'POST',
                    url: '/api/registerToSession',
                    data: data
                });
            },
            unRegisterFromSession: function(data) {
                return $http({
                    method: 'POST',
                    url: '/api/unRegisterFromSession',
                    data: data
                });
            },
            removeOwner: function(data) {
              console.log(data);
              return $http.delete('/api/removeOwner', {params: {ownerID: data}} );
            },
            addToCart: function(data) {
                return $http({
                    method: 'POST',
                    url: '/api/addToCart',
                    data: data
                });
            },
            purchase: function(data) {
                return $http({
                    method: 'POST',
                    url: '/api/purchase',
                    data: data
                });
            },
            addProgress: function(data) {
                return $http({
                    method: 'POST',
                    url: '/api/addProgress',
                    data: data
                });
            },
            viewProgress: function() {
                return $http({
                    method: 'GET',
                    url: '/api/viewProgress'
                });
            },
            resetProgress: function() {
                return $http({
                    method: 'PUT',
                    url: '/api/resetProgress'
                });
            },
            contactUs: function(data) {
                return $http({
                    method: 'POST',
                    url: '/api/contactUs',
                    data: data
                });
            },
            editSession: function(data) {
                return $http({
                    method: 'PUT',
                    url: '/api/editSession',
                    data: data
                });
            },
            notificationsOwner: function() {
                return $http({
                    method: 'GET',
                    url: '/api/notificationsOwner'
                });
            },
            notificationsClient: function() {
                return $http({
                    method: 'GET',
                    url: '/api/notificationsClient'
                });
            },
            uploadPicture: function(data) {
                return $http({
                    method: 'POST',
                    url: '/api/uploadPicture',
                    data: data
                });
            },
            uploadDocument: function(data) {
                return $http({
                    method: 'POST',
                    url: '/api/uploadDocument',
                    data: data
                });
            },
            schedule: function() {
                return $http({
                    method: 'GET',
                    url: '/api/schedule'
                });
            },
            cart: function() {
                return $http({
                    method: 'GET',
                    url: '/api/cart'
                });
            },
            removeFromCart: function(data) {
              return $http({
                  method: 'PUT',
                  url: '/api/removeFromCart',
                  data: data
              });
            },
            addBalance: function(data) {
                return $http({
                    method: 'POST',
                    url: '/api/addBalance',
                    data: data
                });
            },
            changeOrderStatus: function(data) {
                return $http({
                    method: 'PUT',
                    url: '/api/changeOrderStatus',
                    data: data
                });
            },
            addMembershipOption: function(data) {
                return $http({
                    method: 'POST',
                    url: '/api/addMembershipOption',
                    data: data
                });
            },
            removeMembershipOption: function(data) {
              return $http.delete('/api/removeMembershipOption', {params: {optionID: data}} );
            },
            addMember: function(data) {
                return $http({
                    method: 'POST',
                    url: '/api/addMember',
                    data: data
                });
            },
            buyCoins: function(data) {
                return $http({
                    method: 'POST',
                    url: '/api/buyCoins',
                    data: data
                });
            },
            refund: function(data) {
                return $http({
                    method: 'POST',
                    url: '/api/refund',
                    data: data
                });
            },
            orders: function(data) {
                return $http({
                    method: 'POST',
                    url: '/api/orders',
                    data: data
                });
            },
            editCart: function(data) {
                return $http({
                    method: 'PUT',
                    url: '/api/editCart',
                    data: data
                });
            },
            businessSessions: function(data) {
                return $http({
                    method: 'POST',
                    url: '/api/businessSessions',
                    data: data
                });
            },
            subscribeToBusiness: function(data) {
                return $http({
                    method: 'POST',
                    url: '/api/subscribeToBusiness',
                    data: data
                });
            },
            viewOwnersAdmin: function() {
                return $http({
                    method: 'GET',
                    url: '/api/viewOwnersAdmin'
                });
            }
        };
    })

    .factory ('AuthToken',function ($window) {
      var authTokenFactory = {} ;

      authTokenFactory.setToken = function (token) {
        if (token)
        $window.localStorage.setItem('token' , token);
        else
        $window.localStorage.removeItem('token') ;
      };
      authTokenFactory.getToken = function () {
        return $window.localStorage.getItem('token');
      };
      return authTokenFactory ;
    })

    .factory ('AuthInterceptors', function (AuthToken){
      var authInterceptorsFactory = {} ;

      authInterceptorsFactory.request = function (config) {
        var token = AuthToken.getToken () ;
        if (token) config.headers ['x-access-token'] = token ;
        return config ;
      };

      return authInterceptorsFactory ;
    }) ;
