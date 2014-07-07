(function(){
    'use strict';

    angular.module('pocketMap')
    .factory('persistenceService', [ '$rootScope', 'layersManager', function($rootScope, layersManager){

        var svc = {};

        svc.savedMaps = new PouchDB('savedMaps');

        var generateUid = function () {
            // Math.random should be unique because of its seeding algorithm.
            // Convert it to base 36 (numbers + letters), and grab the first 9 characters
            // after the decimal.
            return 'U' + Math.random().toString(36).substr(2, 9);
        };

        var forcePut = function(db, doc, cb){
            return db.get(doc._id).then(function (origDoc) {
                doc._rev = origDoc._rev;
                return db.put(doc,cb);
            }, function () {
                return db.put(doc,cb);
            });
        };

        svc.dumpMap = function(mapId){
            var x = layersManager.groupLayers(mapId);
            var out = {
                layers : []
            };

            console.log(2, x)
            _.each(x, function(item){
                _.each(item.layers, function(layer){
                    console.log(item.group, layer)
                    var i = {name:layer.name, abstract:layer.abstract, group:layer.group};
                    out.layers.push(i);
                })

            });
            
            return out;
        };


        svc.saveMap = function(mapData, mapName){
            var uid = generateUid();
            var doc = { _id:uid, name:mapName, data:mapData };
            forcePut(svc.savedMaps, doc).then(function(response){
                svc.getMaps();
            })


        };


        svc.getMaps = function(){
            svc.savedMaps.allDocs({ include_docs:true }).then(function(data){
                var d = _.pluck(data.rows, 'doc');
                $rootScope.$broadcast("savedMapsLoaded", d);
                
            })
        };


        svc.getLastMapConfig = function(){
            var i =  window.localStorage.getItem('lastMapConfiguration');
            if(!i) return null;
            return JSON.parse(i);
        };

        svc.setLastMapConfig = function(data){
            return window.localStorage.setItem('lastMapConfiguration', JSON.stringify(data));
        };

        /*
        var changes = svc.savedMaps.changes({
            live: true
        }).on('change', function(change) { 
            console.error("layer changed", change);
            svc.getMaps();
            
        });

        */
        
    

        return svc;
    }]);
    

}());

