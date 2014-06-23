(function(){
    'use strict';

    angular.module('pocketMap')
        .directive('featureTable', ['$rootScope','layersManager', function($rootScope, layersManager){
        return {

            restrict : 'A',
            scope : {'props' : "="},
            templateUrl : "templates/feature-table.html",
            link : function(scope, element, attrs) {
                scope.namedProps = ['amenity', 'building', 'tourism', 'religion'];
                scope.geoProps = ['lat', 'lon'];
            }



        }


    }]);
    

}());