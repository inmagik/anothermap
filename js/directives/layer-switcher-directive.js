(function(){
    'use strict';

    angular.module('pocketMap')
        .directive('layerSwitcher', ['$rootScope','layersManager', 'indexService', function($rootScope, layersManager, indexService){
        return {

            restrict : 'C',
            scope : {mapId:"@"},
            templateUrl  : "templates/layer-switcher.html",
            link : function(scope, element, attrs) {
                
                if(!scope.mapId){
                    return;
                }


                scope.sortableOptions = {
                    start: function(e, ui) {
                       // creates a temporary attribute on the element with the old index
                       
                        $(ui.item).attr('data-previndex', ui.item.index());
                        console.log(ui.item.index())
                    },
                    stop: function(e, ui) {
                        // gets the new and old index then removes the temporary attribute
                        var newIndex = ui.item.index();
                        var oldIndex = $(ui.item).attr('data-previndex');
                        console.log("newIndex", newIndex, oldIndex)
                        $(this).removeAttr('data-previndex');
                        layersManager.setLayerPosition(scope.mapId, oldIndex, newIndex);
                    },
                    axis: 'y',
                    handle : '.handle'
                };


                scope.toggleLayersPanel = function(){
                    $rootScope.$broadcast('toggleLayersPanel');
                }

                scope.getLayerIcon = function(layerName){
                    return indexService.getConfigForLayer(layerName, "icon");
                };            

                

                var refresh = function(){
                    scope.groupedLayers = layersManager.groupLayers(scope.mapId);
                    if(attrs.groups){
                        var allowedGroups = attrs.groups.split(",");
                        scope.groupedLayers = _.reject(scope.groupedLayers, function(item){
                            return allowedGroups.indexOf(item.group) == -1;
                        });
                    }
                    
                    scope.groupedValues  = {};
                    scope.ungroupedValues = {};
                    
                    _.each(scope.groupedLayers, function(item){
                        if(item.group){
                            var l = item.layers.length;
                            scope.groupedValues[item.group] = item.layers[l-1].name;
                        } else {
                            _.each(item.layers, function(l){
                                scope.ungroupedValues[l.name] = l.layer.getVisible();
                            })
                        }
                    });

                };

                var msg = 'layersChange.'+scope.mapId;
                $rootScope.$on(msg, function(evt,data){
                    refresh();
                });

                refresh();

                
                scope.setVisible = function(layerContainer){
                    /*
                    if(layerContainer.group){
                        var complements = layersManager.getGroupComplement(scope.mapId,layerContainer.name);
                        _.each(complements, function(item){
                            item.setVisible(false);
                        })
                        layerContainer.layer.setVisible(true);

                    } else {
                        var l = layerContainer.layer;
                        l.setVisible(!(l.getVisible()));
                    }
                    */
                    var l = layerContainer.layer;
                    l.setVisible(!(l.getVisible()));
                };

                scope.removeLayer = function(layerContainer){
                    layersManager.removeLayer(scope.mapId, layerContainer);
                };

                scope.isVisible = function(layerContainer){
                    return layerContainer.layer.getVisible()
                }



            }



        }


    }]);
    

}());