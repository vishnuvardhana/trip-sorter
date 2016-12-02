'use strict';

/**
 * @ngdoc service
 * @name travelFinderApp.fetchDataService
 * @description
 * # fetchDataService
 * Factory in the travelFinderApp.
 */
angular.module('travelFinderApp')
    .factory('fetchDataService', function($http, API_URL) {

        var getRemoteData = function() {
           
               return $http({ "url": API_URL, method: "get" });

          
            

        };


        return {
            getRemoteData: getRemoteData
        };
    });
