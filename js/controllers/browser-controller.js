(function(){
    'use strict';

    angular.module('pocketMap.controllers')

    .controller('BrowserCtrl', ['$scope', '$timeout', '$rootScope','wmsService', 'osmLayersService', 'mapquestLayersService', 'layersManager',  '$ionicScrollDelegate', '$q', 'persistenceService', 'worldWMSUrls',
        function($scope, $timeout, $rootScope, wmsService, osmLayersService, mapquestLayersService, layersManager, $ionicScrollDelegate, $q, persistenceService, worldWMSUrls) {

        
            
            
            $scope.context = 'index';

            $scope.browserStatus  = {
                currentService : null,
                title : 'Services index'

            };

            


            $scope.mapLayersData = {
                'osm-layers' : osmLayersService.layers,
                'stamen-layers' : osmLayersService.stamenLayers,
                'mapquest-layers' : mapquestLayersService.layers
            }




            $scope.mapServicesData = {

                'osm' : {
                    title : 'OpenStreetMap Based Layers',
                    abstract : 'Based on data from the OpenstreetMap project',
                    services  : [

                        {
                            title : 'OpenStreetMap Layers',
                            abstract : 'Layers from the OSM project',
                            id : 'osm-layers'
                        },
                        {
                            title : 'Stamen Layers',
                            abstract : 'Layers by Stamen Maps',
                            id : 'stamen-layers'
                        },

                    ]
                },

                'mapquest' : {
                    title : 'MapQuest',
                    abstract : 'Based on data from the OpenstreetMap project',
                    services  : [

                        {
                            title : 'MapQuest Layers',
                            abstract : 'Layers by MapQuest',
                            id : 'mapquest-layers'
                        },

                    ]
                }

            };

            $scope.mapServicesOrder = ['osm', 'mapquest'];


            var wmsUrls = worldWMSUrls.wmsUrls;
            


            
            $scope.toService = function(svc){

                var layers = $scope.mapLayersData[svc.id];
                
                $timeout(function(){
                    $scope.browserStatus.currentService = svc.id;
                    $scope.browserStatus.context = 'service';
                    $scope.browserStatus.title = svc.title;    
                    $scope.currentLayers = layers;
                    $ionicScrollDelegate.scrollTop();
                });
            };


            $scope.toIndex = function(service){
                $timeout(function(){
                    $scope.browserStatus.currentService = null;
                    $scope.browserStatus.context = 'index';
                    $scope.browserStatus.title = 'Services index';
                    $ionicScrollDelegate.scrollTop();
                });
            };


            $scope.layerInMap = function(uid){
                return layersManager.getLayerConfigById('main-map', uid) != null;
            };


            $scope.addLayer = function(layerConfig){
                if($scope.layerInMap(layerConfig.uid)){
                    return;
                }
                layersManager.addLayer('main-map', layerConfig);
                layerConfig.layer.setVisible(true);
            };


            $scope.removeLayer = function(layerConfig){
                layersManager.removeLayer('main-map', layerConfig);
            };


            
            
            
            var plainUrls = [];
            _.each(wmsUrls, function(item){
                plainUrls = plainUrls.concat(item.urls);
            })
            wmsService.setWmsUrls(plainUrls);

            var loadWms = function(){
                _.each(wmsUrls, function(item){
                    var groupItem = {
                        title  : item.groupName,
                        abstract :  item.groupName,
                        services : []
                    };
                    
                    _.each(item.urls, function(u){
                        var info = wmsService.wmsInfo[u];
                        var layers = wmsService.wmsLayers[u];
                        var svc = {
                            title : info.Title,
                            abstract : info.Abstract,
                            id : item.groupName + info.Title
                        }
                        groupItem.services.push(svc);
                        $scope.mapLayersData[item.groupName + info.Title] = layers;
                    })

                    $timeout(function(){
                        $scope.mapServicesData[item.groupName] = groupItem;
                        $scope.mapServicesOrder.push(item.groupName);

                    });

                });
            };

            wmsService.loadWmsLayers().then(function(data){
                loadWms(data);
            });


            $scope.$on("mapReady", function(){
                var cfg = persistenceService.getLastMapConfig();
                if(cfg){
                    console.log("cfg found", cfg)
                    if(cfg.layers){
                        $rootScope.$broadcast('browserLoadMap', cfg);
                        return;
                    }
                } 
                
                $scope.addLayer($scope.mapLayersData['osm-layers'][0])    
                
                
            });


            $scope.$on('browserLoadMap', function(evt,data){
                layersManager.clearLayers('main-map');
                _.each(data.layers, function(item){
                    var candidate=null;
                    for(var d in $scope.mapLayersData){
                        var dd = $scope.mapLayersData[d];
                        candidate = _.findWhere(dd, item);
                        if(candidate){
                            $scope.addLayer(candidate)             
                            break;
                        }
                    }
                    if(!candidate){
                        console.log("cannot find layer for", item)
                    }

                });
            })



    }]);


}());