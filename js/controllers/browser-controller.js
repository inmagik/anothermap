(function(){
    'use strict';

    angular.module('pocketMap.controllers')

    .controller('BrowserCtrl', ['$scope', '$timeout', '$rootScope','wmsService', 'layersManager',  '$ionicScrollDelegate', '$q',
        function($scope, $timeout, $rootScope, wmsService, layersManager, $ionicScrollDelegate, $q) {

        
            
            
            $scope.context = 'index';

            $scope.browserStatus  = {
                currentService : null,
                title : 'Services index'

            };

            var urls = ['wms_capabilities/ortofoto_2007.xml', 
                'wms_capabilities/ctr.xml', 'wms_capabilities/fisica.xml', 'wms_capabilities/geologica.xml',
                'wms_capabilities/ita_ecopedologica.xml'];
            
            wmsService.setWmsUrls(urls);

            
            $scope.wmsUrls = []; 
            $scope.wmsLayers = {};
            $scope.wmsInfo = {};

            $scope.osmUrls = ['osmbase'];
            $scope.osmLayers = {
                'osmbase' : [
                    {
                        name : 'OpenStreetMap base Map',
                        group : 'rasters',
                        abstract : 'OpenLayers base Map',
                        layer : new ol.layer.Tile({
                            source : new ol.source.OSM()
                        })
                    },

                    
                    {
                        name : 'opencyclemap',
                        abstract : 'OpenStreetMap opencyclemap',
                        group : 'rasters',
                        layer : new ol.layer.Tile({
                            source : new ol.source.OSM({
                                url: 'http://{a-c}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png'
                            })
                        })

                    },
                    {
                        name : 'opencyclemap transport',
                        group : 'rasters',
                        abstract : 'OpenStreetMap opencyclemap transport',
                        layer : new ol.layer.Tile({
                            source : new ol.source.OSM({
                                url: 'http://{a-b}.tile2.opencyclemap.org/cycle/{z}/{x}/{y}.png'
                            })
                        })

                    },

                    {
                        name : 'OSM BW',
                        group : 'rasters',
                        abstract : 'OpenStreetMap BW',
                        layer : new ol.layer.Tile({
                            source : new ol.source.OSM({
                                url: 'http://{a-b}.toolserver.org/tiles/bw-mapnik/{z}/{x}/{y}.png',
                                crossOrigin: 'anonymous'

                            }),

                        })

                    },

                    {
                        name : 'openptmap',
                        group : 'rasters',
                        abstract : 'OpenStreetMap openptmap',
                        layer : new ol.layer.Tile({
                            source : new ol.source.OSM({
                                url: 'http://www.openptmap.org/tiles/{z}/{x}/{y}.png'
                            })
                        })

                    },
                    {
                        name : 'Toner',
                        group : 'rasters',
                        abstract : 'Stamen Toner ',
                        layer : new ol.layer.Tile({
                            source : new ol.source.Stamen({
                                layer : 'toner'
                            })
                        })

                    },
                    {
                        name : 'stamen-terrain',
                        group : 'rasters',
                        abstract : 'Stamen Terrain',
                        layer : new ol.layer.Tile({
                            source : new ol.source.Stamen({
                                layer : 'terrain'
                            })
                        })

                    },
                    {
                        name : 'stamen-watercolor',
                        group : 'rasters',
                        abstract : 'Stamen Watercolor ',
                        layer : new ol.layer.Tile({
                            source : new ol.source.Stamen({
                                layer : 'watercolor'
                            })
                        })

                    },




                ]
            };




            $scope.toService = function(service, type){
                console.log("xx", service,type)
                $timeout(function(){
                    $scope.browserStatus.currentService = service;
                    $scope.browserStatus.context = 'service';
                    
                    if(type=='osm'){
                        $scope.browserStatus.title = $scope.osmLayers[service].name;    
                        $scope.currentLayers = $scope.osmLayers;

                    } else {
                        $scope.browserStatus.title = $scope.wmsInfo[service].Title;    
                        $scope.currentLayers = $scope.wmsLayers;
                    }
                    
                })
            };

            $scope.toIndex = function(service){
                $timeout(function(){
                    $scope.browserStatus.currentService = null;
                    $scope.browserStatus.context = 'index';
                    $scope.browserStatus.title = 'Services index';
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


            wmsService.loadWmsLayers().then(function(data){
                console.log("ss", data);
                $scope.wmsUrls = wmsService.wmsUrls; 
                $scope.wmsLayers = wmsService.wmsLayers;
                $scope.wmsInfo = wmsService.wmsInfo;
            });

            



    }]);


}());