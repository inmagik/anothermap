(function(){
    'use strict';

    angular.module('pocketMap')
    .factory('legendsService', [ '$rootScope', '$http', function($rootScope, $http){

        var svc = {

            legends  : []
            
        };

        svc.addLegend = function(legendUrl){
            if(svc.hasLegend(legendUrl)){
                return;
            }
            console.log("xxx",legendUrl)
            svc.legends.push(legendUrl);
            $rootScope.$broadcast('legendsChanged');

        };

        svc.hasLegend = function(legend){
            return svc.legends.indexOf(legend) !== -1;
        };

        svc.removeLegend = function(legend){
            var pos = svc.legends.indexOf(legend);
            if(pos !== -1){
                svc.legends.splice(pos,1);
                $rootScope.$broadcast('legendsChanged');
            }
        };

        svc.removeAllLegends = function(){
            svc.legends = [];
            $rootScope.$broadcast('legendsChanged');
        };


    

        return svc;
    }]);
    

}());

