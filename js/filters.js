(function(){
    'use strict';

    angular.module('pocketMap')
    .filter('human', function() {
    return function(input) {
      input = input || '';
      var out = input.replace("-", " ").replace("_", " ");
      return out;
    };
  })
    

}());

