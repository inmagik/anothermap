var v = [];
            var projection = ol.proj.configureProj4jsProjection({
              code: 'EPSG:32632',
              //extent: [166021.4431, 0.0000, 833978.5569, 9329005.1825]
            });
            
            var dusafLayer = new ol.layer.Tile({
                title: "Dusaf",
                visible : false,
                source: new ol.source.TileWMS({
                  url : 'http://www.cartografia.regione.lombardia.it/ArcGIS93/services/wms/dusaf21_wms/MapServer/WMSServer',
                  projection : projection,
                  params: {
                    LAYERS: '1,2', VERSION: '1.1.1',
                    FORMAT:'image/png'
                  }

                })
            });


            var ortoLayer = new ol.layer.Tile({
                title: "Ortofoto",
                visible : false,
                source: new ol.source.TileWMS({
                  url: 'http://www.cartografia.regione.lombardia.it/ArcGIS10/services/wms/ortofoto2007_UTM32N_wms/MapServer/WMSServer',
                  projection : projection,
                  params: {
                    LAYERS: 'lombardia2007wgs84.ecw', VERSION: '1.3.0',
                    FORMAT:'image/png'
                  }

                })
            });


            
            
           var parser = new ol.format.WMSCapabilities();

          $.ajax('http://www.cartografia.regione.lombardia.it/ArcGISIIT2/services/PGT/tav_previsioni_b/MapServer/WMSServer?request=GetCapabilities&service=WMS').then(function(response) {
            var result = parser.read(response);
            console.log("xx", response)
            });


            var prevLayer = new ol.layer.Tile({
                title: "aaa",
                visible : false,
                source: new ol.source.TileWMS({
                  url: 'http://www.cartografia.regione.lombardia.it/ArcGISIIT2/services/PGT/tav_previsioni_b/MapServer/WMSServer',
                  projection : projection,
                  params: {
                    LAYERS: 'lombardia2007wgs84.ecw', VERSION: '1.3.0',
                    FORMAT:'image/png'
                  }

                })
            });


            


            var cfgDusaf = {
                name : "dusaf",
                group : "rasters",
                layer : dusafLayer,
                uiOptions : {
                    description : "dusaf layer"
                }
            }

            var cfgOrto = {
                name : "Ortofoto",
                group : "rasters",
                layer : ortoLayer,
                uiOptions : {
                    description : "ortofoto layer"
                }
            }

            v.push(cfgOrto);
            v.push(cfgDusaf);

            return v;