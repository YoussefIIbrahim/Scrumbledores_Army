App.controller('adminCtrl', function($scope, $location, UserSrv, SweetAlert) {
    var ctrl = this;
    ctrl.gyms = [];
    $scope.show = false;
    var container1 = angular.element("body");
    var content1 = container1.innerHTML;
    container1.innerHTML = content1;
    $scope.checkAuth(['Admin']);
    $scope.getList = function() {
        UserSrv.viewOwnersAdmin().then(function(response) {
            if (response.data.success) {
                ctrl.gyms = response.data.business;
            }
        });
    };
    $scope.deleteB = function(x) {
        UserSrv.removeOwner(x).then(function(response) {
            if (response.data.success) {
                SweetAlert.swal({
                    title: "Success",
                    text: "Business deleted successfully",
                    type: "success",
                    confirmButtonColor: '#14ad8f',
                    confirmButtonText: "Close"
                });
            } else {
                SweetAlert.swal({
                    title: "Failure",
                    text: $scope.somethingWentWrong,
                    type: "warning",
                    confirmButtonText: "Close"
                });
            }
            $scope.getList();
        });
    }
    $scope.approveB = function(x) {
        var inp = {
            "ID": x
        }
        UserSrv.approveOwner(inp).then(function(response) {
            if (response.data.success) {
                SweetAlert.swal({
                    title: "Success",
                    text: "Business approved successfully",
                    type: "success",
                    confirmButtonColor: '#14ad8f',
                    confirmButtonText: "Close"
                });
            } else {
                SweetAlert.swal({
                    title: "Failure",
                    text: $scope.somethingWentWrong,
                    type: "warning",
                    confirmButtonText: "Close"
                });
            }
            $scope.getList();
        });
    }
    $scope.removeAnn = function(x) {
        UserSrv.removeAnnouncementAdmin(x).then(function(response) {
            if (response.data.success) {
                SweetAlert.swal({
                    title: "Success",
                    text: "Announcement deleted successfully",
                    type: "success",
                    confirmButtonColor: '#14ad8f',
                    confirmButtonText: "Close"
                });
            } else {
                SweetAlert.swal({
                    title: "Failure",
                    text: $scope.somethingWentWrong,
                    type: "warning",
                    confirmButtonText: "Close"
                });
            }
            $scope.getAnnouncementsAdmin();
        });
    }
    $scope.getAnnouncementsAdmin = function() {
        UserSrv.announcementsAdmin().then(function(response) {
            if (response.data.success) {
                ctrl.announcements = response.data.announcements;
            }(function($) {
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
    }
    $scope.getList();
    $scope.getAnnouncementsAdmin();
});
