(function(){
    'use strict';

    angular.module('pocketMap')
        .directive('featureCat', ['$rootScope','layersManager', function($rootScope, layersManager){
        return {

            restrict : 'A',
            scope : {feature:"="},
            template : "<span ng-if='feature._category'> <b>{{feature._category|human}}</b></span>",
            link : function(scope, element, attrs) {

            }



        }


    }])

    .directive('stopEvent', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                element.bind(attr.stopEvent, function (e) {
                    e.stopPropagation();
                });
            }
        };
     });
    

}());