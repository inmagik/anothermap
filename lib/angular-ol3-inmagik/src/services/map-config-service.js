(function(){
    'use strict';

    angular.module('ngOL3Inmagik')
    .factory('mapConfigService', ['$q', function($q){

        

        var getKlassFromString = function(s){
            var keys = s.split(".");
            var o = window;
            for(var i=0,m=keys.length;i<m;i++){
                o = o[keys[i]];
            }
            return o;
        }

        var inames = ["ol.interaction.DragRotate","ol.interaction.DoubleClickZoom","ol.interaction.DragPan","ol.interaction.PinchRotate","ol.interaction.PinchZoom","ol.interaction.KeyboardPan","ol.interaction.KeyboardZoom","ol.interaction.MouseWheelZoom","ol.interaction.DragZoom"];
        var interactions = [];
        var interactionsByName = {};
        _.each(inames, function(item){
            var klass = getKlassFromString(item);
            var inst = new klass({});
            interactions.push(inst);
            interactionsByName[item] = inst;

        });


        var getMapConfig = function(options){

            var p = options.projection || 'EPSG:3857';
            var e = options.extent;
            console.log("extent 1", e, options)
            if(e && options.extent_projection){
                console.log("xx")
                e = ol.proj.transform(e, 'EPSG:4326', 'EPSG:3857');
                options.extent = e;
            }

            console.log("extent 2", e, options.extent_projection)
            
            var deferred = $q.defer();
            var config = {
                target: options.target || 'map',
                ol3Logo : false,
                view: new ol.View2D({
                  //center: ol.proj.transform([37.41, 8.82], 'EPSG:4326', 'EPSG:3857'),
                  //zoom: 4,
                  //center : [37.41, 8.82],
                  
                  maxResolution : options.maxResolution || undefined,
                  maxZoom: options.maxZoom || undefined,
                  projection : p,
                  extent : e,
                }),
                
                interactions : interactions,
                
                userOptions : options
            };

            deferred.resolve(config);
            return deferred.promise;
        };

        var svc = {
            
            getMapConfig : getMapConfig,
            interactionsByName : interactionsByName
        };
        return svc;
    }]);
    

}());