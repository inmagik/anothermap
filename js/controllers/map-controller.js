    (function(){
    'use strict';

    angular.module('pocketMap.controllers')

    .controller('MapCtrl', ['$scope', '$rootScope', '$q', '$timeout', 'configManager', 'mapConfigService', 'mapsManager','layersManager', 'layersConfigService', 'olGeolocationService', 
            '$ionicModal', 'popupManager', 'indexService', '$ionicPopup', '$ionicPlatform', 'iconsService', 'legendsService', 'wmsQueryService', 'persistenceService',
        function($scope, $rootScope, $q, $timeout, configManager, mapConfigService,mapsManager,layersManager, layersConfigService, olGeolocationService,
         $ionicModal,popupManager, indexService, $ionicPopup, $ionicPlatform, iconsService,legendsService, wmsQueryService, persistenceService) {

        
        $scope.appInfo = {
            engineVersion : "1.0"
        };
        
        $scope.config = {};

        $rootScope.uiStatus = {
            dataLoaded : true,
            gps:false,
            orientation : false,
            follow : false,
            lastPosition : null,
            lastHeading : null,
            locationInExtent : null,
            newMapName : null
        };

        $rootScope.uiControls = {
            queryWMS : null
            //reverseGeocode : false
        };


        $scope.pointInfo = {
            position : null,
            data : null
        };


        $scope.savedMaps = {};


        $scope.hasQueryableWMS = function(){
            var l = wmsQueryService.queriableLayers('main-map');
            return l.length > 0;
        };

        $scope.activateQueryWMS = function(){
            $timeout(function(){
                $rootScope.uiControls.queryWMS = $scope.map.on('click', function(evt){
                    wmsQueryService.queryPoint(evt.coordinate, 'main-map', $scope.map.getView()).then(function(data){
                        $timeout(function(){
                            if(data){
                                showMapPopup(evt.coordinate, data)
                            }
                            $scope.pointInfo = {
                                position : evt.coordinate,
                                data : data
                            };
                        })
                        
                    });
                });

            });
        };

        $scope.deactivateQueryWMS = function(){
            $timeout(function(){
                $scope.map.unByKey($rootScope.uiControls.queryWMS);
                $rootScope.uiControls.queryWMS = null;
            });
        };

        $scope.$watch(function(){return $scope.hasQueryableWMS()}, function(nv){if(!nv && $rootScope.uiControls.queryWMS)  $scope.deactivateQueryWMS ();}, true);

        $scope.toggleQueryWms = function(){
            if($rootScope.uiControls.queryWMS){
                $scope.deactivateQueryWMS();
            } else {
                $scope.activateQueryWMS();
            }
        };
        

        $scope.searchStatus = {
            search : '',
            lastSearch : null,
            searchResults : [] ,
            address : true

        };

        $scope.helpShown=false;

        var firstRotation = false;


        //popup stuff
        // An alert dialog
        var showAlert = function(title, msg) {
            var alertPopup = $ionicPopup.alert({
                title: title,
                template: msg
            });
            //Callback could go here ...
            //alertPopup.then(function(res) {
            //    
            //});
        };
        
        
        //modal stuff
        $ionicModal.fromTemplateUrl('templates/about.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal;

        });

        $scope.openModal = function() {
            $scope.modal.show();
        };
        
        $scope.closeModal = function() {
            $scope.modal.hide();
        };


        //browser modal
        $ionicModal.fromTemplateUrl('templates/browser.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.browser = modal;

        });

        $scope.openBrowser = function() {
            $scope.browser.show();
        };

        $scope.closeBrowser = function() {
            $scope.browser.hide();
        };



        //drawer modal
        $ionicModal.fromTemplateUrl('templates/drawer.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.drawer = modal;

        });

        $scope.openDrawer  = function() {
            $scope.drawer.show();
        };

        $scope.closeDrawer = function() {
            $scope.drawer.hide();
        };






        //Cleanup the modal when we're done with it!
        $scope.$on('$destroy', function() {
            $scope.modal.remove();
            $scope.browser.remove();
        });


        $scope.panels = {
            'layers' : false
        };


        $scope.closeAllPanels = function(){
            for(var p in $scope.panels){
                if($scope.panels[p]){
                    $scope.panels[p] = false;
                }
            }
        };


        $scope.togglePanel = function(panelName, closeAll){

            $timeout(function(){
                if(closeAll){
                    for(var p in $scope.panels){
                        if(p==panelName){continue}
                        if($scope.panels[p]){
                            $scope.panels[p] = false;
                        }
                    }
                }
                $scope.panels[panelName] = !$scope.panels[panelName];
            })
        };





        //legend stuff
        $scope.currentLegends = [];
        $scope.removeLegend = function(legend){
            legendsService.removeLegend(legend);
        };


        $scope.removeAllLegends = function(){
            legendsService.removeAllLegends();
        }

        $scope.$on('legendsChanged', function(nv){
            $timeout(function(){
                $scope.currentLegends = legendsService.legends;
            });
        })






        
        //hook to load custom vectors at startup. not used right now
        var initCustomVectors = function(){
            var d = $q.defer();
            var o  = [];
            d.resolve(o);
            return d.promise;

            
        }

        //json config loader
        //expects configuration in config/config.json
        //#TODO: write config specs
        var startFromConfig = function(){
            configManager.getConfig('config/config.json')
                .then(function(data){
                    $scope.config = data;
                    
                    $scope.appInfo.title = data.app_name;
                    $scope.appInfo.version = data.app_version;
                    initCustomVectors().then(function(layers){
                        data.layers = layers;
                        initMap(data);
                        initTour();

                    })
                    
                });
        };


        /* geoloc stuff -- move away */
        var positionLayer = null;
        var positionFeature = new ol.Feature();
        var hudOverlay;
        var popupOverlay;

        var createHudOverlay  = function(){

            var element2= document.getElementById('hud');
            hudOverlay = new ol.Overlay({
              element: element2,
              positioning: 'center-center',
              stopEvent: false
            });
            
            $scope.map.addOverlay(hudOverlay);
            hudOverlay.setPosition($scope.map.getView().getCenter())


        };

        var mapClickHandler = null;


        var showMapPopup = function(coord, content){
            $("#main-map").addClass('map-with-console');
            $("#main-console").addClass('console-open');
            $scope.closeAllPanels();
            $scope.map.updateSize();
            animateCenter(coord);
            popupOverlay.setPosition(coord);
            var element = document.getElementById('popup');
            var c = $(".popover-content", $(element));
            c.empty();
            $(element).fadeIn()
        };


        $scope.hideMapPopup = function(){
            $("#main-map").removeClass('map-with-console');
            $("#main-console").removeClass('console-open');
            $scope.map.updateSize();
            var element = document.getElementById('popup');
            $(element).fadeOut();
        };



        var handlePopup = function(pixel, layerName){
            var element = document.getElementById('popup');
            var candidates = [];
            $scope.map.forEachFeatureAtPixel(pixel,
              function(feature, layer) {
                var uid =  layer.get('uid');
                var name = layer.get('name');
                var condition = (!layerName || (layerName && name==layerName))
                if(popupManager.config[uid] && condition){
                    var out = { feature : feature, layer : layer };
                    candidates.push(out);
                }
            });
          
            if (candidates.length) {
                var configuredFeature = candidates[0];
                var feature = configuredFeature.feature;
                var uid = configuredFeature.layer.get('uid');

                var c = $(".popover-content", $(element));
                c.empty();
                $(element).fadeIn()
                
                var geometry = feature.getGeometry();
                var coord = geometry.getCoordinates();
                popupOverlay.setPosition(coord);

                popupManager.getPopupHtml(uid, feature).then(function(html){
                    c.html(html);
                });
                
                $scope.map.unByKey(mapClickHandler);
                mapClickHandler = null;
                
                $scope.map.once('click', function(evt) {
                    $(element).fadeOut();
                    evt.preventDefault();
                    mapClickHandler = $scope.map.on('click', function(evt) {
                        handlePopup(evt.pixel);
                    });
                });
            
          } else {
            $(element).fadeOut();
          
          }

        };
         

        var createPopupOverlay  = function(){
            var element = document.getElementById('popup');
            popupOverlay = new ol.Overlay({
                element: element,
                positioning: 'center-center',
                stopEvent: true
            });
            $scope.map.addOverlay(popupOverlay);

            // display popup on click
            /*
            mapClickHandler = $scope.map.on('click', function(evt) {
                handlePopup(evt.pixel);
            });
            */
            
        };


        var updatePositionLayer = function(coordsm){

            var features = positionLayer.getFeatures();
            var f = features.item(0);
            f.setGeometry(new ol.geom.Point(coordsm));
            return;
        };
        
        
        var initGeoloc = function(map){

            var positionStyle = new ol.style.Style({
                image: new ol.style.Icon({
                    src: 'img/position2.png',
                    anchor: [0.5, 0.5],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'fraction',
                    opacity: 1,
                    size : [32,32]
                })
            });
            
            positionLayer = new ol.FeatureOverlay({
                map: map,
                features: [],
                style : positionStyle

            });
            


            olGeolocationService.geolocationControl.on('change', 
                function(evt) {
                    var coords = olGeolocationService.geolocationControl.getPosition();
                    var orc =olGeolocationService.deviceOrientationControl;
                    var head = orc.getHeading();

                    var coordsm = ol.proj.transform(coords, 'EPSG:4326', 'EPSG:3857');
                    $timeout(function(){
                        $scope.uiStatus.lastPosition = coordsm;
                        $scope.uiStatus.lastHeading = head;

                    })
                }
            );


            olGeolocationService.geolocationControl.on('error', 
                function(error) {
                    $timeout(function(){
                        $scope.stopGeolocation();
                    })
                    showAlert('GPS Error', "Geolocation is disabled! Please enable it if you want to show your position on the map");
                }
            );

            $scope.$watch('uiStatus.lastPosition', function(nv){
                if(!nv) return;

                var ex = mapsManager.getExtent('main-map');
                var contained = ol.extent.containsCoordinate(ex, nv);
                if(!contained){
                    if(contained !== $scope.uiStatus.locationInExtent){
                        $timeout(function(){
                            $scope.uiStatus.locationInExtent = false;
                        });
                        showAlert('Outside map', "Your current location seems to be outside the map.");
                        $scope.stopFollow();
                    }
                } else {
                    if(contained != $scope.uiStatus.locationInExtent){
                        $timeout(function(){
                            $scope.uiStatus.locationInExtent = true;
                        });
                    }
                    
                }
                updatePositionLayer(nv);
            
            }, true);


            var orc =olGeolocationService.deviceOrientationControl;
            orc.on("change", function(evt){
                var head = orc.getHeading();
                if(head == $scope.uiStatus.lastHeading){
                    return
                }

                //var v = $scope.map.getView();
                //v.setRotation(-head);
                if(firstRotation || !$scope.uiStatus.lastHeading){
                    animateRotate(-head);    
                } else {
                    var v = $scope.map.getView();
                    v.setRotation(-head);
                }
                
                firstRotation = false;
                $scope.uiStatus.lastHeading = head;
            });
        };


        $scope.startDeviceOrientation = function(){
            
            firstRotation = true;
            olGeolocationService.startDeviceOrientation();
            $timeout(function(){
                $scope.uiStatus.orientation = true;
            });

            if($scope.uiStatus.lockRotate){
                $scope.unlockRotation();
            }
        };


        $scope.stopDeviceOrientation = function(reset){
            olGeolocationService.stopDeviceOrientation();
            //var v = $scope.map.getView();
            //v.setRotation(0);
            if(reset)animateRotate(0);
            $timeout(function(){
                $scope.uiStatus.orientation = false;
            });
        };


        $scope.toggleOrientation = function(){
            if($scope.uiStatus.orientation){
                $scope.stopDeviceOrientation(true)
            } else {
                $scope.startDeviceOrientation();
            }
        };


        $scope.startGeolocation = function(){
            //positionLayer.setVisible(true)
            positionLayer.addFeature(positionFeature);
            olGeolocationService.startGeolocation();
            $timeout(function(){
                $scope.uiStatus.gps = true;
            });
        };


        $scope.stopGeolocation = function(){
            //positionLayer.setVisible(false)
            positionLayer.removeFeature(positionFeature);
            olGeolocationService.stopGeolocation();
            $timeout(function(){
                $scope.uiStatus.gps = false;
            });
            if($scope.uiStatus.follow){
                $scope.stopFollow();
            }
        };


        $scope.toggleGeolocation = function(){
            if($scope.uiStatus.gps){
                $scope.stopGeolocation()
            } else {
                $scope.startGeolocation();
            }
        };


        var followHandler;
        $scope.startFollow = function(){

            followHandler = $scope.$watch(
                'uiStatus.lastPosition',
                function(nv){
                    if(!nv) return;
                    var v = $scope.map.getView();
                    animateCenter(nv)
                    //v.setCenter(nv);
                },
                true
            );
            
            $timeout(function(){
                $scope.uiStatus.follow = true;
            });
        };


        $scope.stopFollow = function(){
            
            if(followHandler){
                followHandler();
            }

            $timeout(function(){
                $scope.uiStatus.follow = false;
            });
        };


        $scope.toggleFollow = function(){

            if($scope.uiStatus.follow){
                $scope.stopFollow()
            } else {
                $scope.startFollow();
            }
        };





        //animation helpers
        var animateRotate = function(targetRotation){

            var v = $scope.map.getView();
            var currentRotation = v.getRotation();
            var totalRotation = Math.abs(currentRotation-targetRotation);
            var duration =  100 + totalRotation * 300;

            var rotateAnimation = ol.animation.rotate({
                duration: duration,
                rotation: v.getRotation(),
                easing : ol.easing.linear
            });

            $scope.map.beforeRender(rotateAnimation);
            v.setRotation(targetRotation);
            
        };


        var animateCenter = function(targetCenter){

            var v = $scope.map.getView();
            
            var panAnimation = ol.animation.pan({
                duration: 500,
                source: v.getCenter(),
                easing : ol.easing.linear
            });

            $scope.map.beforeRender(panAnimation);
            v.setCenter(targetCenter);
            
        };


        var animateZoom = function(targetZoom){

            var v = $scope.map.getView();
            
            var zoomAnimation = ol.animation.zoom({
                duration: 500,
                resolution: v.getResolution(),
                easing : ol.easing.linear
            });

            $scope.map.beforeRender(zoomAnimation);
            v.setZoom(targetZoom);
            
        };



        $scope.lockRotation = function(){
            $scope.map.removeInteraction(mapConfigService.interactionsByName["ol.interaction.DragRotate"]);
            $scope.map.removeInteraction(mapConfigService.interactionsByName["ol.interaction.PinchRotate"]);
            
            //$scope.map.getView().setRotation(0);
            animateRotate(0);

            $timeout(function(){
                $scope.uiStatus.lockRotate = true;
            });
            if($scope.uiStatus.orientation){
                $scope.stopDeviceOrientation(false);
            }

        };


        $scope.unlockRotation = function(){
            $scope.map.addInteraction(mapConfigService.interactionsByName["ol.interaction.DragRotate"]);
            $scope.map.addInteraction(mapConfigService.interactionsByName["ol.interaction.PinchRotate"]);
            $timeout(function(){
                $scope.uiStatus.lockRotate = false;
            });

        };


        $scope.toggleLockRotation = function(){
            if($scope.uiStatus.lockRotate){
                $scope.unlockRotation()
            } else {
                $scope.lockRotation();
            }
        };


        var initMap = function(data){
                    
            mapConfigService.getMapConfig(
                {
                    target:'main-map', 
                    maxResolution:data.maxResolution,
                    extent : data.extent,
                    extent_projection : data.extent_projection,
                    projection : data.projection

                })
                .then(function(config){
                    
                    var map = mapsManager.createMap('main-map', config);
                    

                    $scope.map = map;
                    
                    var i = map.getInteractions()
                    var v = map.getView();
                    
                    v.fitExtent(mapsManager.getExtent('main-map'), map.getSize() );


                    //adding base layers
                    /*
                    _.each(data.baseLayers, function(item){
                        var i = layersManager.createLayerConfigFromJson(item);
                        layersManager.addLayer('main-map', i);
                    });
                    */


                    //adding vectors FROM CONFIG
                    _.each(data.vectorLayers, function(item){
                        var cfg = layersManager.createLayerConfigFromJson(item);
                        //var i = layersManager.createObjectFromJson(item);
                        //console.log("adding vector", cfg)
                        if(cfg.uiOptions){
                            if(item.uiOptions.map!=false){
                                layersManager.addLayer('main-map', cfg);
                                if(cfg.uiOptions.popup){
                                    popupManager.registerLayer(cfg)
                                }
                            }
                            if(item.uiOptions.index){
                                indexService.registerLayer(cfg)
                            }
                        }
                    });


                    //adding custom vectors
                    //adding vectors FROM CONFIG
                    _.each(data.layers, function(cfg){
                        if(cfg.uiOptions){
                            if(cfg.uiOptions.map!=false){
                                layersManager.addLayer('main-map', cfg);
                                if(cfg.uiOptions.popup){
                                    popupManager.registerLayer(cfg)
                                }
                            }
                            if(cfg.uiOptions.index){
                                indexService.registerLayer(cfg)
                            }
                        }
                    });




                    initGeoloc(map);
                    createPopupOverlay();
                    //createHudOverlay();
                    prepareEvents();

                    //broadcasting mapMapready event, will be used by browser
                    //to load initial layer
                    $rootScope.$broadcast('mapReady');

                    $timeout(function(){
                        $scope.uiStatus.dataLoaded = true;
                        if(navigator.splashscreen){
                                   setTimeout(function() { 
                                navigator.splashscreen.hide();
                            }, 1000);
                        }
                    });
                });

            };

            var prepareEvents  = function(){
                $scope.map.on('moveend',onMove )
            };

            var onMove = function(evt){
                var bounds = $scope.map.getView().calculateExtent($scope.map.getSize());
                var center = $scope.map.getView().getCenter();
                //hudOverlay.setPosition(center)
                //console.log(2, evt)
                /*
                $timeout(function(){
                    $scope.mapState.bounds = bounds; 
                    $scope.mapState.center = center; 
                });
                */
                
            };



            $rootScope.getDistanceFromLastPos = function(geom){
                if($scope.uiStatus.lastPosition){
                    var p = geom.flatCoordinates;
                    var s = ol.sphere.WGS84;
                    
                    var sp = ol.proj.transform(p, 'EPSG:3857', 'EPSG:4326');
                    var ss = ol.proj.transform($scope.uiStatus.lastPosition, 'EPSG:3857', 'EPSG:4326');
                    //console.log("p", $scope.uiStatus.lastPosition, p, sp, ss);
                    return s.haversineDistance(sp, ss) / 1000;
                } 
                return null;
            };


            $scope.orderDistanceFunction = function(feature) {
                 return $rootScope.getDistanceFromLastPos(feature.geometry)
            };

            
            $scope.showHelp = function(){
                $scope.helpShown = true;
            };


            $scope.toggleHelp = function(){
                $scope.helpShown = !$scope.helpShown;
            };


            var initTour = function(){

                if(!window.localStorage.getItem('has_run')) {
                    //do some stuff if has not loaded before
                    $scope.showHelp();
                    window.localStorage.setItem('has_run', 'true');
                }
                
            };

            // serialization

            $scope.dumpMap = function(){

              var myPopup = $ionicPopup.show({
                template: '<input type="text" ng-model="uiStatus.newMapName">',
                title: 'Save map',
                subTitle: 'Please enter a name for this map',
                scope: $scope,
                buttons: [
                  { text: 'Cancel' },
                  {
                    text: '<b>Save</b>',
                    type: 'button-positive',
                    onTap: function(e) {
                      if (!$scope.uiStatus.newMapName) {
                        //don't allow the user to close unless he enters wifi password
                        e.preventDefault();
                      } else {
                        return $scope.uiStatus.newMapName;
                      }
                    }
                  },
                ]
              });
              myPopup.then(function(res) {
                console.log('Tapped!', res);
                if(!res){
                    return;
                }
                var data = persistenceService.dumpMap('main-map');
                persistenceService.saveMap(data, $scope.uiStatus.newMapName);

              });
                
            };


            $scope.loadSavedMap = function(data){
                console.log("jjj", data);
                $rootScope.$broadcast('browserLoadMap', data);
            }



             

            $scope.$on('zoomToLayer', function(evt, data){
                console.log("da", data);
                var bbox = data.bbox;
                if(!bbox){
                    console.error("cannot zoom to layer - no bbox")
                }
                var view = $scope.map.getView();
                var proj = view.getProjection();
                var extent = ol.proj.transform(bbox.extent, bbox.crs, proj);
                console.log("sw", bbox, extent, proj)
                view.fitExtent(extent, $scope.map.getSize() );

            });


            $scope.$on('savedMapsLoaded', function(evt, data){
                $timeout(function(){
                    $scope.savedMaps = data;
                })

            });




            //initialization
            $ionicPlatform.ready(function(){
                startFromConfig();   
                persistenceService.getMaps();

            });


    }]);


}());