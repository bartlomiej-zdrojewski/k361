angular.module('k361', [ 'ngMaterial', 'ngMessages', 'ngAnimate', 'ngAria' ] ).controller( 'Controller', [ '$scope', '$http', '$window', '$mdSidenav', '$mdToast', '$mdMedia', function ( $scope, $http, $window, $mdSidenav, $mdToast, $mdMedia ) {

    $scope.ActiveTab = 2;
    $scope.ContentReady = false;
    $scope.MobileMode = !$mdMedia('gt-sm');

    $scope.SearchText = "";

    $scope.Catalog = [];
    $scope.Tracks = [];

    $scope.TimeToText = function ( time ) {

        var Text = "";

        if ( time >= 3600 ) {

            var Hours = Math.floor( time / 3600 );

            if ( Hours == 1 ) {

                Text = Text + "1 godzina "; }

            else if ( !( ( Hours % 100 ) > 11 && ( Hours % 100 ) < 15 ) && ( Hours % 10 ) > 1 && ( Hours % 10 ) < 5 ) {

                Text = Text + Hours + " godziny "; }

            else {

                Text = Text + Hours + " godzin "; } }

        if ( time >= 60 ) {

            var Minutes = Math.floor( ( time % 3600 ) / 60 );

            if ( Minutes == 1 ) {

                Text = Text + "1 minuta "; }

            else if ( !( ( Minutes % 100 ) > 11 && ( Minutes % 100 ) < 15 ) && ( Minutes % 10 ) > 1 && ( Minutes % 10 ) < 5 ) {

                Text = Text + Minutes + " minuty "; }

            else {

                Text = Text + Minutes + " minut "; } }

        var Seconds = time % 60;

        if ( Seconds == 1 ) {

            Text = Text + "1 sekunda"; }

        else if ( !( ( Seconds % 100 ) > 11 && ( Seconds % 100 ) < 15 ) && ( Seconds % 10 ) > 1 && ( Seconds % 10 ) < 5 ) {

            Text = Text + Seconds + " sekundy"; }

        else {

            Text = Text + Seconds + " sekund"; }

        return Text;

        };

    $scope.SearchInCatalog = function ( ) {

        if ( $scope.SearchText.length >= 3 ) {

            // ...

            }

        else {

            $scope.Tracks = $scope.Catalog; }

        };

    $scope.ToggleTab = function ( tab ) {

        $scope.ActiveTab = tab;

        };

    $scope.OpenMenu = function ( ) {

        $mdSidenav('left').open();

        };

    $scope.CloseMenu = function ( ) {

        $mdSidenav('left').close();

        };

    $scope.CreateTrack = function ( track ) {

        // ...

        };

    $scope.EditTrack = function ( track ) {

        // ...

        };

    $scope.RemoveTrack = function ( track ) {

        // ...

        };

    $scope.PlayNow = function ( track ) {

        $http.post( '/playlist/play', {

            id: track

            } ).then(

                function ( response ) {

                    // ...

                    },

                function ( response ) {

                    console.log( "ERROR #" + subresponse.status + " IN PLAY_NOW: " + subresponse.data );

                    $mdToast.show(

                        $mdToast.simple()
                            .textContent( 'Podczas odtwarzania ścieżki wystąpił błąd! Spróbuj ponownie.' )
                            .position( 'bottom right' )
                            .hideDelay( 5000 )

                        );

                    }

                );

        };

    $scope.StopNow = function ( track ) {

        // ...

        };

    $scope.AddToPlaylist = function ( track ) {

        // ...

        };

    // ...

    $scope.Logout = function ( ) {

        $http.get( '/library/clean' ).then(

            function ( response ) {

                $http.get( '/logout' ).then(

                    function ( subresponse ) {

                        $window.location.href = '/';

                        },

                    function ( subresponse ) {

                        console.log( "ERROR #" + subresponse.status + " IN LOGOUT: " + subresponse.data );

                        $mdToast.show(

                            $mdToast.simple()
                                .textContent( 'Podczas wylogowywania wystąpił błąd! Spróbuj ponownie.' )
                                .position( 'bottom right' )
                                .hideDelay( 5000 )

                            );

                        }

                    );

                },

            function ( response ) {

                console.log( "ERROR #" + response.status + " IN LOGOUT: " + response.data );

                $mdToast.show(

                    $mdToast.simple()
                        .textContent( 'Podczas wylogowywania wystąpił błąd! Spróbuj ponownie.' )
                        .position( 'bottom right' )
                        .hideDelay( 5000 )

                    );

                }

            );

        };

    $scope.Setup = function ( ) {

        var CatalogReady = false;
        var PlaylistReady = true;
        var SettingsReady = true;

        $http.get( '/library' ).then(

            function ( response ) {

                $scope.Catalog = response.data;
                $scope.Tracks = $scope.Catalog;

                CatalogReady = true;

                if ( PlaylistReady && SettingsReady ) {

                    $scope.ContentReady = true; }

                },

            function ( response ) {

                console.log( "ERROR #" + response.status + " IN SETUP: " + response.data );

                // ERROR

                }

            );

        };

    $scope.$watch( function ( ) { return $mdMedia('gt-sm'); }, function( DesktopMode ) {

        $scope.MobileMode = !DesktopMode;

        } );

    } ] );