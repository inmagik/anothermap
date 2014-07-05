(function(){
    'use strict';

    angular.module('ngOL3Inmagik')
    .factory('layersManager', ['$rootScope',  'mapsManager', 'mapConfigService',  function($rootScope,mapsManager, mapConfigService){
        var layersForMaps = {};


        var generateUid = function () {
            // Math.random should be unique because of its seeding algorithm.
            // Convert it to base 36 (numbers + letters), and grab the first 9 characters
            // after the decimal.
            return 'I' + Math.random().toString(36).substr(2, 9);
        };

        var getLayerFromConfig = function(mapId, l){
            var lyr = l.layer;
            lyr.set('name', l.name);
            lyr.set('uid', l.uid);
            if(l.group){
                lyr.set('group', l.group);
            }
            
            lyr.maxExtent = mapsManager.getExtent(mapId);
            lyr.displayOutsideMaxExtent = false;
            return lyr;
        };


        var getKlassFromString = function(s){
            var keys = s.split(".");
            var o = window;
            for(var i=0,m=keys.length;i<m;i++){
                o = o[keys[i]];
            }
            return o;
        };


        var styleProviderFunction = null;
        
        var setStyleProviderFunction = function(f){
            styleProviderFunction = f;
        };


        //map to store duplicates map, for tile layers
        var dupeMaps = {};

        
        //TODO: please separate tiles and vectors
        var createLayerConfigFromJson = function(data){

            var layerOptions = data.layerOptions || {};
            var sourceOptions =data.sourceOptions || {};
            var layerKlass = getKlassFromString(data.layerClass);
            var sourceKlass = getKlassFromString(data.sourceClass);

            if(data.osmAttribution){
                sourceOptions.attributions = [
                new ol.Attribution({
                    html: 'Data &copy; OpenStreetMap contributors'
                    })
                ];
            }

            if(data.dupeMap){
                var url = data.dupeMap.file;
                //#WE LOAD THE DUPLICATES MAP DATA SYNCRONOUSLY
                $.ajax({method:'GET', url:url,async:false}).success(function(data2){
                        dupeMaps[data.dupeMap.file] = data2;
                });
                
                var loadWithDuplicates = function(imageTile, src) {
                    var p = src.replace(data.dupeMap.basePath, "");
                    if(!dupeMaps[data.dupeMap.file]){

                        setTimeout(function(){
                            loadWithDuplicates(imageTile,src);
                        }, 300);
                        return;
                    }
                    
                    if(dupeMaps[data.dupeMap.file][p]){
                        src = data.dupeMap.basePath + dupeMaps[data.dupeMap.file][p];
                    }
                    imageTile.getImage().src = src;
                };

                sourceOptions.tileLoadFunction = loadWithDuplicates;
            };

            /*
            if(data.sqliteDb){
                var dbPath = data.sqliteDb.file;
                //#WE LOAD THE DUPLICATES MAP DATA SYNCRONOUSLY
                
                if( window.sqlitePlugin){
                    
                    var db = window.sqlitePlugin.openDatabase({name: dbPath, openError : function(e){
                        console.log("eee",e)
                    }});
                    console.log("xx", db)
                    window.dbbb = db;
                    
                } else {
                    console.error("xxxxxx-")
                }
                //console.log("xxx", db)
                
                var loadWithDuplicates = function(imageTile, src) {
                    var tc  = imageTile.tileCoord;

                    console.log("xxxxa", tc, db, tc.z, tc.x, -tc.y);
                    db.transaction(function (tx) {
                        // here be the transaction
                        // do SQL magic here using the tx object
                        tx.executeSql('SELECT * FROM tiles where zoom_level=? and tile_column=? and tile_row=?', [tc.z, tc.x, -tc.y], 
                            function (tx, results) {
                                var len = results.rows.length;
                                console.log("xxx", len);

                                if(len){
                                    var r = result.rows.item(0);
                                    imageTile.getImage().src = 'data:image/png;base64,' + btoa(r.tile_data);
                                } else {
                                    console.error("tile not found", imageTile)
                                }
                        
                        }, function(e) {
                            console.log("ERROR: " + e.message);
       
                            }
                        );
                    //imageTile.getImage().src = src;
                    });
                }

                sourceOptions.tileLoadFunction = loadWithDuplicates;
            };
            */

            if(sourceOptions.extent){
                if(sourceOptions.extent_proj){
                    sourceOptions.extent = ol.proj.transform(sourceOptions.extent, sourceOptions.extent_proj, 'EPSG:3857');
                    if(sourceOptions.imageExtent){
                    sourceOptions.imageExtent = ol.proj.transform(sourceOptions.imageExtent, sourceOptions.extent_proj, 'EPSG:3857');
                    }
                }
            }

            layerOptions.source = new sourceKlass(sourceOptions);

            //this is not consistent at all..
            if(data.style){
                var style = createObjectFromJson(data.style);
                
                layerOptions.style =  function(feature, res){
                    var txt = res < 10 ? feature.values_.name : txt;
                    style.text_ = new ol.style.Text({
                        text : txt,
                        font : "Arial",
                        scale : 1.4,
                        offsetY : 22,
                        stroke : new ol.style.Stroke({color:"#333", width:2}),
                        fill : new ol.style.Fill({color:"#fff"})
                    });
                    

                    if(styleProviderFunction){
                        var overrideStyle = styleProviderFunction(feature, res, style, data);
                        if(overrideStyle){
                            return [overrideStyle];
                        }
                    }
                    return [style];
                }
            }

            var out = $.extend(true, {}, data);
            out.group = out.group || '';
            out.uid = data.uid || generateUid();
            out.layer = new layerKlass(layerOptions);
            
            return out;
        };


        var createObjectFromJson = function(data){

            var out;
            if(angular.isArray(data)){

                out  = [];
                for(var i=0,n=data.length;i<n;i++){
                    out.push(createObjectFromJson(data[i]));
                }
                return out;

            }
            if(angular.isObject(data)){

                if(data.klassName){
                    var klass = getKlassFromString(data.klassName);
                    var opts = data.klassArgs || {};
                    var extOpts = createObjectFromJson(opts)
                    return new klass(extOpts)
                }

                out  = {};
                var keys = _.keys(data);
                for(var i=0,n=keys.length;i<n;i++){
                    var key = keys[i];
                    var v = data[key];
                    out[key] = createObjectFromJson(v);    
                }
                return out;
            }

            return data;

        };

        var getLayerByName = function(mapId, name){
            var layers = layersForMaps[mapId] || [];
            var container  = _.findWhere(layers, {name:name});
            if(container){
                return container.layer;
            }
            return null;
        };


        var getLayerById = function(mapId, id){
            var layers = layersForMaps[mapId] || [];
            var container  = _.findWhere(layers, {uid:id});
            if(container){
                return container.layer;
            }
            return null;
        };

        var getLayerConfigByName = function(mapId, name){
            var layers = layersForMaps[mapId] || [];
            var container  = _.findWhere(layers, {name:name});
            if(container){
                return container;
            }
            return null;
        };

        //#TODO: SHOULD BE getLayerById
        var getLayerConfigById = function(mapId, id){
            var layers = layersForMaps[mapId] || [];
            var container  = _.findWhere(layers, {uid:id});
            if(container){
                return container;
            }
            return null;
        };

        var getLayersByGroup = function(mapId, group){
            var layers = layersForMaps[mapId] || [];
            var containers = _.where(layers, {group:group});
            return _.pluck(containers, 'layer');
        };

        var getGroupComplement = function(mapId, name){
            var layers = layersForMaps[mapId] || [];
            var container  = _.findWhere(layers, {name:name});
            if(container.group){
                var containers = _.where(layers, {group:container.group});
                containers = _.reject(containers, function(item){ return item.name == name});
                return _.pluck(containers, 'layer' );
            }

        };

        var groupLayers = function(mapId){
            var layers = layersForMaps[mapId] || [];
            var doneGroups = [];
            var out = [];
            for(var i=0,n=layers.length;i<n;i++){
                 var l = layers[i];
                 var g = l.group;
                 var pos = doneGroups.indexOf(g)
                 if(pos!=-1){
                    out[pos].layers.push(l);
                 } else {
                    out.push({group:g, layers :[l]});
                    doneGroups.push(g);
                 }

            }

            return out;
        }


        var addLayer = function(mapId, layerConfig){
            layersForMaps[mapId] = layersForMaps[mapId] || [];
            if(!layerConfig.uid){
                layerConfig.uid = generateUid();
            };
            layersForMaps[mapId].push(layerConfig);
            var lyr = getLayerFromConfig(mapId, layerConfig);
            mapsManager.maps[mapId].addLayer(lyr);
            var msg = 'layersChange.'+mapId;
            $rootScope.$broadcast(msg);
        };

        var removeLayer = function(mapId, layerConfig){
            var lyr = layerConfig.layer;
            mapsManager.maps[mapId].removeLayer(lyr);
            layersForMaps[mapId] = _.reject(layersForMaps[mapId], function(item){
                return item.name == layerConfig.name;
            })
            var msg = 'layersChange.'+mapId;
            $rootScope.$broadcast(msg);
        };



        var setLayerPosition = function(mapId, oldIndex, newIndex){
            //var uid = layerConfig.uid;
            var layersCollection = mapsManager.maps[mapId].getLayers();
            /*
            var layersArray = layersCollection.getArray();
            position = null;
            for(var i=0,n=layersArray.length;i<n;i++){
                var l = layersArray.getAt(i);
                if (l.get('uid') == uid){
                    position = i;
                    break;
                }
            }

            var lyr = layerConfig.layer;
            //mapsManager.maps[mapId].removeLayer(lyr);
            */
            var lyr = layersCollection.getAt(oldIndex);
            layersCollection.removeAt(oldIndex);
            layersCollection.insertAt(newIndex, lyr);
            
            //var msg = 'layersChange.'+mapId;
            //$rootScope.$broadcast(msg);
            
        };


        var svc = {
            layersForMaps : layersForMaps,
            addLayer : addLayer,
            removeLayer : removeLayer,
            getLayerByName : getLayerByName,
            getLayerConfigByName : getLayerConfigByName,
            getLayersByGroup : getLayersByGroup,
            getLayerConfigById : getLayerConfigById,
            groupLayers : groupLayers,
            getGroupComplement : getGroupComplement,
            setLayerPosition : setLayerPosition,
            createLayerConfigFromJson : createLayerConfigFromJson,
            createObjectFromJson : createObjectFromJson,
            setStyleProviderFunction : setStyleProviderFunction
        };
        return svc;
    }]);
    

}());