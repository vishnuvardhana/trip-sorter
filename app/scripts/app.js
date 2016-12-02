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
        //setting theme for given wireframe
        $mdThemingProvider.theme('default')
            .primaryPalette('pink', {
                'default': '500', 
                'hue-1': '700', 
                'hue-2': '800', 

            })
            

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

            .otherwise({
                redirectTo: '/'
            });
    });
