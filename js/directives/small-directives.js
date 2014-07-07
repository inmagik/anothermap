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
     })


    .directive('layerItem', function ($timeout) {
        return {
            restrict: 'A',
            templateUrl : 'templates/layer-item.html',
            scope : { layer : "="},
            link: function (scope, element, attr) {

                scope.$watch('layer', function(){
                    scope.attributions = [];
                    
                    var s = scope.layer.layer.getSource();
                    var attributions = s.attributions_ || [];
                    _.each(attributions, function(item){
                        $timeout(function(){
                            scope.attributions.push(item.getHTML())
                            console.log("s", scope.attributions)
                        });
                    });
                });

                scope.getAttributions = function(){
                    var o= "<div>" + "".join(scope.attributions) +"</div>"
                    console.log("0",o)
                    return o;
                }



            }
        };
     });
    

}());