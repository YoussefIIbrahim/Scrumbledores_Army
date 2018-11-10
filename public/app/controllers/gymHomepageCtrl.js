App.controller('gymHomepageCtrl', function($scope, $location, UserSrv, AuthToken, $window, SweetAlert) {
    var ghCtrl = this;
    var ctrl = this;
    ghCtrl.business = {};
    $scope.isGym = false;
    ghCtrl.thisuser = {
        'profile': {}
    };
    ghCtrl.show = false;
    $scope.isOwner = false;
    $scope.sessions = [];
    $window.username = '';
    $window.bname = 'Hello';
    $scope.show = false;
    var container1 = angular.element("body");
    var content1 = container1.innerHTML;
    container1.innerHTML = content1;
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
    $scope.fetchPicsAnn = function() {
        UserSrv.profile().then(function(response) {
            if (response.data.success) {
                var UID = response.data.user._id;
                ctrl.annPicPath = "../../../Users/" + UID;
            }
        });
    };
    $scope.fetchPicsAnn();
    UserSrv.getAll().then(function(response) {
        for (var i = 0; i < response.data.business.length; i++) {
            if (AuthToken.getSelectedBusiness() === response.data.business[i].ownerID) {
                ghCtrl.business = response.data.business[i];
                $window.bname = ghCtrl.business.organizationName;
                $window.ownerusername = ghCtrl.business.username;
                if (ghCtrl.business.category === 'Gyms') $scope.isGym = true;
            }
        }
    });
    UserSrv.profile().then(function(response) {
        if (response.data.success) {
            ghCtrl.thisuser = response.data;
            $window.username = response.data.user.username;
            $scope.logged = true;
            $window.token = AuthToken.getToken();
            if (response.data.user._id === AuthToken.getSelectedBusiness()) {
                $scope.isOwner = true;
            }
        }
            $scope.show = true;
        if ($scope.isOwner) {
            this.ownerID = ghCtrl.thisuser.profile.ownerID;
            UserSrv.sessions(this.ownerID).then(function(response) {

                $scope.sessions = response.data.sessions;


            })
        } else {
            ID = {
                ownerID: AuthToken.getSelectedBusiness()
            };
            UserSrv.businessSessions(ID).then(function(response) {
                // console.log(response.data.success);
                // console.log(response.data.message);
                // console.log(response.data.sessions);
                $scope.sessions = response.data.sessions;
                ghCtrl.show = true;

            })
        }

      //  console.log(ghCtrl.business);
        if ($scope.sessions.length < 6) {
            var spl = $scope.sessions.length;
        } else {
            var spl = 6;
        }
        this.temp = $scope.sessions.splice(0, spl);
        $scope.sessions = this.temp;
        (function($) {
            var settings = {
                carousels: {
                    speed: 4,
                    fadeIn: true,
                    fadeDelay: 250
                },
            };
            skel.breakpoints({
                wide: '(max-width: 1680px)',
                normal: '(max-width: 1280px)',
                narrow: '(max-width: 960px)',
                narrower: '(max-width: 840px)',
                mobile: '(max-width: 736px)'
            });
            $(function() {
                var $window = $(window),
                    $body = $('body');
                if (skel.vars.IEVersion < 9) $(':last-child').addClass('last-child');
                $('form').placeholder();
                skel.on('+mobile -mobile', function() {
                    $.prioritize('.important\\28 mobile\\29', skel.breakpoint('mobile').active);
                });
                $('#nav > ul').dropotron({
                    mode: 'fade',
                    speed: 350,
                    noOpenerFade: true,
                    alignment: 'center'
                });
                $('.scrolly').scrolly();
                $('<div id="navButton">' + '<a href="#navPanel" class="toggle"></a>' + '</div>');
                $('<div id="navPanel">' + '<nav>' + $('#nav').navList() + '</nav>' + '</div>').panel({
                    delay: 500,
                    hideOnClick: true,
                    hideOnSwipe: true,
                    resetScroll: true,
                    resetForms: true,
                    target: $body,
                    visibleClass: 'navPanel-visible'
                });
                if (skel.vars.os == 'wp' && skel.vars.osVersion < 10) $('#navButton, #navPanel, #page-wrapper').css('transition', 'none');
                $('.carousel').each(function() {
                    var $t = $(this),
                        $forward = $('<span class="forward"></span>'),
                        $backward = $('<span class="backward"></span>'),
                        $reel = $t.children('.reel'),
                        $items = $reel.children('article');
                    var pos = 0,
                        leftLimit, rightLimit, itemWidth, reelWidth, timerId;
                    if (settings.carousels.fadeIn) {
                        // $items.addClass('loading');
                        $t.onVisible(function() {
                            var timerId, limit = $items.length - Math.ceil($window.width() / itemWidth);
                            timerId = window.setInterval(function() {
                                var x = $items.filter('.loading'),
                                    xf = x.first();
                                if (x.length <= limit) {
                                    window.clearInterval(timerId);
                                    $items.removeClass('loading');
                                    return;
                                }
                                if (skel.vars.IEVersion < 10) {
                                    xf.fadeTo(750, 1.0);
                                    window.setTimeout(function() {
                                        xf.removeClass('loading');
                                    }, 50);
                                } else
                                    xf.removeClass('loading');
                            }, settings.carousels.fadeDelay);
                        }, 50);
                    }
                    $t._update = function() {
                        pos = 0;
                        rightLimit = (-1 * reelWidth) + $window.width();
                        leftLimit = 0;
                        $t._updatePos();
                    };
                    if (skel.vars.IEVersion < 9) $t._updatePos = function() {
                        $reel.css('left', pos);
                    };
                    else
                        $t._updatePos = function() {
                            $reel.css('transform', 'translate(' + pos + 'px, 0)');
                        };
                    $forward.appendTo($t).mouseenter(function(e) {
                        timerId = window.setInterval(function() {
                            pos -= settings.carousels.speed;
                            if (pos <= rightLimit) {
                                window.clearInterval(timerId);
                                pos = rightLimit;
                            }
                            $t._updatePos();
                        }, 10);
                    }).mouseleave(function(e) {
                        window.clearInterval(timerId);
                    });
                    $backward.appendTo($t).mouseenter(function(e) {
                        timerId = window.setInterval(function() {
                            pos += settings.carousels.speed;
                            if (pos >= leftLimit) {
                                window.clearInterval(timerId);
                                pos = leftLimit;
                            }
                            $t._updatePos();
                        }, 10);
                    }).mouseleave(function(e) {
                        window.clearInterval(timerId);
                    });
                    $window.load(function() {
                        reelWidth = $reel[0].scrollWidth;
                        skel.on('change', function() {
                            if (skel.vars.mobile) {
                                $reel.css('overflow-y', 'hidden').css('overflow-x', 'scroll').scrollLeft(0);
                                $forward.hide();
                                $backward.hide();
                            } else {
                                $reel.css('overflow', 'visible').scrollLeft(0);
                                $forward.show();
                                $backward.show();
                            }
                            $t._update();
                        });
                        $window.resize(function() {
                            reelWidth = $reel[0].scrollWidth;
                            $t._update();
                        }).trigger('resize');
                    });
                });
            });
        })(jQuery);
        $scope.show = true;
    });
    $scope.deleteAnnouncement = function(id) {
        UserSrv.removeAnnouncement(id).then(function(response) {
            if (response.data.success) {
                SweetAlert.swal({
                    title: "Success",
                    text: "Announcement deleted successfully",
                    type: "success",
                    confirmButtonColor: '#14ad8f',
                    confirmButtonText: "Close"
                }, function() {
                    location.reload();
                });
            } else {
                SweetAlert.swal({
                    title: "Failure",
                    text: response.data.message,
                    type: "warning",
                    confirmButtonText: "Close"
                });
            }
        });
    };
    $scope.isEditable = false;
    $scope.editableText = 'Commodo id natoque malesuada sollicitudin elit suscipit magna.';
    $scope.toggleEditable = function() {
        $scope.isEditable = !$scope.isEditable;
        if (!$scope.isEditable) {
            var arr = ghCtrl.business.announcements;
            for (var i = 0; i < ghCtrl.business.announcements.length; i++) {
                var j = ghCtrl.business.announcements[i];
                UserSrv.removeAnnouncement(j._id).then(function(response) {
                });
            }
            for (i = 0; i < arr.length; i++) {
                var jj = arr[i];
                var jjj = {
                    'announcement': jj.body
                };
                UserSrv.addAnnouncements(jjj).then(function(response) {});
            }
        }
    };
    $scope.ham = false;
    $scope.toggleHam = function() {
        $scope.ham = !$scope.ham;
    };
    $scope.search = false;
    $scope.toggleSearch = function() {
        $scope.search = !$scope.search;
    };
    $scope.info = false;
    $scope.toggleInfo = function() {
        $scope.info = !$scope.info;
    };
    $scope.ncolor = '#C96666';
    $scope.notification = false;
    $scope.toggleNotification = function() {
        $scope.notification = !$scope.notification;
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
        $scope.chat = !$scope.chat;
    };
    $scope.addReview = false;
    $scope.leaveReviews = function() {
        $scope.addReview = !$scope.addReview;
    };
    $scope.doneReviewing = function(bool) {
        // console.log("boolean " + bool);
        // console.log($scope.myreview);
        $scope.addReview = !$scope.addReview;
        if (!$scope.addReview) {
            if (bool) {
                // console.log("194");
                $scope.review();
            }
        }
    };
    $scope.range = [1, 2, 3, 4, 5];
    $scope.update = function(value) {
        $scope.rate = value;
        $scope.myreview.rating = value;
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
        if (isClosed === true) {
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
    $scope.sessionID = "";
    $scope.session = {};
    $scope.sessions = [{}];
    $scope.join = function(ID) {
        $scope.sessionID = {
            sessionID: ID
        };
        if ($scope.userProfile.userType == 'Client') {
            UserSrv.JoinSession($scope.sessionID).then(function(response) {
                $scope.errMsg = response.data.message;
                $scope.showErrMsg = true;
                setTimeout(function() {
                    $scope.showErrMsg = false;
                }, 800);
            });
        }
    };
    $scope.myreview = {};
    $scope.review = function() {
        $scope.myreview.OwnerID = ghCtrl.business._id;
        UserSrv.postReview($scope.myreview).then(function(response) {
        });
    };
    $scope.addProductToCart = function(data) {
        var data1 = {};
        data1.businessID = ghCtrl.business._id;
        data1.count = 1;
        data1.productID = data._id;
        UserSrv.addToCart(data1).then(function(response) {
            if (response.data.success) {
                SweetAlert.swal({
                    title: "Success",
                    text: "Product added to Cart successfully",
                    type: "success",
                    confirmButtonColor: '#14ad8f',
                    confirmButtonText: "Close"
                });
            } else {
                SweetAlert.swal({
                    title: "Failure",
                    text: response.data.message,
                    type: "warning",
                    confirmButtonText: "Close"
                });
            }
        });
    };
});
