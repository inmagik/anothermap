(function(){
    'use strict';

angular.module('pocketMap', ['ionic', 'pocketMap.controllers', 'ngOL3Inmagik', 'ngAnimate'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('map', {
      url: "/map",
      templateUrl: "templates/map.html",
      controller: 'MapCtrl'
    })
    /*
    .state('map.browser', {
      url: "/map/browser",
      views : {
        'subview' : {
          templateUrl: "templates/browser.index.html"    
        }
        
      }
      
      
    });
  */
    
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/map');

});



}());