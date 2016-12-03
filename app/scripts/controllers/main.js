'use strict';

/**
 * @ngdoc function
 * @name travelFinderApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the travelFinderApp
 */
angular.module('travelFinderApp')

.controller('MainCtrl', function($scope, fetchDataService, underscore, $timeout, searchValidation, tripSorterFactory, $mdDialog) {
    $scope.underscore = underscore;
    $scope.data = {};
    $scope.userEvents = {};
    $scope.data.departureCities = [];
    $scope.data.arrivalCities = [];
    $scope.data.selectedDeparture = "";
    $scope.data.selectedArrival = "";
    $scope.data.sortBy = "1";
    $scope.data.recommendedResults = {};
    $scope.data.considerDiscount = true;

    /**
     * [showValidationErrors common function that calls material alert box to show warning message]
     * @param  {string} alertMessage message to be show to the user
     * @return {void}              
     */
    $scope.userEvents.showValidationErrors = function(alertMessage) {
        $mdDialog.show(
            $mdDialog.alert()
            .parent(angular.element(document.querySelector('body')))
            .clickOutsideToClose(true)
            .title('Invalid Search')
            .textContent(alertMessage)
            .ok('Got it!')

        );
    }


    /**
     * [getResponseData common method to fetch data from response.json(or any service)]
     * @return {Object} results from response.json
     */
    var getResponseData = function() {
        return fetchDataService.getRemoteData();
    }

    function initiatePage() {
        
        //get the data and populate departure and arrival cities respectively
        getResponseData().then(function(response) {
            var deals = response.data.deals;
            $scope.data.departureCities = tripSorterFactory.sortArray(underscore.uniq(underscore.collect(deals, 'departure')));
            $scope.data.arrivalCities = tripSorterFactory.sortArray(underscore.uniq(underscore.collect(deals, 'arrival')));
        })
       
    }
    initiatePage();
    
    /**
     * [swapAndSearch to interchange departure and arrival]
     * @return {void} calls search after swapping
     */
    $scope.userEvents.swapAndSearch = function() {
        var arraivalTobeSwapped = $scope.data.selectedArrival;
        $scope.data.selectedArrival = $scope.data.selectedDeparture;
        $scope.data.selectedDeparture = arraivalTobeSwapped;
        $scope.userEvents.searchDeals();
    }

    /**
     * [resetSearch to reset what user has searched]
     * @param  {Boolean} isTotalReset  when user click reset its true , if program resets for searching its is false
     * @return {void}              
     */
    $scope.userEvents.resetSearch = function(isTotalReset) {
        if (isTotalReset) {
            $scope.data.selectedDeparture = "";
            $scope.data.selectedArrival = "";
            $scope.data.considerDiscount = true;
        }

        $scope.data.recommendedResults = {};
    }

    /**
     * [searchDeals search function to search best deals]
     * @return {void} populates list of deals for user selected values and filters
     */
    $scope.userEvents.searchDeals = function() {
        if (!$scope.data.selectedDeparture || !$scope.data.selectedArrival) {
            $scope.userEvents.showValidationErrors("Select a valid Departure and Arrival");
            return;

        }
        if (searchValidation.isAValidSearch($scope.data.selectedDeparture, $scope.data.selectedArrival)) {
            $scope.userEvents.showValidationErrors("Departure and Arrival can't be same ");
            return;
        }
        getResponseData().then(function(response) {
            $scope.userEvents.resetSearch(false);
            var deals = response.data.deals;
            var currency = response.data.currency;
            var  tripRoutes = {};
            var cachedTrip   = tripSorterFactory.isACachedSearch($scope.data.selectedDeparture,$scope.data.selectedArrival,$scope.data.considerDiscount);  
            tripRoutes = cachedTrip ? tripSorterFactory.returnCachedSearch():tripSorterFactory.createGraphAndGetDeals(deals, $scope.data.departureCities, $scope.data.arrivalCities, $scope.data.selectedDeparture, $scope.data.selectedArrival,$scope.data.considerDiscount);
            $scope.data.recommendedResults.currency = currency;
            $scope.data.recommendedResults.totalPossiblePath =  tripRoutes.totalPossiblePath;
            //assigning results based on how user has filtered
            switch ($scope.data.sortBy) {
                case "1":
                    $scope.data.recommendedResults.deals = tripRoutes.cheapest;

                    break;
                case "2":
                    $scope.data.recommendedResults.deals = tripRoutes.fastest;
                    break;
                case "3":

                    $scope.data.recommendedResults.deals = tripRoutes.allTrips;
                    
                    break;
            }
        });


    }






});
