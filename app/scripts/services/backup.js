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
        var isAValidSearch = function(departureCity, arrivalCity) {
            return departureCity === arrivalCity
        }
        return {
            isAValidSearch: isAValidSearch
        }
    })
    .factory('utilityFactory', function(underscore) {
        var _ = underscore;

        function MyDirectedGraph() {
            this.vertices = {};
            this.addVertex = function(name, edges) {
                edges = edges || null;
                if (!this.vertices[name]) {
                    this.vertices[name] = {}
                };
                if (!this.vertices[name][edges.arrival]) {
                    this.vertices[name][edges.arrival] = {};
                }
                this.vertices[name][edges.arrival][edges.transport] = edges;
            }
            this.getVertices = function() {
                return this.vertices;
            }
        }

        function getShortestPaths(previous, shortestPaths, startVertex, dist) {
            debugger
            for (var node in shortestPaths) {
                var path = shortestPaths[node];

                while (previous[node]) {
                    path.push(node);
                    node = previous[node];
                }

                //gets the starting node in there as well if there was a path from it
                if (dist[node] === 0) {
                    path.push(node);
                }
                path.reverse();
            }
        }


        function findSmallest(dist, q) {
            var min = Infinity;
            var minNode;

            for (var node in q) {
                if (dist[node] <= min) {
                    min = dist[node]
                    minNode = node;
                }
            }

            delete q[minNode]
            return minNode;
        }

        function djikstra(graph, startVertex) {
            var dist = {};
            var prev = {};
            var q = {};
            var shortestPaths = {};

            for (var vertex in graph.vertices) {
                dist[vertex] = Infinity;
                prev[vertex] = null;
                q[vertex] = graph.vertices[vertex];
                shortestPaths[vertex] = [];
            }

            dist[startVertex] = 0;

            while (Object.keys(q).length !== 0) {
                var smallest = findSmallest(dist, q);
                var smallestNode = graph.vertices[smallest]
                    //searches for the vertex u in the vertex set Q that has the least dist[smallest] value.

                for (var neighbor in smallestNode) {
                    var alt = dist[smallest] + _.min(smallestNode[neighbor], 'cost').cost;
                    //smallestNode[neighbor] is the distance between smallest and neighbor
                    if (alt < dist[neighbor]) {
                        dist[neighbor] = alt
                        prev[neighbor] = smallest
                    }
                }
            }
            getShortestPaths(prev, shortestPaths, startVertex, dist)

            return {
                shortestPaths: shortestPaths,
                shortestDistances: dist
            }


        }

        var createDistanceMatrix = function(deals, departedCities, arrivalCities, cityToDepartFrom, cityToarrive) {
            var graph = new MyDirectedGraph();
            deals.forEach(function(value, index) {
                if (value.transport) {
                    graph.addVertex(value.departure, { time: value.duration, cost: value.cost, transport: value.transport, arrival: value.arrival, departure: value.departure });
                }
            });
            // var paths = testPath(graph,cityToDepartFrom, cityToarrive,[],cityToDepartFrom);
            // console.log(paths);
            var paths = [];
            for (var prop in graph.vertices[cityToDepartFrom]) {
                if (prop === cityToarrive) {
                    paths.push([cityToDepartFrom, prop]);
                } else {
                    var ans = [];
                    var traversedNodes = [];
                    traversedNodes.push(graph.vertices[prop]);
                    var allNodes = graph.vertices;
                    var marked = {};
                    while ((traversedNodes).length !== 0) {
                        var v = traversedNodes.shift();
                        for (var prop1 in v) {
                            if (v[prop1].arrival === cityToarrive && prop1 !== cityToDepartFrom) {
                                paths.push([cityToDepartFrom, prop, prop1]);
                            } else if (prop1 !== cityToDepartFrom) {
                                for (var prop2 in graph.vertices[prop1]) {

                                    if (prop2 === cityToarrive && (prop2 !== cityToDepartFrom || prop2 !== prop1)) {
                                        paths.push([cityToDepartFrom, prop, prop1, prop2]);

                                    } else if (graph.vertices[prop2][cityToarrive]) {
                                        paths.push([cityToDepartFrom, prop, prop1, prop2, cityToarrive]);
                                    }
                                }

                            }



                        }

                        // ans.push(v);
                        // adjList = v.adjList;
                        // for (var i = 0; i < adjList.length; i++) {
                        //     u = adjList[i];
                        //     if (marked[u.name] != true) {
                        //         traversedNodes.push(u);
                        //         marked[u.name] = true;

                        //     }
                        // }
                    }
                }
            }
            console.log(_.uniq(paths));
            // samplePathFinding(graph, cityToDepartFrom, cityToarrive);
            // djikstra(graph, cityToarrive);


        }
        var testPath = function(graph, cityToDepartFrom, cityToarrive, paths, originCity) {
            if (graph.vertices[cityToDepartFrom].visited) {
                return paths;
            }
            graph.vertices[cityToDepartFrom].visited = true;
            paths.push(graph.vertices[cityToDepartFrom]);
            for (var prop in graph.vertices[cityToDepartFrom]) {
                if (prop === cityToarrive) {
                    // paths[paths.length-1].paths = [];
                    paths.push(graph.vertices[cityToDepartFrom][prop]);
                } else if (prop !== 'paths' && prop !== 'visited') {
                    if (!graph.vertices[prop].visited) {
                        testPath(graph, prop, cityToarrive, paths, originCity);
                    }
                }






            }

            // if(!graph.vertices[originCity].paths){
            //   graph.vertices[originCity].paths = [];
            // }
            // graph.vertices[originCity].paths.push(graph.vertices[cityToDepartFrom]);
            // for(var vertex in graph.vertices[cityToDepartFrom]){

            //   if(vertex === cityToarrive){
            //     graph.vertices[originCity].paths.push(graph.vertices[vertex][cityToarrive]);
            //   }else{

            //     if(vertex!=='visited' && vertex!=='paths' && vertex!=='visited') {
            //       graph.vertices[cityToDepartFrom].visited = true;
            //       if(!graph.vertices[vertex].visited){
            //         testPath(graph,vertex,cityToarrive,paths,cityToDepartFrom);
            //       }
            //       // graph.vertices[originCity].paths.push(graph.vertices[vertex][cityToarrive]);
            //       // paths.push(testPath(graph,city, cityToarrive,paths));
            //     }
            //   }
            //   // sgraph.vertices[originCity].paths.pop()
            //   graph.vertices[cityToDepartFrom].visited = true;




            // }
            return paths;
        }

        var samplePathFinding = function(graph, departure, arrival) {



        }

        var sortArray = function(arrayToBeSorted) {
            return arrayToBeSorted.sort(function(a, b) {
                if (a < b) {
                    return -1;
                }
                if (a > b) {
                    return 1;
                }

                // names must be equal
                return 0;
            });
        }
        var getFirstMatchedDepartures = function(allDeals, departureCity) {
            return _.filter(allDeals, { 'departure': departureCity });

        }
        var getMatchedDepartures = function(allDeals, departureCity, arrivalCity) {
            return _.filter(allDeals, { 'departure': departureCity, 'arrival': arrivalCity });

        }
        var getMatchedArrivals = function(allDeals, arrivalCity) {
            return _.filter(allDeals, { 'arrival': arrivalCity });
        }
        var findPaths = function(deals, selectedDeparture, validDestinations, validArrivals) {
            var paths = [];
            validArrivals.forEach(function(value, index) {
                var validPath = _.find(deals, { 'arrival': value.departure });
                if (validPath.departure === selectedDeparture) {
                    paths.push(value);
                }


            });
            return paths;


        }

        var availablePaths = function(distanceMatrix, deals, departedCities, arrivalCities, cityToDepartFrom, cityToarrive, paths, count, originCity) {
            if (count === 0) {
                return paths;
            }
            var departIndex = _.findIndex(departedCities, function(travelObj) {
                return travelObj === cityToDepartFrom
            });
            var matrixLength = distanceMatrix.length;
            var arrivalIndex = _.findIndex(arrivalCities, function(travelObj) {
                return travelObj === cityToarrive
            });

            if (distanceMatrix[departIndex][arrivalIndex] !== Infinity) {
                if (!paths[originCity]) {
                    paths[originCity] = [];

                }
                if (!paths[originCity][cityToDepartFrom]) {
                    paths[originCity][cityToDepartFrom] = [];
                    paths[originCity][cityToDepartFrom] = distanceMatrix[departIndex][arrivalIndex]
                }


                // if(!paths[originCity]){
                //   paths[originCity] = distanceMatrix[departIndex]; 
                //   paths[originCity].via = [];
                // }
                // if(paths[originCity].via.length===0){

                //   paths[originCity].via = [];
                // }
                // paths[originCity].via.push(distanceMatrix[departIndex][arrivalIndex]);

                // else{
                // for(var prop in paths[originCity]){
                //     if(prop!==cityToDepartFrom && typeof paths[originCity][cityToDepartFrom] === 'undefined'){
                //        paths[originCity][cityToDepartFrom] = [];
                //        paths[originCity][cityToDepartFrom].push(distanceMatrix[departIndex][arrivalIndex]);
                //     }

                // }}


                // return paths;
            } else {
                originCity = cityToDepartFrom;
            }

            // for (var j = 0; j < matrixLength; j += 1) {
            for (var k = 0; k < distanceMatrix[departIndex].length; k += 1) {
                if (distanceMatrix[departIndex][k] !== Infinity && distanceMatrix[departIndex][k].arrival !== cityToarrive) {
                    // paths[originCity][cityToDepartFrom] = [];


                    availablePaths(distanceMatrix, deals, departedCities, arrivalCities, distanceMatrix[departIndex][k].arrival, cityToarrive, paths, count - 1, originCity);
                }

            }
            // }
            return paths;


        }
        var createDistanceMatrix1 = function(deals, departedCities, arrivalCities, cityToDepartFrom, cityToarrive) {
            var x = new Array(departedCities.length);
            var departIndex = _.findIndex(departedCities, function(travelObj) {
                return travelObj === cityToDepartFrom
            });
            var arrivalIndex = _.findIndex(arrivalCities, function(travelObj) {
                return travelObj === cityToarrive
            });
            var toArrival = [];
            var fromArrival = [];
            var fullPath = [];
            for (var i = 0; i < x.length; i += 1) {
                x[i] = new Array(arrivalCities.length);
                x[i].fill(Infinity);
            }
            for (var j = 0; j < x.length; j += 1) {
                for (var k = 0; k < x[j].length; k += 1) {
                    var matchedArray = getMatchedDepartures(deals, departedCities[j], arrivalCities[k]);
                    if (matchedArray.length > 0) {
                        var bus = _.find(matchedArray, { 'transport': 'bus' });
                        var car = _.find(matchedArray, { 'transport': 'car' });
                        var train = _.find(matchedArray, { 'transport': 'train' });
                        x[j][k] = {
                            'departure': departedCities[j],
                            'arrival': arrivalCities[k],
                            'bus': {
                                'cost': bus.cost,
                                'discount': bus.discount,
                                'time': Number(bus.duration.h) + Math.floor(Number(bus.duration.m) / 60) + (Number(bus.duration.m) % 60)
                            },
                            'car': {
                                'cost': car.cost,
                                'discount': car.discount,
                                'time': Number(car.duration.h) + Math.floor(Number(car.duration.m) / 60) + (Number(car.duration.m) % 60)
                            },
                            'train': {
                                'cost': train.cost,
                                'discount': train.discount,
                                'time': Number(train.duration.h) + Math.floor(Number(train.duration.m) / 60) + (Number(train.duration.m) % 60)
                            }
                        }

                    }


                }

            }
            var paths = availablePaths(x, deals, departedCities, arrivalCities, cityToDepartFrom, cityToarrive, [], 5, cityToDepartFrom)
            return (paths);


        }








        var calculateTotalTimeAndCost = function(recommendedDeals) {
            var hours = 0;
            var minutes = 0;
            var totalCost = 0;
            //can be repalecd with underscore functions as well 
            recommendedDeals.forEach(function(value, index) {
                hours += Number(value.duration.h);
                minutes += Number(value.duration.m);
                totalCost += value.cost;
            });

            //refactoring time for 60 minutes scale
            return { totalCost: totalCost, totalDuration: { h: (hours + Math.floor(minutes / 60)), m: (minutes % 60) } };

        }

        var getCheapestTravel = function(validDeals, considerDiscount) {

            return [_.min(validDeals, function(value) {
                return considerDiscount ?
                    (value.cost - value.discount) : value.cost;
            })];


        }

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
            return [_.min(minHourCollection, function(value) {
                return value.duration.m
            })];




        }



        return {
            sortArray: sortArray,
            getMatchedDepartures: getMatchedDepartures,
            getMatchedArrivals: getMatchedArrivals,
            calculateTotalTimeAndCost: calculateTotalTimeAndCost,
            getCheapestTravel: getCheapestTravel,
            getFastestTravel: getFastestTravel,
            findPaths: findPaths,
            createDistanceMatrix: createDistanceMatrix,
            getFirstMatchedDepartures: getFirstMatchedDepartures

        }
    })
