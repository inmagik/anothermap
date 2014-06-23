(function(){
    'use strict';

    angular.module('pocketMap')
    .factory('osmLayersService', [ '$q', '$http', function($q, $http){

        var svc = {

            layers : [

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

                }
            ],
        
            stamenLayers : [
                
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

                }
            ]
            
        };



    

        return svc;
    }]);
    

}());

