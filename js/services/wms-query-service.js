(function(){
    'use strict';

    angular.module('pocketMap')
    .factory('wmsQueryService', [ '$q', 'layersManager', function($q, layersManager){

        var svc = {};

        function htmlEntities(str) {
           return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        }

        var formatData = function(d){
            var out = {};
            for(var x in d){
                var a = d[x].response;
                var s = a.split("\n")                
                s = _.reject(s, function(item){return (item == 'GetFeatureInfo results:' || item.replace(" ", "") == "") })
                var j = "<h4>"+d[x].name+"</h4>" + s.join("<br>");
                out[x] = "<div>" + j + "</div>";
                
            }
            return out
        }

        svc.queryPoint = function(point, mapId, view){
            var out = $q.defer();
            var layers = _.reject(
                layersManager.layersForMaps[mapId] || [],
                function(item){
                    return item.wmsQueryable !== true || item.layer.getVisible() != true;
                }
            );
            var que = [];
            var data = {};

            if(layers.length == 0){
                out.resolve(null);
            }

            _.each(layers, function(item){
                var l = item.layer;
                var n = item.name;
                var s = l.getSource();
                var url = s.getGetFeatureInfoUrl(
                    point, 
                    view.getResolution(), 
                    view.getProjection(),
                    { INFO_FORMAT : 'text/plain'}
                );
                que.push(url);
                $.get(url).done(function(response){
                    data[url] = { response : htmlEntities(response), name : n};
                }).always(function(){
                    var p = que.indexOf(url);
                    que.splice(p, 1);
                    if(que.length==0){

                        out.resolve({data:data, formatted:formatData(data)});
                    }
                });
            });

            
            return out.promise;

        };
        return svc;
    
    }]);

}());

