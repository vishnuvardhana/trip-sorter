'use strict';

/**
 * @ngdoc function
 * @name travelFinderApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the travelFinderApp
 */
angular.module('travelFinderApp')

.controller('MainCtrl', function($scope, fetchDataService, underscore, $timeout, searchValidation, utilityFactory, $mdDialog) {

    $scope.underscore = underscore;

    $scope.data = {};
    $scope.userEvents = {};
    $scope.data.departureCities = [];
    $scope.data.arrivalCities = [];
    $scope.data.selectedDeparture = "";
    $scope.data.selectedArrival = "";
    $scope.data.sortBy = "1";
    $scope.data.recommendedResults = {};
    $scope.data.considerDiscount = false;

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

    //common method to fetch data from response.json(or any service)
    var getResponseData = function() {
        return fetchDataService.getRemoteData();
    }



    //get the data and populate departure and arrival cities respectively
    $timeout(function() {
        getResponseData().then(function(response) {

            var deals = response.data.deals;
            $scope.data.departureCities = utilityFactory.sortArray(underscore.uniq(underscore.collect(deals, 'departure')));
            $scope.data.arrivalCities = utilityFactory.sortArray(underscore.uniq(underscore.collect(deals, 'arrival')));


        })
    }, 1000);

    $scope.userEvents.swapAndSearch = function() {
        var arraivalTobeSwapped = $scope.data.selectedArrival;
        $scope.data.selectedArrival = $scope.data.selectedDeparture;
        $scope.data.selectedDeparture = arraivalTobeSwapped;
        $scope.userEvents.searchDeals();
    }
    $scope.userEvents.resetSearch = function(isTotalReset) {
        if (isTotalReset) {
            $scope.data.selectedDeparture = "";
            $scope.data.selectedArrival = "";
        }
        $scope.data.recommendedResults = {};
    }

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
            var totalCalculations = "";
            var bestTravelRoutes = utilityFactory.createGraphAndGetBestPath(deals, $scope.data.departureCities, $scope.data.arrivalCities, $scope.data.selectedDeparture, $scope.data.selectedArrival);
            $scope.data.recommendedResults.currency = currency;
            switch ($scope.data.sortBy) {
                case "1":
                    $scope.data.recommendedResults.deals = bestTravelRoutes.cheapest;
                    
                    break;
                case "2":
                    $scope.data.recommendedResults.deals = bestTravelRoutes.fastest;

                    break;
                case "3":
                    $scope.data.recommendedResults.deals = validDestinations;
                    $scope.data.recommendedResults.totalCost = totalCalculations.totalCost;
                    $scope.data.recommendedResults.totalDuration = totalCalculations.totalDuration;
                    break;



            }
            if ($scope.data.recommendedResults.deals.length > 1) {
                totalCalculations = utilityFactory.calculateTotalTimeAndCost($scope.data.recommendedResults.deals);
                $scope.data.recommendedResults.totalCost = totalCalculations.totalCost;
                $scope.data.recommendedResults.totalDuration = totalCalculations.totalDuration;
                        
             }
            return true;
        });


    }






});
