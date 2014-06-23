(function(){
    'use strict';

    angular.module('ngOL3Inmagik').factory('geolocationService', ['$rootScope', '$q',
    
    function($rootScope, $q){

            var gpsActive = false;
            var lastPosition  = null;
            var gpsAvailable = true;
            var handler = null;
            
            var locationControl = navigator.geolocation;

            var geolocationOptions = {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 10000,
                //watch: true
            };


            var startGeolocation = function(){
                console.log("geolocation on")
                if(handler){
                    clearInterval(handler);
                }
                locationControl.getCurrentPosition(geolocationUpdateHandler, null, geolocationOptions);
                handler = setInterval(function(){ locationControl.getCurrentPosition(geolocationUpdateHandler, null, geolocationOptions)}, 10000);
                gpsActive = true;
            };

            var stopGeolocation = function(){
                if(handler){
                    clearInterval(handler);
                }
                gpsActive = false;
            };

            var toggleGeolocation = function(){
                if(gpsActive){
                    stopGeolocation();
                } else {
                    startGeolocation();
                }
            };

            var geolocationUpdateHandler = function(e){
                var coords = e.coords;
                lastPosition = coords;
                $rootScope.$broadcast("updateGeolocation", coords);
            };
            

            var svc =  {

                gpsActive : gpsActive,
                gpsAvailable : gpsAvailable,
                lastPosition : lastPosition,
                startGeolocation : startGeolocation,
                stopGeolocation : stopGeolocation

            };

            return svc;


        }
    ]);
    
    

}());


