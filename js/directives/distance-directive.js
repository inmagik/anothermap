(function(){
    'use strict';

    angular.module('pocketMap')
        .directive('distance', ['$rootScope','layersManager', function($rootScope, layersManager){
        return {

            restrict : 'A',
            scope : {'geom' : "="},
            templateUrl : "templates/distance.html",
            link : function(scope, element, attrs) {
                scope.getDistanceFromLastPos = $rootScope.getDistanceFromLastPos;
                scope.distance = null;

                $rootScope.$watch('uiStatus', function(nv){
                    if(!scope.geom){
                        return;
                    }
                    if(nv.lastPosition){
                        scope.distance = $rootScope.getDistanceFromLastPos(scope.geom);
                    } else {
                        scope.distance=null;
                    }

                }, true);
            
            }



        }


    }]);
    

}());