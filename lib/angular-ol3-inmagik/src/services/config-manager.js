(function(){
    'use strict';

    angular.module('ngOL3Inmagik')
    .factory('configManager', [ '$q', '$http', function($q, $http){

        var config = {};
        var getConfig = function(url){

            var d = $q.defer()

            $http.get(url).success(function(data){
                config = data;
                d.resolve(data);
            });


            return d.promise;

        };
        

        var svc = {
            getConfig : getConfig,
            config : config,
        };
        return svc;
    }]);
    

}());

