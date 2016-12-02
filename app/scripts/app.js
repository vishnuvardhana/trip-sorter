'use strict';

/**
 * @ngdoc overview
 * @name travelFinderApp
 * @description
 * # travelFinderApp
 *
 * Main module of the application.
 */
angular
    .module('travelFinderApp', [
        'ngAnimate',
        'ngCookies',
        'ngResource',
        'ngRoute',
        'ngSanitize',
        'ngTouch',
        'ngMaterial',
        'angular-loading-bar',
        'ngAnimate'
    ])
    .config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
        cfpLoadingBarProvider.includeSpinner = false;
    }])
    .config(function($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('pink', {
                'default': '500', // by default use shade 400 from the pink palette for primary intentions
                'hue-1': '700', // use shade 100 for the <code>md-hue-1</code> class
                'hue-2': '800', // use shade 600 for the <code>md-hue-2</code> class

            })
            // If you specify less than all of the keys, it will inherit from the
            // default shaaasddes

    })
    .constant('API_URL', 'response.json')
    .constant('underscore',
        window._
    )
    .constant('moment',
        window.moment
    )
    .config(function($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/main.html',
                controller: 'MainCtrl',
                controllerAs: 'main'
            })
            .when('/about', {
                templateUrl: 'views/about.html',
                controller: 'AboutCtrl',
                controllerAs: 'about'
            })
            .otherwise({
                redirectTo: '/'
            });
    });
