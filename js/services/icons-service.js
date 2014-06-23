(function(){
    'use strict';

    angular.module('pocketMap')
    .factory('iconsService', [ '$q', '$http', function($q, $http){

        
        // this configuration is static.
        //#TODO (MAYBE): put it in a json file
        var basePath = "img/icons/"
        var config = {

            pharmacy : 'pharmacy.png',
            hospital : 'hospital.png',
            parking  : 'parking.png',
            parking_space  : 'parking.png',
            fuel  : 'fuel.png',
            bicycle_rental : 'bicycle.png'

        };




        var getIcon = function(category){
            var c= config[category] || null;
            if(!c){
                return c;
            }

            return basePath + c;
        };


        var getIconForConfig =function(config, properties){
            console.log("xxxx", config);

            //var i = getIcon
        }


        //this is used in combination with layersManager. see source
        var styleProviderFunction = function(feature, res, style, config){
            
            var category = config.uiOptions.categoryField;
            var cat = feature.values_[category];
            
            var icon = getIcon(cat);
            if(icon){
                var opts = {
                    radius : style.image_.iconImage_.radius_,
                    src : icon
                };
                return new ol.style.Style({
                    image : new ol.style.Icon(opts)
                });
            }

            return style;
        };
        

        var svc = {
            getIcon : getIcon,
            config : config,
            getIconForConfig : getIconForConfig,
            styleProviderFunction : styleProviderFunction
        };
        return svc;
    }]);
    

}());

