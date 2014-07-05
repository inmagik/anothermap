(function(){
    'use strict';

    angular.module('pocketMap')
    .factory('wmsService', [ '$q', '$http', function($q, $http){

        var svc = {
            wmsUrls : [],
            wmsLayers : {},
            wmsInfo: {}
        };


        svc.setWmsUrls = function(urls){
            svc.wmsUrls = urls;
        };


        var generateUid = function () {
            // Math.random should be unique because of its seeding algorithm.
            // Convert it to base 36 (numbers + letters), and grab the first 9 characters
            // after the decimal.
            return 'I' + Math.random().toString(36).substr(2, 9);
        };




        svc.loadWMS = function(url){
            var d = $q.defer();

            var parser = new ol.format.WMSCapabilities();
            var out = [];

            $.ajax(url, {async:true}).then(function(response) {
                var result = parser.read(response);
                var serviceLayers = result.Capability.Layer.Layer;
                var serviceInfo = result.Service;
                var version = result.version;

                _.each(serviceLayers, function(item){
                    var cfg = svc.createLayerConfigFromWMS(item, serviceInfo, version);
                    if(cfg){
                        out.push(cfg);    
                    }
                });
                d.resolve({data:out, item:url, serviceInfo:serviceInfo});
            });

            return d.promise;

        };


        svc.createLayerConfigFromWMS = function(layerInfo, serviceInfo, version){

            //console.log("aaaa", layerInfo)
            if(!layerInfo.Name){
                console.error("No name, cannot create wms config", layerInfo);
                return null;
            }
            
            var crsFound = null;
            for(var i=0,n=layerInfo.CRS.length;i<n;i++){
                var crs = layerInfo.CRS[i];
                if(Proj4js.defs[crs]){
                    crsFound = crs;
                    break;
                }
            }

            if(!crsFound){
                //console.error("no crs found for wms layer def. assuming wgs84", layerInfo);
                crsFound = "EPSG:4326";
                //return;
            }

            var url = serviceInfo.OnlineResource;
            var projection = ol.proj.configureProj4jsProjection({
              code: crsFound,
              //extent: [166021.4431, 0.0000, 833978.5569, 9329005.1825]
            });




            
            var out= {
                name :layerInfo.Name,
                abstract : layerInfo.Abstract,
                group : 'rasters',
                uid : generateUid(),
                layer : new ol.layer.Tile({
                    visible : false,
                    source : new ol.source.TileWMS({
                        url : url,
                        projection : projection,
                        params : {
                            'LAYERS' : layerInfo.Name,
                            'FORMAT' : 'image/png',
                            'VERSION' : version,
                            'SRS' : crsFound,
                            'CRS' : crsFound
                        },
                        //crossOrigin: 'anonymous',
                        
                    })
                }),
                uiOptions : {}
            }

            if(layerInfo.BoundingBox){
                var boundingForCrs = _.findWhere(layerInfo.BoundingBox, function(item){
                    return item.crs == crsFound;
                });
                out.bbox = boundingForCrs;
                
            }

            if(layerInfo.Style){
                var st = layerInfo.Style[0];
                if(st){
                    if(st.LegendURL){
                        if(st.LegendURL[0]){
                            var res = st.LegendURL[0].OnlineResource;
                            out.legendUrl = { url:res, title:layerInfo.Title };
                        }

                    }
                }

            }


            if(layerInfo.queryable){
                out.wmsQueryable = true;

            }

            return out;


        }


        svc.loadWmsLayers = function(){
            var d = $q.defer();
            var o  = [];
            var toLoad = [];
            var loaded = {}
            var configs = svc.wmsUrls;

            var ge = function(){
                var a=[];
                _.each(configs, function(item){
                    a = a.concat(loaded[item]);
                })
                return a;
            }
            
            _.each(svc.wmsUrls, function(item){
                toLoad.push(item);
                svc.loadWMS(item).then(function(data){
                    svc.wmsLayers[data.item] = data.data;
                    svc.wmsInfo[data.item] = data.serviceInfo;

                    toLoad = _.reject(toLoad, function(i){return i == data.item;})
                    if(toLoad.length==0){
                        d.resolve(svc.wmsLayers);
                    }
                });

            });
            

            return d.promise;

            
        }
    

        return svc;
    }]);
    

}());

