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
        
        // MyDirectedGraph.prototype.getAllPath = function(vertex, toVertex) {
        //     if (!~this.vertices.indexOf(vertex)) {
        //         return console.log('Vertex not found');
        //     }
        //     var visited = [];
        //     return (this._getAllPath(vertex, toVertex, visited, []));
        // };
        // MyDirectedGraph.prototype._getAllPath = function(vertex, toVertex, visited, path) {
        //     visited[vertex] = true;

        //     path.push(vertex);
        //     if (vertex === toVertex) {
        //         path.push(vertex);
        //     } else {
        //         for (var i = 0; i < this.edges[vertex].length; i++) {
        //             if (!visited[this.edges[vertex][i]]) {
        //                 this._getAllPath(this.edges[vertex][i], toVertex, visited, path);
        //             }
        //         }

        //     }

        //     path.pop();
        //     visited[vertex] = false;


        // };
       
        /**
         * [createGraphAndGetBestPath returns]
         * @param  {array} deals             list Of Available deals
         * @param  {array} departedCities    list of all departed cities
         * @param  {array} arrivalCities     list of all arrival cities
         * @param  {string} cityToDepartFrom city user depart from
         * @param  {string} cityToarrive     city user want to arrive
         * @return {Object}                  Object containing 'cheapest','fastest' and 'all' trip objects
         */
        var createGraphAndGetBestPath = function(deals, departedCities, arrivalCities, cityToDepartFrom, cityToarrive) {
            var graph = new MyDirectedGraph();
            var bestPaths = [];
            var bestPathsLength = 0;
            var transportLength = 0;
            var i = 0,j=0;
            var bestTravelOptions = { 'cheapest': [], 'fastest': [], all: [] };
            departedCities.forEach(function(value, index) {
                graph.addVertex(value, getMatchedDepartures(deals, value));
            })
            deals.forEach(function(value, index) {
                if (value.arrival) {
                    graph.addEdge(value.departure, value.arrival);

                }
            });

            bestPaths = graph.pathFromTo(cityToDepartFrom, cityToarrive);
            bestPathsLength = bestPaths.length;
            for (i=0; i < bestPathsLength; i += 1) {
                transportLength = bestPaths[i].length;
                for(j=0;j< transportLength; j+=1){
                  bestTravelOptions['cheapest'].push(getCheapestTravel(bestPaths[i][j],true));
                  bestTravelOptions['fastest'].push(getFastestTravel(bestPaths[i][j],true));
                }
                

            }
            return bestTravelOptions;
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
            var cheaptestTravel =  _.min(validDeals, function(value) {

                if(value.discount){
                   //calculating discounted price 
                   return value.cost-((value.cost * value.discount)/100);

                }else{
                  return value.cost
                }
            });
            if(cheaptestTravel && cheaptestTravel.discount){
              //storing discounted price 
              cheaptestTravel.discountedPrice = cheaptestTravel.cost-((cheaptestTravel.cost * cheaptestTravel.discount)/100);
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
                return value.duration.m && (value.cost - ((value.cost-value.discount)/100))
            })
        }



        return {
            sortArray: sortArray,
            getMatchedDepartures: getMatchedDepartures,
            calculateTotalTimeAndCost: calculateTotalTimeAndCost,
            getCheapestTravel: getCheapestTravel,
            getFastestTravel: getFastestTravel,
            createGraphAndGetBestPath: createGraphAndGetBestPath,
        }
    })
