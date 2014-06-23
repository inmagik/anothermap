(function(){
    'use strict';

    angular.module('pocketMap.controllers')

    .controller('BrowserCtrl', ['$scope', '$timeout', '$rootScope','indexService', '$ionicScrollDelegate',
        function($scope, $timeout, $rootScope, indexService, $ionicScrollDelegate) {

        
            $scope.browserStatus = {
                layer  : null,
                feature : null,
                filter : ''
            };

            var cachedFeatures = {};

            $scope.browserTitle = "Browser";
            $scope.context = 'index';

            $scope.layers = [];
            $scope.features = [];
            $scope.loadedFeatures = 0;

            $scope.$watch(function(){
                return indexService.getLayersWithOptions({browser:true});
                }, 
                function(nv){
                    if(nv){
                        $scope.layers = nv;
                        
                    }
                    
                },
                true
            );

            $scope.clearFilter = function(){
                $timeout(function(){
                    $scope.browserStatus.filter=''
                });
            }

            $scope.loadMore = function(){
                console.log("loading;")
            }

            
            $scope.toIndex = function(){
                $timeout(function(){
                    $scope.browserStatus.layer = null;
                    $scope.browserStatus.feature = null;
                    $scope.features = [];
                    $scope.browserTitle = "Browser";
                    $scope.context = 'index';
                    $ionicScrollDelegate.scrollTop();

                })
            };
            

            $scope.loadPartial = function(layerName){
                layerName = layerName || $scope.browserStatus.layer;
                $timeout(function(){
                    var d = indexService.getFeaturesPaginated(layerName , $scope.loadedFeatures);
                    $scope.features = $scope.features.concat(d.features);
                    $scope.loadedFeatures = $scope.features.length;
                    //console.log("xxx", d, $scope.features)
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    if(d.num == $scope.loadedFeatures){
                        $scope.stopLoad = true;
                        cachedFeatures[layerName] = $scope.features
                    }
                })

            };


            $scope.stopLoad = false;
            var cacheLayer = function(layerName){
                cachedFeatures[layerName] = indexService.getFeatures(layerName);
                //console.log("cached layer:",layerName, cachedFeatures[layerName])
            }
            $scope.$on("indexService.registered",function(evt, layerName){
                cacheLayer(layerName);
            });


            $scope.toLayer = function(layerName, options){
                
                $timeout(function(){
                    //$scope.features = [];
                    $scope.stopLoad = false;
                    if(layerName != $scope.browserStatus.layerName){

                        if(cachedFeatures[layerName]){
                            $scope.stopLoad = true;
                            $scope.features = cachedFeatures[layerName];

                        } else {

                            if(options){
                                $scope.stopLoad = true;
                                cachedFeatures[layerName] = indexService.getFeatures(layerName);
                                $scope.features = cachedFeatures[layerName];
                                

                            } else {
                                $scope.stopLoad = false;
                                $scope.features = [];
                                $scope.loadedFeatures = 0;
                                $scope.loadPartial(layerName);
                            }

                        }

                        $scope.browserTitle = layerName + " (" + $scope.features.length + ")";
                        $scope.browserStatus.layer = layerName;
                        $scope.context = 'layer';
                        

                    }

                    if(options){
                        var f = _.findWhere($scope.features, options);
                        if(f){
                            return $scope.toFeature(f, layerName);
                        } 
                    } else {
                        $scope.browserStatus.feature = null;    
                    }

                })

            };





            $scope.toFeature = function(feature, layerName){
                $timeout(function(){
                    if(layerName){
                        $scope.browserStatus.layer = layerName;
                    }
                    $scope.browserStatus.feature = feature;
                    $scope.browserTitle = $scope.browserStatus.layer;
                    $ionicScrollDelegate.scrollTop();
                    $scope.context = 'feature';
                })

            };

            $scope.getTitle = function(layer, feature){
                return indexService.getFeatureTitle(layer, feature)
            };

            $scope.getLayerIcon = function(layerName){
                return indexService.getConfigForLayer(layerName, "icon");
            };            

            $scope.getTemplateForLayer = function(layerName){
                return indexService.getTemplateForLayer(layerName)
            };

            $scope.back = function(){
                if($scope.browserStatus.feature){
                    $scope.toLayer($scope.browserStatus.layer)
                    return;
                }

                if($scope.browserStatus.layer){
                    $scope.toIndex()
                    return;
                }
            };

            $scope.sortMode = $scope.uiStatus.lastPosition ? 'orderDistanceFunction' : '_title';
            $scope.setSortMode = function(mode){
                $scope.sortMode = mode;
            }

            $scope.filterFun = function(i){
                if(!$scope.browserStatus.filter) return true;
                var t = i._title.toLowerCase();
                var s = $scope.browserStatus.filter.toLowerCase();
                var out = t.indexOf(s) !== -1;
                return out;

            }


            $scope.centerFeature = function(feature){
                $rootScope.$broadcast("centerBrowserFeature", feature, $scope.browserStatus.layer);

            }

            $scope.$watch('sortMode', function(nv){
                if(nv == 'orderDistanceFunction'){
                    $scope.sorter= $scope.orderDistanceFunction;
                } 
                if(nv == '_title'){
                    $scope.sorter= function(f){ return f._title; }
                } 

            }, true)


            
            $scope.$on('showMeInBrowser', function(evt,feature,options){
                
                $scope.browser.show();
                var place_id = feature.values_.place_id;
                var osm_id = feature.values_.osm_id;
                var name = feature.values_.name;
                $scope.toLayer(options.layerName, {place_id:place_id, osm_id:osm_id, name:name});
                
            
            });


            



    }]);


}());