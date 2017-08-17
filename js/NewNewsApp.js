var newNewsApp = angular.module('NewNewsApp', ['ui.bootstrap', 'summernote']);

newNewsApp.factory('sessionTimeOutInterceptor', function () {
    return {
        response: function (response) {
            if (typeof response.data == "string") {
                if (response.data == "" || response.data.indexOf('страницу авторизации') != -1) {
                    window.location = authUrl;
                }
            }
            return response;
        }
    };
});


newNewsApp.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    $httpProvider.interceptors.push('sessionTimeOutInterceptor');
}]);

newNewsApp.directive('initImage', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            scope.$watch(attrs['ngModel'], function (v) {

                if (v == undefined || v == '' || v == null) return;

                attrs.$set('style', 'background-image: url(data:image/jpg;base64,' + v + ')');
            });
        }
    };
});