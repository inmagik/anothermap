(function(){
    'use strict';

    angular.module('pocketMap.controllers')

    .controller('SearchCtrl', ['$scope', '$timeout', '$rootScope','indexService', '$ionicScrollDelegate',
        function($scope, $timeout, $rootScope, indexService, $ionicScrollDelegate) {

        
            

            $scope.search = function(){
                var field;
                if($scope.searchStatus.address){
                    field='display_name';
                }
                var w = indexService.searchFeatures($scope.searchStatus.search, field);
                $timeout(function(){
                    $scope.searchStatus.searchResults = w;
                    $scope.searchStatus.lastSearch = $scope.searchStatus.search;
                });
            };


            $scope.clear = function(){
                $timeout(function(){
                    $scope.searchStatus.searchResults = [];
                    $scope.searchStatus.search = '';
                    $scope.searchStatus.lastSearch = null;
                });

            };


            $scope.centerFeature = function(feature){
                $rootScope.$broadcast("centerSearchFeature", feature, feature._layerName);

            }


            $scope.orderDistanceFunction = function(result) {
                 return $rootScope.getDistanceFromLastPos(result.feature.geometry);
            };




            



    }]);


}());