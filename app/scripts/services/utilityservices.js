'use strict';

/**
 * @ngdoc service
 * @name travelFinderApp.utilityFactory
 * @description
 * # utilityFactory
 * Factory in the travelFinderApp.
 */
angular.module('travelFinderApp')
    .factory('searchValidation', function(underscore) {
        /**
         * [isAValidSearch checks if starting city and arrival city or the same]
         * @param  {string}  departureCity  
         * @param  {string}  arrivalCity   
         * @return {Boolean}               true if departure and arrival are the same
         */
        var isAValidSearch = function(departureCity, arrivalCity) {
            return departureCity === arrivalCity
        }
        return {
            isAValidSearch: isAValidSearch
        }
    })


.factory('tripSorterFactory', function(underscore) {
    var _ = underscore;
    var allPossiblePaths = [];
    var currentPath = [];
    var citiesTraversed = [];
    var cacheThisSearch = {
        'departure': '',
        'arrival': '',
        'isDiscountedPrice': true
    };
    var bestTravelDeals = { 'cheapest': {}, 'fastest': {}, 'allTrips': {} };
    /*
        MyDirectedGraph
        *stores response.json's data in a graph data structures

     */
    function MyDirectedGraph() {
        this.vertices = [];
        this.edges = [];
        this.data = [];
        this.numberOfEdges = 0;
    }

    /*
       addVertex
       *function to  add vertices MyDirectedGraph
       *Each location is stored as vertex in the  MyDirectedGraph graph

     */
    MyDirectedGraph.prototype.addVertex = function(vertex, travelObj) {
            this.vertices.push(vertex);
            this.edges[vertex] = [];

            this.data[vertex] = travelObj;


        }
        /*
            addEdge
            *function to add edges MyDirectedGraph
            *connection between each location is representated as edge in  MyDirectedGraph graph

         */
    MyDirectedGraph.prototype.addEdge = function(vertex1, vertex2) {
        if (!this.edges[vertex1]) {
            this.edges[vertex1] = [];
        }
        if (!this.edges[vertex2]) {
            this.edges[vertex2] = [];
        }
        if (this.edges[vertex1].indexOf(vertex2) === -1) {
            this.edges[vertex1].push(vertex2);
        }
        if (this.edges[vertex2].indexOf(vertex1) === -1) {
            this.edges[vertex2].push(vertex1);
        }


        this.numberOfEdges++;
    };

    /*
        pathFromTo
        *function to find path from source to destination
     */

    MyDirectedGraph.prototype.pathFromTo = function(vertexSource, vertexDestination) {
        if (!~this.vertices.indexOf(vertexSource)) {
            return console.log('Vertex not found');
        }
        var queue = [];
        queue.push(vertexSource);
        var visited = [];
        visited[vertexSource] = true;
        var paths = [];

        while (queue.length) {
            var vertex = queue.shift();
            for (var i = 0; i < this.edges[vertex].length; i++) {
                if (!visited[this.edges[vertex][i]]) {
                    visited[this.edges[vertex][i]] = true;
                    queue.push(this.edges[vertex][i]);
                    paths[this.edges[vertex][i]] = vertex;
                }
            }
        }
        if (!visited[vertexDestination]) {
            return undefined;
        }
        var path = [];
        for (var j = vertexDestination; j != vertexSource; j = paths[j]) {
            //getting json objects for corresponding departure and arrival
            path.push([_.filter(this.data[paths[j]], { 'arrival': j })]);
        }
        return path.reverse();
    };

    /**
     * [trackVisited to check if a given path is travered already or not]
     * @param  {currentNode} currentNode current node in my traversal
     * @return {Boolean}                 true if it is already visited or false
     */
    MyDirectedGraph.prototype.trackVisited = function(currentNode) {
            var srcPos = _.findIndex(currentPath, { 'arrival': currentNode.departure });
            var desPos = _.findIndex(currentPath, { 'arrival': currentNode.arrival });
            //making sure we dont cycle throught hte graph
            if (currentPath.length > 0 &&
                (currentNode.arrival == currentPath[0].departure || currentNode.arrival == currentPath[0].arrival)) {
                return true;
            }
            //if city is traveresed and it can not lead us to our destination
            if (citiesTraversed.length > 0 && citiesTraversed.indexOf(currentNode.arrival) > -1) {
                return true;
            }
            if (desPos == -1) {
                return false;
            }
            if (srcPos > desPos) {
                return true;
            }
            return false;
        }
        /**
         * [getAllPaths recursive method to get all possible valid paths from cityToDepart to cityToArrive]
         * @param  {string} vertexSource      city to depart from
         * @param  {string} vertexDestination city to arrive
         * @param  {array} deals             list of available deals
         * @return {allPossiblePaths}        allPossiblePaths from given source to destination
         */
    MyDirectedGraph.prototype.getAllPaths = function(cityToDepart, cityToArrive, deals) {
        var self = this;
        var deepCopiedPath = [];
        this.data[cityToDepart].forEach(function(connectedNode) {
            if (connectedNode.arrival === cityToArrive) {
                currentPath.push(connectedNode);
                deepCopiedPath = [];
                //To make sure we have temporary deep copied version for currentpath since we got to prevent it event when user pop's it
                angular.copy(currentPath, deepCopiedPath)
                allPossiblePaths.push({ 'paths': deepCopiedPath, 'calculations': calculateTotalTimeAndCost(deepCopiedPath) });
                currentPath.pop();
            } else if (!self.trackVisited(connectedNode)) {
                currentPath.push(connectedNode);
                self.getAllPaths(connectedNode.arrival, cityToArrive, deals);
                currentPath.pop();
                //to make sure we can reach the cityToArrive via current connectedCity
                if (_.findIndex(_.filter(deals, { 'departure': connectedNode.arrival }), { 'arrival': cityToArrive }) === -1) {
                    citiesTraversed.push(connectedNode.arrival);
                }


            }
        });
        return allPossiblePaths;
    }

    /**
     * [createGraphAndGetDeals returns]
     * @param  {array} deals             list Of Available deals
     * @param  {array} departedCities    list of all departed cities
     * @param  {array} arrivalCities     list of all arrival cities
     * @param  {string} cityToDepartFrom city user depart from
     * @param  {string} cityToarrive     city user want to arrive
     * @return {Object}                  Object containing 'cheapest','fastest' and 'all' trip objects
     */
    var createGraphAndGetDeals = function(deals, departedCities, arrivalCities, cityToDepartFrom, cityToarrive, considerDiscount) {
            cacheThisSearch.departure = cityToDepartFrom;
            cacheThisSearch.arrival = cityToarrive;
            cacheThisSearch.isDiscountedPrice = considerDiscount;
            var graph = new MyDirectedGraph();
            var bestPaths = [];
            var bestPathsLength = 0;
            var transportLength = 0;
            var i = 0,
                j = 0;
            var allPaths = [];
            departedCities.forEach(function(value, index) {
                graph.addVertex(value, getMatchedDepartures(deals, value));
            })
            deals.forEach(function(value, index) {
                if (value.arrival) {
                    graph.addEdge(value.departure, value.arrival);

                }
            });
            allPossiblePaths = [];
            citiesTraversed = [];
            bestPaths = graph.pathFromTo(cityToDepartFrom, cityToarrive);
            graph.getAllPaths(cityToDepartFrom, cityToarrive, deals);
            bestPathsLength = bestPaths.length;
            bestTravelDeals = {
              "cheapest":{"paths":[]},
              "fastest":{"paths":[]},
              "allTrips":{"paths":[]}
             
            }
            for (i = 0; i < bestPathsLength; i += 1) {
                transportLength = bestPaths[i].length;
                for (j = 0; j < transportLength; j += 1) {

                    bestTravelDeals.cheapest.paths.push(getCheapestTravel(bestPaths[i][j], considerDiscount));
                    bestTravelDeals.fastest.paths.push(getFastestTravel(bestPaths[i][j]))


                }


            }
            bestTravelDeals.cheapest.calculations = calculateTotalTimeAndCost(bestTravelDeals.cheapest.paths);
            bestTravelDeals.fastest.calculations = calculateTotalTimeAndCost(bestTravelDeals.fastest.paths);
            bestTravelDeals.allTrips = allPossiblePaths;
            bestTravelDeals.totalPossiblePath = allPossiblePaths.length;
            return bestTravelDeals;
        }
        /**
         * sortArray 
         * @param  {array} arrayToBeSorted used for sorting a given array
         * @return void                
         */
    var sortArray = function(arrayToBeSorted) {
        return arrayToBeSorted.sort(function(a, b) {
            if (a < b) {
                return -1;
            }
            if (a > b) {
                return 1;
            }
            return 0;
        });
    }


    /**
     * [getMatchedDepartures ]
     * @param  {array} allDeals      list of all deals
     * @param  {string} departureCity city to depart from
     * @return {array}                list of all trip objects matching departure as `departureCity`
     */
    var getMatchedDepartures = function(allDeals, departureCity) {
        return _.filter(allDeals, { 'departure': departureCity });

    }


    /**
     * [calculateTotalTimeAndCost Takes possible deals and calculates total time and cost]
     * @param  {array} recommendedDeals  list of recommended deals after search
     * @return {Object}                  contains total duration for given deals and total cost
     */
    var calculateTotalTimeAndCost = function(recommendedDeals) {
        var hours = 0;
        var minutes = 0;
        var totalCost = 0;
        recommendedDeals.forEach(function(value, index) {
            hours += Number(value.duration.h);
            minutes += Number(value.duration.m);
            totalCost += value.cost;
        });
        //refactoring time for 60 minutes scale
        return { totalCost: totalCost, totalDuration: { h: (hours + Math.floor(minutes / 60)), m: (minutes % 60) } };
    }

    /**
     * [getCheapestTravel takes list of trips and gives back cheapest possible trip after consider discount]
     * @param  {array} validDeals         list Of all deals
     * @param  {Boolean} considerDiscount If user wants to see non discounted price this will be `false`
     * @return {Object}                    cheapest trip object in a given list
     */
    var getCheapestTravel = function(validDeals, considerDiscount) {
            var cheaptestTravel = _.min(validDeals, function(value) {

                if (value.discount && considerDiscount) {

                    //calculating discounted price 
                    return value.cost - ((value.cost * value.discount) / 100);

                } else {
                    return value.cost
                }
            });
            if (cheaptestTravel && considerDiscount) {
                //storing discounted price 
                cheaptestTravel.cost = cheaptestTravel.cost - ((cheaptestTravel.cost * cheaptestTravel.discount) / 100);
            }

            return cheaptestTravel;


        }
        /**
         * [getFastestTravel get fastest travel(less duration)]
         * @param  {array} validDeals  list of all possible deals 
         * @return {Object}            trip object which is fastest from given deals
         */
    var getFastestTravel = function(validDeals) {
        var minHourFromTheArray = _.min(_.pluck(validDeals, 'duration'), function(value) {
            return value.h
        });
        //now checking if there is a value of array after the found index which has same hour but with less minutes
        var minHourCollection = validDeals.filter(function(value, index) {
            if (minHourFromTheArray.h === value.duration.h) {
                return value;
            }
        });
        //if time is same considering the cheapest after discount
        return _.min(minHourCollection, function(value) {
            return value.duration.m && (value.cost - ((value.cost - value.discount) / 100))
        })
    }

    var isACachedSearch = function(from, to, considerDiscount) {
        if (cacheThisSearch.departure === from && cacheThisSearch.arrival === to && bestTravelDeals.allTrips.length > 0 && cacheThisSearch.isDiscountedPrice === considerDiscount) {
            return true;
        }
        return false;
    }
    var returnCachedSearch = function() {
        return bestTravelDeals;
    }



    return {
        sortArray: sortArray,
        getMatchedDepartures: getMatchedDepartures,
        calculateTotalTimeAndCost: calculateTotalTimeAndCost,
        getCheapestTravel: getCheapestTravel,
        getFastestTravel: getFastestTravel,
        createGraphAndGetDeals: createGraphAndGetDeals,
        isACachedSearch: isACachedSearch,
        returnCachedSearch: returnCachedSearch

    }
})
