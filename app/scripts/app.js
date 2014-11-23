'use strict';

/**
 * @ngdoc overview
 * @name fbsuggestApp
 * @description
 * # fbsuggestApp
 *
 * Main module of the application.
 */
angular
  .module('fbsuggestApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ezfb'
  ])
  .config(function ($routeProvider, ezfbProvider) {
      ezfbProvider.setInitParams({
        appId: '94158699074',
        xfbml: true,
        version: 'v2.2'
      });

    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });