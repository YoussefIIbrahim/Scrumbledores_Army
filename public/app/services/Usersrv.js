var website = 'http://localhost:8000';
App.factory('UserSrv', function($http, $q, AuthToken) {
    return {
        uploadFile: function(file, picType) {
            var fd = new FormData();
            fd.append('file', file);
            fd.append('picType', picType);
            return $http({
                method: 'POST',
                url: '/api/uploadPicture',
                headers: {
                    'content-type': undefined
                },
                transformRequest: angular.identity,
                data: fd
            });
        },
        uploadAnnouncementAdmin: function(file, body) {
            var fd = new FormData();
            fd.append('file', file);
            fd.append('body', body);
            return $http({
                method: 'POST',
                url: '/api/addAnnouncementsAdmin',
                headers: {
                    'content-type': undefined
                },
                transformRequest: angular.identity,
                data: fd
            });
        },
        uploadAnnouncementOwner: function(file, body) {
            var fd = new FormData();
            fd.append('file', file);
            fd.append('announcement', body);
            return $http({
                method: 'POST',
                url: '/api/addAnnouncements',
                headers: {
                    'content-type': undefined
                },
                transformRequest: angular.identity,
                data: fd
            });
        },
        uploadDocument: function(file, fileName, type, client) {
            var fd = new FormData();
            fd.append('file', file);
            fd.append('client', client);
            fd.append('fileName', fileName);
            fd.append('docType', type);
            return $http({
                method: 'POST',
                url: '/api/uploadDocument',
                headers: {
                    'content-type': undefined
                },
                transformRequest: angular.identity,
                data: fd
            });
        },
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
                url: '/api/getBusinessList'
            });
        },
        setUser: function(user) {
            this.user = user;
        },
        getUser: function() {
            if (AuthToken.getToken()) {
                var user = {};
                this.profile().then(function(response) {
                    user.user = response.data.user;
                    user.profile = response.data.profile;
                    console.log(response);
                    this.user = user;
                    return user;
                });
            }
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
            console.log("Data " + data);
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
        setFirstTime: function(f) {
            AuthToken.saveX(f);
        },
        getFirst: function() {
            return AuthToken.getX();
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
        JoinSession: function(data) {
            return $http({
                method: 'POST',
                url: '/api/registerToSession',
                data: data
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
        searchBussinesses: function() {
            return $http({
                method: 'GET',
                url: '/api/searchBussinesses'
            });
        },
        removeProduct: function(data) {
            return $http.delete('/api/removeProduct', {
                params: {
                    productID: data
                }
            });
        },
        removeAnnouncementAdmin: function(data) {
            return $http.delete('/api/removeAnnouncementAdmin', {
                params: {
                    announcementID: data
                }
            });
        },
        removeAnnouncement: function(data) {
            return $http.delete('/api/removeAnnouncement', {
                params: {
                    announcementID: data
                }
            });
        },
        approveOwner: function(data) {
            return $http({
                method: 'PUT',
                url: '/api/approveOwner',
                data: data
            });
        },
        getClientSessions: function() {
            return $http({
                method: 'GET',
                url: '/api/schedule',
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
                method: 'POST',
                url: '/api/changePassword',
                data: data
            });
        },
        removeSession: function(data) {
            console.log(data);
            return $http.delete('/api/removeSession', {
                params: {
                    sessionID: data.sessionID
                }
            });
        },
        registerToSession: function(data) {
            return $http({
                method: 'POST',
                url: '/api/registerToSession',
                data: data
            });
        },
        SessionUnregister: function(data) {
            return $http({
                method: 'POST',
                url: '/api/unRegisterFromSession',
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
            return $http.delete('/api/removeOwner', {
                params: {
                    ownerID: data
                }
            });
        },
        addToCart: function(data) {
            console.log("HERE");
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
                method: 'POST',
                url: '/api/viewProgress'
            });
        },
        resetProgress: function() {
            return $http({
                method: 'POST',
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
            data.sessionID = data._id;
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
            return $http.delete('/api/removeMembershipOption', {
                params: {
                    optionID: data
                }
            });
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
        orders: function() {
            return $http({
                method: 'POST',
                url: '/api/orders'
            });
        },
        viewSessions: function(data) {
            return $http({
                method: 'POST',
                url: '/api/viewSessions',
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
            console.log(data);
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
        },
        searchInBusiness: function(query, list) {
            var x = query;
            var result = [];
            for (var i = 0; i < list.length; i++) {
                if (list[i].organizationName.includes(x)) {
                    result.push(list[i]);
                }
            }
            return result;
        },
        searchInPrdouct: function(query, list) {
            var x = this.removeSpaces(query);
            var result = [];
            for (var i = 0; i < list.length; i++) {
                if (list[i].productName.includes(x)) {
                    result.push(list[i]);
                }
            }
            return result;
        },
        removeSpaces: function(query) {
            for (var i = 0; i < query.length; i++) {
                if (query.charAt(i) === ' ') {} else {
                    query = query.substring(i);
                }
            }
            for (i = res.length - 1; i > 0; i--) {
                if (query.charAt(i) === ' ') {} else {
                    query = query.substring(0, i);
                }
            }
            return query;
        },
        editProduct: function(data) {
            var j = {
                'price': data.price,
                'productID': data._id,
                'productName': data.productName,
                'quantity': data.quantity
            };
            return $http({
                method: 'PUT',
                url: '/api/editProducts',
                data: j
            });
        }
    };
}).factory('AuthToken', function($window) {
    var authTokenFactory = {};
    authTokenFactory.setToken = function(token) {
        if (token) $window.localStorage.setItem('token', token);
        else
            $window.localStorage.removeItem('token');
    };
    authTokenFactory.getToken = function() {
        return $window.localStorage.getItem('token');
    };
    authTokenFactory.setSelectedBusiness = function(id) {
        if (id) $window.localStorage.setItem('bid', id);
        else
            $window.localStorage.removeItem('bid');
    };
    authTokenFactory.getSelectedBusiness = function() {
        return $window.localStorage.getItem('bid');
    };
    authTokenFactory.saveX = function(id) {
        if (id) $window.localStorage.setItem('x', id);
        else
            $window.localStorage.removeItem('x');
    };
    authTokenFactory.getX = function() {
        return $window.localStorage.getItem('x');
    };
    authTokenFactory.setSession = function(id) {
        if (id) $window.localStorage.setItem('sessionID', id);
        else
            $window.localStorage.removeItem('sessionID');
    };
    authTokenFactory.getSession = function() {
        return $window.localStorage.getItem('sessionID');
    };
    authTokenFactory.setCategory = function(id) {
        if (id) $window.localStorage.setItem('category', id);
        else
            $window.localStorage.removeItem('category');
    };
    authTokenFactory.getCategory = function() {
        return $window.localStorage.getItem('category');
    };
    $window.localStorage.setItem('category', 'Gyms');
    return authTokenFactory;
}).factory('AuthInterceptors', function(AuthToken) {
    var authInterceptorsFactory = {};
    authInterceptorsFactory.request = function(config) {
        var token = AuthToken.getToken();
        if (token) config.headers['x-access-token'] = token;
        return config;
    };
    return authInterceptorsFactory;
});
