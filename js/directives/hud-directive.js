(function(){
    'use strict';

    angular.module('pocketMap')
        .directive('hud', ['$rootScope','layersManager', function($rootScope, layersManager){
        return {

            restrict : 'C',
            //template : "<svg></svg>",
            link : function(scope, element, attrs) {
                var el = $(element);
                var w = el.width() - 50;
                var h = el.height() -50;
                var r = Math.min(w,h);

                console.log("sss", w, h)

                
                d3.select(el[0])
                    .append('svg')
                    .attr('width', w)
                    .attr('height', h)
                    .append('circle')
                    .attr("cx", w/2)
                    .attr("cy", h/2)
                    .attr("r", r/2)
                    .attr("stroke", "black")
                    .attr("fill", "transparent")

                
                



            }



        }


    }]);
    

}());