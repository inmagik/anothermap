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




            


            $scope.toService = function(service){
                $timeout(function(){
                    $scope.browserStatus.currentService = service;
                    $scope.browserStatus.context = 'service';
                    $scope.browserStatus.title = $scope.wmsInfo[service].Name;
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