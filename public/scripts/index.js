angular.module('k361', [ 'ngMaterial', 'ngMessages', 'ngAnimate', 'ngAria' ] ).controller( 'Controller', [ '$scope', '$http', '$window', '$interval', '$mdSidenav', '$mdDialog', '$mdToast', '$mdMedia', function ( $scope, $http, $window, $interval, $mdSidenav, $mdDialog, $mdToast, $mdMedia ) {

    $scope.Mode = 1;

    $scope.Password = '';
    $scope.OldPassword = '';
    $scope.NewPassword = '';

    $scope.Login = function ( ) {

        $http.post( '/login', {

            password: $scope.Password

            } ).then(

                function ( response ) {

                    $window.location.href = '/k361.html';

                    },

                function ( response ) {

                    console.log( "ERROR #" + response.status + " IN LOGIN: " + response.data );

                    $window.location.reload(); // TODO: ERROR MESSAGE

                    }

            );

        };

    $scope.ChangePassword = function ( ) {

        $http.post( '/state/password', {

            old_password: $scope.OldPassword,
            new_password: $scope.NewPassword

            } ).then(

                function ( response ) {

                    $window.location.reload();

                    },

                function ( response ) {

                    console.log( "ERROR #" + response.status + " IN CHANGE_PASSWORD: " + response.data );

                    }

                );

        };

    $scope.Setup = function ( ) {

        $http.get( '/state/password' ).then(

            function ( response ) {

                if ( !response.data.available ) {

                    $scope.Mode = 2; }

                },

            function ( response ) {

                console.log( "ERROR #" + response.status + " IN SETUP: " + response.data );

                // ERROR

                }

            );

        }

    } ] ).config( function( $mdThemingProvider ) {

        $mdThemingProvider.theme('default')
            .primaryPalette('indigo')
            .accentPalette('red');

        } );