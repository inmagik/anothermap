(function(){
    'use strict';

    angular.module('pocketMap.controllers')

    .controller('BrowserCtrl', ['$scope', '$timeout', '$rootScope','wmsService', 'osmLayersService', 'mapquestLayersService', 'layersManager',  '$ionicScrollDelegate', '$q',
        function($scope, $timeout, $rootScope, wmsService, osmLayersService, mapquestLayersService, layersManager, $ionicScrollDelegate, $q) {

        
            
            
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

            $scope.mapServicesOrder = ['osm', 'mapquest']


            var wmsUrls = [
                { 
                    groupName : 'Geoportale Nazionale',
                    urls : [
                        'wms_capabilities/geoportale/geologica.xml',
                        'wms_capabilities/geoportale/ita_ecopedologica.xml',
                        'wms_capabilities/geoportale/bacini.xml',
                        'wms_capabilities/geoportale/toponimi.xml',
                        'wms_capabilities/geoportale/base_de_agostini.xml',
                        'wms_capabilities/geoportale/zone_umide.xml',
                        'wms_capabilities/geoportale/sismica_2012.xml',
                        'wms_capabilities/geoportale/rischio_idro.xml',
                        


                    ]
                },
                /*
                { 
                    groupName : 'Regione Lombardia',
                    urls : [
                        'wms_capabilities/lombardia/orto_2012.xml',
                        'wms_capabilities/lombardia/ortofoto_2007.xml', 
                        'wms_capabilities/lombardia/ctr.xml', 
                        'wms_capabilities/lombardia/fisica.xml',
                        //'wms_capabilities/lombardia/dusaf.xml',
                    ]
                },
                { 
                    groupName : 'Regione Piemonte',
                    urls : [
                        'wms_capabilities/piemonte/sfondo_regione.xml',
                        'wms_capabilities/piemonte/ortofoto_piemonte.xml',
                    ]
                },
                { 
                    groupName : 'Regione Toscana',
                    urls : [
                        'wms_capabilities/toscana/ortofoto.xml',
                        //'wms_capabilities/toscana/ortofoto_piemonte.xml',
                    ]
                },
                */
                /*
                { 
                    groupName : 'Nasa',
                    urls : [
                        'wms_capabilities/nasa/nasa.xml',
                    ]
                }
                */
            
            ];
            


            
            $scope.toService = function(svc){

                var layers = $scope.mapLayersData[svc.id];
                
                $timeout(function(){
                    $scope.browserStatus.currentService = svc.id;
                    $scope.browserStatus.context = 'service';
                    $scope.browserStatus.title = svc.title;    
                    $scope.currentLayers = layers;
                    $ionicScrollDelegate.scrollTop();
                    
                })
            };

            $scope.toIndex = function(service){
                $timeout(function(){
                    $scope.browserStatus.currentService = null;
                    $scope.browserStatus.context = 'index';
                    $scope.browserStatus.title = 'Services index';
                    $ionicScrollDelegate.scrollTop();
                })
            };

            $scope.layerInMap = function(uid){
                return layersManager.getLayerConfigById('main-map', uid) != null;
            }


            $scope.addLayer = function(layerConfig){
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

            



    }]);


}());