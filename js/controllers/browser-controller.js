(function(){
    'use strict';

    angular.module('pocketMap.controllers')

    .controller('BrowserCtrl', ['$scope', '$timeout', '$rootScope','indexService', '$ionicScrollDelegate',
        function($scope, $timeout, $rootScope, indexService, $ionicScrollDelegate) {

        
            
            $scope.browserTitle = "Browser";
            $scope.context = 'index';
            



    }]);


}());