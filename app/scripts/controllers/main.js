'use strict';

/**
 * @ngdoc function
 * @name fbsuggestApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the fbsuggestApp
 */
angular.module('fbsuggestApp')
    .controller('MainCtrl', function ($scope, ezfb) {
      var myFriendsList = [];
      var myMoviesList = [];
      var myId;

      /**
       * Update api('/me') result
       */
      function updateApiMe() {
        console.debug('UpdateApiMe');
        ezfb.api('/me', function (res) {
          $scope.apiMe = res;
        });
      }

      $scope.login = function () {
        /**
         * Calling FB.login with required permissions specified
         * https://developers.facebook.com/docs/reference/javascript/FB.login/v2.0
         */
        ezfb.login(function (res) {
          /**
           * no manual $scope.$apply, I got that handled
           */
          console.debug(JSON.stringify(res));
          if (res.authResponse) {
            updateLoginStatus(updateApiMe);
          }
        }, {scope: 'user_friends, user_actions.video'});
      };

      $scope.logout = function () {
        /**
         * Calling FB.logout
         * https://developers.facebook.com/docs/reference/javascript/FB.logout
         */
        ezfb.logout(function () {
          updateLoginStatus(updateApiMe);
        });
      };

      /**
       * For generating better looking JSON results
       */
      var autoToJSON = ['loginStatus', 'apiMe'];
      angular.forEach(autoToJSON, function (varName) {
        $scope.$watch(varName, function (val) {
          $scope[varName + 'JSON'] = JSON.stringify(val, null, 2);
        }, true);
      });

      /**
       * Update loginStatus result
       */
      function updateLoginStatus(more) {
        ezfb.getLoginStatus(function (res) {
          $scope.loginStatus = res;
          (more || angular.noop)();
        });
      }

      function doRetrieveFriends(next) {
        console.debug('Friends:');
        ezfb.api(next, function (res) {
          console.debug(JSON.stringify(res));
          if (!res || res.error) {
            $scope.login();
          }
          var elements = res.data || [];
          for (var i = 0; i < elements.length; i++) {
            console.debug(JSON.stringify(elements[i]));
            var id = elements[i].id;
            myFriendsList.push(id);
          }
          if (typeof res.paging != 'undefined' && typeof res.paging.next != 'undefined') {
            console.debug(res.paging.next);
            doRetrieveFriends(res.paging.next);
          } /*else {
            doRetrieveMovies();
          }*/
        })
      }

      function doWriteMyMovie(structure) {
        var MyMovies = Parse.Object.extend("MyMovies");

        var query = new Parse.Query(MyMovies);
        query.equalTo('uid', myId);
        query.first({
          success: function (r) {
            if (typeof r != 'undefined') {
              console.debug(JSON.stringify(r));
              r.set('movies', structure.movies);
              console.debug("Writing list of lists");
              console.debug(JSON.stringify(r));
              //console.debug(results.get('movies'));
              doRetrieveMovies();
            }
            else {
              var mymovies = new MyMovies();
              mymovies.save(structure, {
                success: function (object) {
                  $(".success").show();
                  doRetrieveMovies();
                },
                error: function (model, error) {
                  $(".error").show();
                }
              });
            }
          }
        });
      }

      function doRetrieveMyMovies(next) {
        console.debug("next movie is " + next);
        ezfb.api(next, function (response) {
          console.debug(JSON.stringify(response));
          if (!response || response.error) {
            $scope.login();
          }
          var elements = response.data || [];
          for (var i = 0; i < elements.length; i++) {
            if (typeof elements[i].data.movie == 'undefined') {
              console.debug("skipping");
              continue;
            }
            console.debug(elements[i]);
            console.debug(elements[i].data);
            var mId = elements[i].data.movie.id;
            console.debug(mId);
            myMoviesList.push(mId);
          }
          console.debug(JSON.stringify(response.data));
          if(typeof response.paging != 'undefined' && typeof response.paging.next != 'undefined') {
            console.debug(response.paging.next);
            doRetrieveMyMovies(response.paging.next);

          } else {  //all code goes here
            console.debug(JSON.stringify(myMoviesList));
            doWriteMyMovie({'uid': myId, 'movies': myMoviesList})
          }

        });
      }

      function doRetrieveMovies() {
        var MyMovies = Parse.Object.extend("MyMovies");
        var query = new Parse.Query(MyMovies);
        query.containedIn('uid', myFriendsList);
        query.find({
          success: function (results) {
            console.debug("Outputting movies");
            console.debug(JSON.stringify(results));
            var suggestion = _(JSON.parse(JSON.stringify(results)))
                .pluck("movies")
                .flatten()
                .difference(myMoviesList)
                .countBy()
                .map(function (v, k) {
                  return {"mid": k, "counter": v}
                })
                .sortBy("counter")
                .reverse()
                .first(10)
              //.pluck("mid")
                .value();
            console.debug("my movies");
            console.debug(JSON.stringify(myMoviesList));
            console.debug("suggestion");
            console.debug(JSON.stringify(suggestion));
            $scope.suggestion = suggestion;
            FB.XFBML.parse();
          }
        })
      }
      console.debug('Starting up');
      doRetrieveFriends('/me/friends');
      //doRetrieveMyMovies('/me/video.watches');
    });
