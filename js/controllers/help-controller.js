(function(){
    'use strict';

    angular.module('pocketMap.controllers')

    .controller('HelpCtrl', ['$scope', '$timeout', '$rootScope',
        function($scope, $timeout, $rootScope) {

            
            $scope.step = {};
            $scope.steps = [

                {
                    title: 'Welcome',
                    //text: '<div>Hi! I will quickly drive you into the application features.<br>Click on the next button to continue</div>',
                    template : "templates/help/welcome.html",
                    backdrop: true,
                    buttons : {
                        next : {
                            label : 'The map',
                            step : 1
                        }
                    }
                },

                {
                    title : 'The map',
                    //text : 'This the map. You can navigate it by dragging with your fingers to move around',
                    template : "templates/help/map.html",
                    backdrop : false,
                    highlight : '#main-map',
                    insideTarget : true,
                    buttons : {
                        prev : {
                            label : 'Welcome',
                            step : 0
                        },
                        next : {
                            label : 'Map controls',
                            step : 2
                        }
                    }
                },


                {
                    title : 'Map controls',
                    //text : 'With the tools in this bar you can control map positioning and rotation.',
                    template : "templates/help/map_controls.html",
                    backdrop : false,
                    highlight : '.toolbar',
                    buttons : {
                        prev : {
                            label : 'The map',
                            step : 1
                        },
                        next : {
                            label : 'Points',
                            step : 3
                        }
                    }

                },

                {
                    title : 'Points of interest',
                    //text : 'With the tools in this bar you can show points of interest on map.',
                    template : "templates/help/pois.html",
                    backdrop : false,
                    highlight : '.bottom-toolbar',
                    buttons : {
                        prev : {
                            label : 'Map controls',
                            step : 2
                        },
                        next : {
                            label : 'Welcome',
                            step : 0
                        }
                    }

                },


            ];


           
            $scope.setStep = function(idx){
                $timeout(function(){
                    $scope.currentStep = idx;
                });
            };


            $scope.currentStep = 0;
 

            $scope.$watch('currentStep', function(nv){
                $scope.step = $scope.steps[nv];
                
            });

            


    }]);


}());