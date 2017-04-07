// TODO: TRANSLATE

angular.module('k361', [ 'ngMaterial', 'ngMessages', 'ngAnimate', 'ngAria' ] ).controller( 'Controller', [ '$scope', '$http', '$window', '$interval', '$mdSidenav', '$mdDialog', '$mdToast', '$mdMedia', function ( $scope, $http, $window, $interval, $mdSidenav, $mdDialog, $mdToast, $mdMedia ) {

    $scope.ActiveTab = 2;
    $scope.ContentReady = false;
    $scope.MobileMode = !$mdMedia('gt-sm');

    $scope.SearchText = '';
    $scope.ToolbarText = 'Życie jest lepsze z muzyką!'; // EN: Life's better with music!

    $scope.Audio = {};
    $scope.Catalog = [];
    $scope.Downloading = [];
    $scope.Schedule = [];
    $scope.Tracks = [];

    $scope.Synchronization = {

        catalog: 0,
        schedule: 0,
        settings: 0

        };

    $scope.TimeToText = function ( time ) {

        var Text = '';

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

    $scope.CreateTrack = function ( event ) {

        $mdDialog.show( {

            controller: CreateTrackController,
            templateUrl: 'k361-create-track.html',
            parent: angular.element( document.body ),
            targetEvent: event,
            clickOutsideToClose: false,
            fullscreen: true

            } ).then(

                function ( response ) {

                    if ( response.service == 'YOUTUBE' ) {

                        var Code = response.link.match( /(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/ );

                        if( Code != null ) {

                            $http.post( '/library/download', {

                                service: 'YOUTUBE',
                                code: Code[1]

                                } ).then(

                                function ( response ) {

                                    $scope.Downloading.push( response.data );

                                    $mdToast.show(

                                        $mdToast.simple()
                                            .textContent( 'Ścieżka #' + response.data + " zostanie wkrótce pobrana!" )
                                            .position( 'bottom right' )
                                            .hideDelay( 3000 )

                                        );

                                    },

                                function ( response ) {

                                    console.log( "ERROR #" + response.status + " IN CREATE_TRACK: " + response.data );

                                    $mdToast.show(

                                        $mdToast.simple()
                                            .textContent( 'Podczas tworzenia ścieżki wystąpił błąd! Spróbuj ponownie.' )
                                            .position( 'bottom right' )
                                            .hideDelay( 5000 )

                                        );

                                    }

                                );

                            }

                        else {

                            console.log( "ERROR IN CREATE_TRACK: YOUTUBE LINK DOES NOT MATCH THE PATTERN" );

                            $mdToast.show(

                                $mdToast.simple()
                                    .textContent( 'Podczas tworzenia ścieżki wystąpił błąd! Spróbuj ponownie.' )
                                    .position( 'bottom right' )
                                    .hideDelay( 5000 )

                                );

                            }

                        }

                    },

                function ( response ) {

                    // NOTHING

                    } );

        };

    $scope.EditTrack = function ( track ) {

        $mdDialog.show( {

            controller: EditTrackController,
            templateUrl: 'k361-edit-track.html',
            locals: { track: track },
            parent: angular.element( document.body ),
            targetEvent: event,
            clickOutsideToClose: false,
            fullscreen: true

            } ).then(

                function ( response ) {

                    if ( response == 'ERROR' ) {

                        $mdToast.show(

                            $mdToast.simple()
                                .textContent( 'Podczas uzyskiwania danych o ścieżce wystąpił błąd! Spróbuj ponownie.' )
                                .position( 'bottom right' )
                                .hideDelay( 5000 )

                            );

                        return; }

                    $http.post( '/library/track', {

                        id: track,

                        title: response.title,
                        album: response.album,
                        author: response.author,

                        begin: response.begin,
                        end: response.end,
                        rate: response.rate

                        } ).then(

                        function ( response ) {

                            // CODE

                            },

                        function ( response ) {

                            console.log( "ERROR #" + response.status + " IN EDIT_TRACK: " + response.data );

                            $mdToast.show(

                                $mdToast.simple()
                                    .textContent( 'Podczas edytowania ścieżki wystąpił błąd! Spróbuj ponownie.' )
                                    .position( 'bottom right' )
                                    .hideDelay( 5000 )

                                );

                            }

                        );

                    },

                function ( response ) {

                    // NOTHING

                    }

                );

        };

    $scope.RemoveTrack = function ( track ) {

        // ...

        };

    $scope.ToggleNow = function ( track ) {

        if ( $scope.Audio.playing && $scope.Audio.track == track ) {

            $scope.StopNow( track ); }

        else {

            $scope.PlayNow( track ); }

        };

    $scope.PlayNow = function ( track ) {

        $http.post( '/playlist/play', {

            id: track

            } ).then(

                function ( response ) {

                    $scope.Audio.playing = true;
                    $scope.Audio.track = track;

                    $scope.Synchronize();

                    },

                function ( response ) {

                    console.log( "ERROR #" + response.status + " IN PLAY_NOW: " + response.data );

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

        $http.post( '/playlist/stop', {

            // NOTHING

            } ).then(

                function ( response ) {

                    $scope.Audio.playing = false;
                    $scope.Audio.track = '';

                    $scope.Synchronize();

                    },

                function ( response ) {

                    console.log( "ERROR #" + response.status + " IN STOP_NOW: " + response.data );

                    $mdToast.show(

                        $mdToast.simple()
                            .textContent( 'Podczas zatzymywania odtwarzania ścieżki wystąpił błąd! Spróbuj ponownie.' )
                            .position( 'bottom right' )
                            .hideDelay( 5000 )

                    );

                }

            );

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

    $scope.Synchronize = function ( ) {

        $scope.ToolbarText = 'Życie jest lepsze z muzyką!'; // EN: Life's better with music!

        if ( $scope.Audio.playing ) {

            for ( var i = 0; i < $scope.Catalog.length; i++ ) {

                if ( $scope.Catalog[i].id == $scope.Audio.track ) {

                    $scope.ToolbarText = $scope.Catalog[i].title + ' | ' + $scope.Catalog[i].author + ' - ' + $scope.Catalog[i].album;

                    break; } } }

        };

    $scope.SynchronizeWithServer = function ( ) {

        $http.post( '/state/synchronize', {

            catalog: $scope.Synchronization.catalog,
            schedule: $scope.Synchronization.schedule,
            settings: $scope.Synchronization.settings

            } ).then(

                function ( response ) {

                    $scope.Audio = response.data.audio;

                    if ( response.data.catalog.timestamp > $scope.Synchronization.catalog ) {

                        for ( var i = 0; i < response.data.catalog.updated.length; i++ ) {

                            var Done = false;

                            for ( var j = 0; j < $scope.Catalog.length; j++ ) {

                                if ( $scope.Catalog[j].id == response.data.catalog.updated[i].id ) {

                                    $scope.Catalog[j] = response.data.catalog.updated[i];

                                    Done = true; break; } }

                            if ( !Done ) {

                                $scope.Catalog.push( response.data.catalog.updated[i] ); } }

                        for ( var i = 0; i < response.data.catalog.removed.length; i++ ) {

                            for ( var j = 0; j < $scope.Catalog.length; j++ ) {

                                if ( $scope.Catalog[j].id == response.data.catalog.removed[i].id ) {

                                    $scope.Catalog.splice( j, 1 );

                                    break; } } }

                        console.log($scope.Catalog);

                        $scope.Synchronization.catalog = response.data.catalog.timestamp;

                        $scope.SearchInCatalog();

                        console.log($scope.Tracks); }

                    if ( response.data.schedule.timestamp > $scope.Synchronization.schedule ) {

                        $scope.Schedule = response.data.schedule.data;
                        $scope.Synchronization.schedule = response.data.schedule.timestamp; }

                    if ( response.data.settings.timestamp > $scope.Synchronization.settings ) {

                        $scope.Settings = response.data.settings.data;
                        $scope.Synchronization.settings = response.data.settings.timestamp; }

                    $scope.Synchronize();

                    },

                function ( response ) {

                    console.log( "ERROR #" + response.status + " IN SYNCRONIZE_WITH_SERVER: " + response.data );

                    }

            );

        for ( var i = 0; i < $scope.Downloading.length; i++ ) {

            $http.get( '/library/track?id=' + $scope.Downloading[i] ).then(

                function ( response ) {

                    if ( response.data.state == 'ERROR' ) {

                        $mdToast.show(

                            $mdToast.simple()
                                .textContent( 'Podczas pobierania ścieżki #' + response.data.id + ' wystąpił błąd! Spróbuj ponownie.' )
                                .position( 'bottom right' )
                                .hideDelay( 5000 )

                            );

                        for ( var i = 0; i < $scope.Downloading.length; i++ ) {

                            if ( $scope.Downloading[i] == response.data.id ) {

                                $scope.Downloading.splice( i, 1 );

                                break; } } }

                    else if ( response.data.state == 'READY' ) {

                        var Title = response.data.title;

                        if ( Title.length > 40 ) {

                            Title = Title.substr( 0, 37 ) + '...'; }

                        $mdToast.show(

                            $mdToast.simple()
                                .textContent( 'Ścieżka \'' + Title + '\' została pobrana pomyślnie!' )
                                .position( 'bottom right' )
                                .hideDelay( 3000 )

                            );

                        for ( var i = 0; i < $scope.Downloading.length; i++ ) {

                            if ( $scope.Downloading[i] == response.data.id ) {

                                $scope.Downloading.splice( i, 1 );

                                break; } } }

                    },

                function ( response ) {

                    console.log( "ERROR #" + response.status + " IN SYNCHRONIZE: " + response.data );

                    }

                );

            }

        };

    $scope.Setup = function ( ) {

        var LibraryReady = false;
        var PlaylistReady = false;
        var SettingsReady = false;

        $http.get( '/library' ).then(

            function ( response ) {

                $scope.Catalog = response.data.catalog;
                $scope.Tracks = $scope.Catalog;
                $scope.Synchronization.catalog = response.data.timestamp;

                LibraryReady = true;

                if ( PlaylistReady && SettingsReady ) {

                    $scope.ContentReady = true;

                    $interval( $scope.SynchronizeWithServer, $scope.Settings.SynchronizationDelay ); }

                $scope.SearchInCatalog();

                },

            function ( response ) {

                console.log( "ERROR #" + response.status + " IN SETUP: " + response.data );

                // ERROR

                }

            );

        $http.get( '/playlist' ).then(

            function ( response ) {

                $scope.Audio = response.data.audio;
                $scope.Schedule = response.data.schedule;
                $scope.Synchronization.schedule = response.data.timestamp;

                PlaylistReady = true;

                if ( LibraryReady && SettingsReady ) {

                    $scope.ContentReady = true;

                    $interval( $scope.SynchronizeWithServer, $scope.Settings.SynchronizationDelay ); }

                },

            function ( response ) {

                console.log( "ERROR #" + response.status + " IN SETUP: " + response.data );

                // ERROR

                }

            );

        $http.get( '/state' ).then(

            function ( response ) {

                $scope.Settings = response.data.settings;
                $scope.Synchronization.settings = response.data.timestamp;

                SettingsReady = true;

                if ( LibraryReady && PlaylistReady ) {

                    $scope.ContentReady = true;

                    $interval( $scope.SynchronizeWithServer, $scope.Settings.SynchronizationDelay ); }

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

function CreateTrackController ( $scope, $mdDialog ) {

    $scope.YoutubeLink = '';

    $scope.hide = function ( ) {

        $mdDialog.hide();

        };

    $scope.cancel = function ( ) {

        $mdDialog.cancel();

        };

    $scope.respond = function( response ) {

        $mdDialog.hide( response );

        };

    }

function EditTrackController ( $scope, $http, $mdDialog, track ) {

    $scope.TimeToLive = 10;
    $scope.TrackReady = false;

    $scope.Track = {

        title: '',
        album: '',
        author: '',

        length: 36000,
        begin: 0,
        end: 0,

        rate: 0

        };

    $scope.TimeToText = function ( time ) {

        var Text = '';

        if ( time > 3600 ) {

            var Hours = String( Math.floor( time / 3600 ) );
            var Minutes = ( '0' + String( Math.floor( ( time % 3600 ) / 60 ) ) ).substr( -2, 2 );
            var Seconds = ( '0' + String( Math.floor( time % 60 ) ) ).substr( -2, 2 );

            if ( Hours.length == 1 ) {

                Hours = '0' + Hours; }

            Text = Hours + ':' + Minutes + ':' + Seconds; }

        else {

            var Minutes = ( '0' + String( Math.floor( ( time % 3600 ) / 60 ) ) ).substr( -2, 2 );
            var Seconds = ( '0' + String( Math.floor( time % 60 ) ) ).substr( -2, 2 );

            Text = Minutes + ':' + Seconds; }

        return Text;

        };

    $scope.Setup = function ( ) {

        $http.get( '/library/track?id=' + track ).then(

            function ( response ) {

                $scope.Track.title = response.data.title;
                $scope.Track.album = response.data.album;
                $scope.Track.author = response.data.author;
                $scope.Track.length = response.data.length;
                $scope.Track.begin = response.data.begin;
                $scope.Track.end = response.data.end;
                $scope.Track.rate = response.data.rate;

                $scope.TrackReady = true;

                },

            function ( response ) {

                if ( $scope.TimeToLive > 0 ) {

                    $scope.Setup();

                    $scope.TimeToLive--; }

                else {

                    $scope.respond('ERROR'); }

                }

            );

        };

    $scope.hide = function ( ) {

        $mdDialog.hide();

        };

    $scope.cancel = function ( ) {

        $mdDialog.cancel();

        };

    $scope.respond = function( response ) {

        $mdDialog.hide( response );

        };

    }