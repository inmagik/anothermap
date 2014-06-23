(function(){
    'use strict';

    angular.module('ngOL3Inmagik').factory('olGeolocationService', ['$rootScope', '$q',
    
    function($rootScope, $q){

        var geolocationActive = false;
        var lastPosition  = null;
        var gpsAvailable = true, deviceOrientationActive = true;
        var handler = null;

        var geolocationControl =  new ol.Geolocation({tracking:false});
        var deviceOrientationControl = new ol.DeviceOrientation({tracking:false});

        /*
        geolocationControl.on('change', function(evt) {
            window.console.log(geolocationControl.getPosition());
            geolocationUpdateHandler(geolocationControl.getPosition())
        });


        deviceOrientationControl.on('change', function(evt) {
            
            
        });
        */

        

        var startGeolocation = function(){
            console.log("geolocation on");
            geolocationControl.setTracking(true);
            geolocationActive = true;
        };

        var stopGeolocation = function(){
            console.log("geolocation off")
            geolocationControl.setTracking(false);
            geolocationActive = false;
        };

        var toggleGeolocation = function(){
            if(geolocationActive){
                stopGeolocation();
            } else {
                startGeolocation();
            }
        };


        var startDeviceOrientation = function(){
            console.log("deviceOrientation on");
            deviceOrientationControl.setTracking(true);
            deviceOrientationActive = true;
        };

        var stopDeviceOrientation = function(){
            console.log("deviceOrientation off")
            deviceOrientationControl.setTracking(false);
            deviceOrientationActive = false;
        };

        var toggleDeviceOrientation = function(){
            if(deviceOrientationActive){
                stopDeviceOrientation();
            } else {
                startDeviceOrientation();
            }
        };

        
            

        var svc =  {

            geolocationActive : geolocationActive,
            deviceOrientationActive : deviceOrientationActive,
            gpsAvailable : gpsAvailable,
            lastPosition : lastPosition,
            startGeolocation : startGeolocation,
            stopGeolocation : stopGeolocation,
            toggleGeolocation : toggleGeolocation,
            startDeviceOrientation : startDeviceOrientation,
            stopDeviceOrientation : stopDeviceOrientation,
            toggleDeviceOrientation : toggleDeviceOrientation,
            geolocationControl : geolocationControl,
            deviceOrientationControl : deviceOrientationControl

        };

        return svc;


        }
    ]);
    
    

}());


