(function(){
    'use strict';

    angular.module('pocketMap')
        .directive('tour', ['$rootScope',function($rootScope){
        return {

            restrict : 'A',
            templateUrl : "templates/tour.html",
            link : function(scope, element, attrs) {
                var el = $(element);

                scope.$watch('step', function(nv){
                    var pop = $('.help-popup', element);
                    var ove = $('.overlay-light', element);

                    if(nv.highlight){
                        var hi = $(nv.highlight)[0];
                        var el=$(hi);
                        var position = el.offset();
                        var pos = el.position();
                        var width =el.width();
                        var height =el.height();

                        var w = $(window);
                        var ww = w.width();
                        var wh = w.height();

                        var p = el.css('padding');
                        p = parseInt(p.replace('px', '')) * 2;
                        
                        var overlayStyle = {
                            top : pos.top  + "px",
                            left : pos.left + "px",
                            width: width + p + "px",
                            height : height + p + "px"
                        }
                        ove.css('display', 'block');
                        ove.animate(overlayStyle);

                        if(nv.insideTarget){
                            
                            var o = {
                                'top': position.top + 50 + "px",
                                'bottom' : wh - (position.top + height) + 50 + "px"
                            }
                            pop.animate(o);    

                        } else {
                            if(position.top + height < wh / 2){
                                var o = {
                                    'top': position.top + 20 + "px",
                                    'bottom' : "10%"
                                }
                                pop.animate(o);    
                            } 
                            if(position.top  > wh / 2){
                                var o = {
                                    'bottom': wh - (position.top ) + 20 + "px",
                                    'top' : "10%"
                                }
                                pop.animate(o);    
                            } 
                        }

                    } else {

                        pop.css('top', "10%");
                        pop.css('bottom', "10%");
                        ove.animate({display:'none'});

                    }

                }, true);
                

                


            }



        }


    }]);
    

}());