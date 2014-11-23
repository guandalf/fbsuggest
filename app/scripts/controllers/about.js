'use strict';

/**
 * @ngdoc function
 * @name fbsuggestApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the fbsuggestApp
 */
angular.module('fbsuggestApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
