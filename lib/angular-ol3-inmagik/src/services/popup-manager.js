(function(){
    'use strict';

    angular.module('ngOL3Inmagik')
    .factory('popupManager', [ '$q', '$http', '$compile', '$rootScope', function($q, $http, $compile,$rootScope){

        var cache = {};
        var svc = {
            config : {},
        };
        
        svc.registerLayer = function(cfg){
            var uid = cfg.uid, 
                options = cfg.uiOptions;

            svc.config[uid] = options
        };

        svc.getPopupHtml = function(uid, feature){

            var d = $q.defer()
            
            var cf = svc.config[uid];
            var compileTemplate = function(htmlTemplate, f){
                console.log()
                var s = $rootScope.$new();
                s.feature = f;
                s.layerOptions = cf;
                s.broadcast = function(msg){
                    $rootScope.$broadcast(msg, f, cf);
                }

                var html = $compile(htmlTemplate)(s);
                d.resolve(html);
            };

            if(cache[uid]){
                var htmlTemplate = cache[uid];
                compileTemplate(htmlTemplate, feature);

            } else {
                var templateUrl = svc.config[uid].popupTemplate;
                $http.get(templateUrl).then(function(data){
                    cache[uid] = data.data;
                    compileTemplate(data.data, feature);
                });
            }
            

            return d.promise;
        }
        

        
        return svc;
    }]);
    

}());

