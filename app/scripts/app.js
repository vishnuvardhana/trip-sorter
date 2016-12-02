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
    
    .config(function($mdThemingProvider) {
        //setting theme to match the wire frame used in demo video
        $mdThemingProvider.theme('default')
            .primaryPalette('pink', {
                'default': '500', 
                'hue-1': '700', 
                'hue-2': '800', 

            })
    })

    //url for getting remote data
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
