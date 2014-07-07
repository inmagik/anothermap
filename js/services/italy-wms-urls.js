(function(){
    'use strict';

    angular.module('pocketMap')
    .factory('italyWMSUrls', [ function(){

        var svc = {

            wmsUrls : [
                { 
                    groupName : 'Geoportale Nazionale',
                    urls : [
                        'wms_capabilities/geoportale/geologica.xml',
                        'wms_capabilities/geoportale/ita_ecopedologica.xml',
                        'wms_capabilities/geoportale/bacini.xml',
                        'wms_capabilities/geoportale/toponimi.xml',
                        'wms_capabilities/geoportale/base_de_agostini.xml',
                        'wms_capabilities/geoportale/zone_umide.xml',
                        'wms_capabilities/geoportale/sismica_2012.xml',
                        'wms_capabilities/geoportale/rischio_idro.xml',
                        


                    ]
                },
               
                { 
                    groupName : 'Regione Lombardia',
                    urls : [
                        'wms_capabilities/lombardia/orto_2012.xml',
                        'wms_capabilities/lombardia/ortofoto_2007.xml', 
                        'wms_capabilities/lombardia/ctr.xml', 
                        'wms_capabilities/lombardia/fisica.xml',
                        //'wms_capabilities/lombardia/dusaf.xml',
                    ]
                },
                { 
                    groupName : 'Regione Piemonte',
                    urls : [
                        'wms_capabilities/piemonte/sfondo_regione.xml',
                        'wms_capabilities/piemonte/ortofoto_piemonte.xml',
                    ]
                },
                { 
                    groupName : 'Regione Toscana',
                    urls : [
                        'wms_capabilities/toscana/ortofoto.xml',
                        //'wms_capabilities/toscana/ortofoto_piemonte.xml',
                    ]
                },
                
                /*
                { 
                    groupName : 'Nasa',
                    urls : [
                        'wms_capabilities/nasa/nasa.xml',
                    ]
                }
                */
            
            ]
            
        };



    

        return svc;
    }]);
    

}());

