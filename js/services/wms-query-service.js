(function(){
    'use strict';

    angular.module('pocketMap')
    .factory('wmsQueryService', [ '$q', 'layersManager', function($q, layersManager){

        var svc = {

            
            
        };

        var formatData = function(d){

            var out = "";
            for(var x in d){
                var a = d[x].response;
                var s = a.split("\n")                
                console.log("s", s)
                s = _.reject(s, function(item){return (item == 'GetFeatureInfo results:' || item.replace(" ", "") == "") })
                var j = "<h4>"+d[x].name+"</h4>" + s.join("<br>");

                out = out + j;
            }
            return out;
        }

        svc.queryPoint = function(point, mapId, view){
            var out = $q.defer();
            console.log("queryPoint", point)
            var layers = _.reject(
                layersManager.layersForMaps[mapId] || [],
                function(item){
                    return item.wmsQueryable !== true;
                }
            );
            console.log("candidate layers", layers);
            var que = [];
            var data = {};

            _.each(layers, function(item){
                var l = item.layer;
                var n = item.name;
                var s = l.getSource();
                var url = s.getGetFeatureInfoUrl(
                    point, 
                    view.getResolution(), 
                    view.getProjection(),
                    {}
                );
                console.log("url", url);
                que.push(url);

                $.get(url).success(function(response){
                    var p = que.indexOf(url);
                    que.splice(p, 1);
                    data[url] = { response : response, name : n};

                    if(que.length==0){
                        out.resolve({data:data, formatted:formatData(data)});
                    }

                })

            });


            return out.promise;


        }



    

        return svc;
    }]);
    

}());

