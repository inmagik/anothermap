(function(){
    'use strict';

    angular.module('pocketMap')
    .factory('mapquestLayersService', [ '$q', '$http', function($q, $http){

        var svc = {

            layers : [
                    {
                        name : 'MapQuest OSM',
                        group : 'rasters',
                        abstract : 'MapQuest OSM',
                        layer : new ol.layer.Tile({
                            source : new ol.source.MapQuest({layer:'osm'})
                        })

                    },
                    {
                        name : 'MapQuest Sat',
                        group : 'rasters',
                        abstract : 'MapQuest Sat',
                        layer : new ol.layer.Tile({
                            source : new ol.source.MapQuest({layer:'sat'})
                        })

                    },
                    {
                        name : 'MapQuest Hybrid',
                        group : 'rasters',
                        abstract : 'MapQuest Hybrid',
                        layer : new ol.layer.Tile({
                            source : new ol.source.MapQuest({layer:'hyb'})
                        })

                    }

                ]
            
        };



    

        return svc;
    }]);
    

}());

