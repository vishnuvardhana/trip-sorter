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
        /**
         * [getRemoteData get data from remote using API_URL]
         * @return {promise} return https promise for the request
         */
        var getRemoteData = function() {
               return $http({ "url": API_URL, method: "get" });
        };
        return {
            getRemoteData: getRemoteData
        };
    });
