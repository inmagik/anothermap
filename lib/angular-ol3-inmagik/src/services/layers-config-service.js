(function(){
    'use strict';

    angular.module('ngOL3Inmagik')
    .factory('layersConfigService', [function(){

        var fixedLayers = [
            {
                name : 'OSM Base Layer',
                xgroup : 'base',
                layer : new ol.layer.Tile({
                    source : new ol.source.OSM()
                })
            },


            {
                name : 'MapQuest',
                xgroup : 'base',
                layer : new ol.layer.Tile({
                    source: new ol.source.MapQuest({layer: 'sat'})
                }),
            },

            /*
           
            {
                name : 'wms test',
                group : 'base',
                layer : new ol.layer.Tile({
                    source :new ol.source.TileWMS({
                        url: 'http://wms.jpl.nasa.gov/wms.cgi',
                        params  : {
                            'LAYERS' : 'global_mosaic'
                        }

                    })
                })
            }
             */



        ];
        


        var svc = {
            layers : [],
            fixedLayers : fixedLayers
        };
        return svc;
    }]);
    

}());