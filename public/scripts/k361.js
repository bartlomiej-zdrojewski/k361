// TODO: TRANSLATE

angular.module('k361', [ 'ngMaterial', 'ngMessages', 'ngAnimate', 'ngAria' ] ).controller( 'Controller', [ '$scope', '$http', '$window', '$interval', '$mdSidenav', '$mdDialog', '$mdToast', '$mdMedia', function ( $scope, $http, $window, $interval, $mdSidenav, $mdDialog, $mdToast, $mdMedia ) {

    $scope.$mdMedia = $mdMedia;

    $scope.ActiveTab = 2;
    $scope.ContentReady = false;
    $scope.MobileMode = !$mdMedia('gt-sm');

    $scope.SearchText = '';
    $scope.ToolbarText = 'Życie jest lepsze z muzyką!'; // EN: Life's better with music!

    $scope.PlaylistControls = {

        Days: [],
        Months: [],
        Years: [],
        Schedule: [],

        Values: {

            day: 0,
            month: 0,
            year: 0,
            hours: 0,

            track: '',
            order: 0,
            value: ''

            },

        Initiated: false

        };

    $scope.SettingsBuffer = {

        hold: false,
        playlist_designer_launch_time: '00:00:00'

        };

    $scope.Synchronization = {

        catalog: 0,
        schedule: 0,
        settings: 0

        };

    $scope.Audio = {};
    $scope.Catalog = [];
    $scope.Downloading = [];
    $scope.Playlist = [];
    $scope.Schedule = [];
    $scope.Settings = {};
    $scope.Tracks = [];

    $scope.MonthName = [

        'stycznia',
        'lutego',
        'marca',
        'kwietnia',
        'maja',
        'czerwca',
        'lipca',
        'sierpnia',
        'września',
        'października',
        'listopada',
        'grudnia'

        ];

    $scope.ToggleTab = function ( tab ) {

        $scope.ActiveTab = tab;

        };

    $scope.OpenMenu = function ( ) {

        $mdSidenav('left').open();

        };

    $scope.CloseMenu = function ( ) {

        $mdSidenav('left').close();

        };

    $scope.GetDaysInMonth = function ( month, year ) {

        return ( new Date( year, month, 0 ).getDate() ); };

    $scope.GetTimeFromDate = function ( date ) {

        var Time = new Date( date );

        return ( Time.getHours() * 3600 + Time.getMinutes() * 60 + Time.getSeconds() );

        };

    $scope.TimeToText = function ( time, force_hours ) {

        var Text = '';

        if ( time > 3600 || force_hours === true ) {

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

    $scope.TimeToWords = function ( time ) {

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

    $scope.InitPlaylistControls = function ( ) {

        var Time = new Date();

        $scope.PlaylistControls.Values.day = Time.getDate();
        $scope.PlaylistControls.Values.month = Time.getMonth();
        $scope.PlaylistControls.Values.year = Time.getFullYear();

        if ( Time.getHours() < 7 ) {

            $scope.PlaylistControls.Values.hours = 1; }

        else if ( Time.getHours() < 17 ) {

            $scope.PlaylistControls.Values.hours = 2; }

        else {

            $scope.PlaylistControls.Values.hours = 3; }

        for ( var i = 0; i < 9; i++ ) {

            $scope.PlaylistControls.Years.push( $scope.PlaylistControls.Values.year - 4 + i ); }

        $scope.PlaylistControls.Initiated = true;

        };

    $scope.UpdatePlaylistControls = function ( ) {

        if ( !$scope.PlaylistControls.Initiated ) {

            return; }

        $scope.PlaylistControls.Days = [];
        $scope.PlaylistControls.Months = [];

        for ( var i = 1; i <= $scope.GetDaysInMonth( $scope.PlaylistControls.Values.month + 1, $scope.PlaylistControls.Values.year ); i++ ) {

            $scope.PlaylistControls.Days.push( i ); }

        for ( var i = 0; i <= 11; i++ ) {

            $scope.PlaylistControls.Months.push( i ); }

        $scope.Playlist = [];
        $scope.PlaylistControls.Schedule = [];

        if ( $scope.Schedule.length == 0 ) {

            return; }

        var Begin = new Date();
        var End = new Date();

        if ( $scope.PlaylistControls.Values.hours == 1 ) {

            Begin = new Date( $scope.PlaylistControls.Values.year, $scope.PlaylistControls.Values.month, $scope.PlaylistControls.Values.day, 0, 0, 0 );
            End = new Date( $scope.PlaylistControls.Values.year, $scope.PlaylistControls.Values.month, $scope.PlaylistControls.Values.day, 7, 0, 0 ); }

        else if ( $scope.PlaylistControls.Values.hours == 2 ) {

            Begin = new Date( $scope.PlaylistControls.Values.year, $scope.PlaylistControls.Values.month, $scope.PlaylistControls.Values.day, 7, 0, 0 );
            End = new Date( $scope.PlaylistControls.Values.year, $scope.PlaylistControls.Values.month, $scope.PlaylistControls.Values.day, 17, 0, 0 ); }

        else {

            Begin = new Date( $scope.PlaylistControls.Values.year, $scope.PlaylistControls.Values.month, $scope.PlaylistControls.Values.day, 17, 0, 0 );
            End = new Date( $scope.PlaylistControls.Values.year, $scope.PlaylistControls.Values.month, $scope.PlaylistControls.Values.day, 24, 0, 0 ); }

        var ScheduleLeft = 0;
        var ScheduleRight = $scope.Schedule.length - 1;

        var a = ScheduleRight;
        var b = ScheduleLeft;

        // TODO: TEST ->

        while ( a > ScheduleLeft ) {

            var m = Math.floor( ( ScheduleLeft + a ) / 2 );

            if ( $scope.Schedule[m].end < Begin.getTime() ) {

                ScheduleLeft = m + 1; }

            else {

                a = m; } }

        while ( b < ScheduleRight ) {

            var m = Math.floor( ( b + ScheduleRight ) / 2 );

            if ( $scope.Schedule[m].begin > End.getTime() ) {

                ScheduleRight = m - 1; }

            else {

                b = m + 1; } }

        // TODO: -> TEST

        for ( var i = ScheduleLeft; i <= ScheduleRight; i++ ) {

            if ( $scope.Schedule[i].end < Begin.getTime() || $scope.Schedule[i].begin > End.getTime() ) {

                continue; }

            $scope.PlaylistControls.Schedule.push( $scope.Schedule[i] ); }

        if ( $scope.PlaylistControls.Schedule.length == 0 ) {

            return; }

        for ( var i = 0; i < $scope.PlaylistControls.Schedule.length; i++ ) {

            var Element = {

                type: 'TRACK',

                id: $scope.PlaylistControls.Schedule[i].id,
                title: $scope.PlaylistControls.Schedule[i].title,
                album: $scope.PlaylistControls.Schedule[i].album,
                author: $scope.PlaylistControls.Schedule[i].author,

                begin: $scope.PlaylistControls.Schedule[i].begin,
                end: $scope.PlaylistControls.Schedule[i].end,

                };

            $scope.Playlist.push( Element ); }

        if ( $scope.Playlist[0].begin > Begin.getTime() ) {

            var Element = {

                type: 'PAUSE',

                begin: Begin.getTime(),
                end: $scope.Playlist[0].begin

                };

            $scope.Playlist.unshift( Element ); }

        if ( $scope.Playlist[ $scope.Playlist.length - 1 ].end < End.getTime() ) {

            var Element = {

                type: 'PAUSE',
                begin: $scope.Playlist[ $scope.Playlist.length - 1 ].end,
                end: End.getTime()

                };

            $scope.Playlist.push( Element ); }

        for ( var i = 1; i < $scope.Playlist.length; i++ ) {

            if ( $scope.Playlist[ i - 1 ].end != $scope.Playlist[i].begin && ( $scope.Playlist[i].begin - $scope.Playlist[ i - 1 ].end ) >= 1000 ) {

                var Element = {

                    type: 'PAUSE',
                    begin: $scope.Playlist[ i - 1 ].end,
                    end: $scope.Playlist[i].begin

                    };

                $scope.Playlist.splice( i, 0, Element ); } }

        for ( var i = 0; i < $scope.Playlist.length; i++ ) {

            if ( $scope.Playlist[i].type == 'TRACK' ) {

                $scope.Playlist[i].up = '';
                $scope.Playlist[i].down = '';

                if ( i > 0 ) {

                    if ( $scope.Playlist[i-1].type == 'TRACK' ) {

                        $scope.Playlist[i].up = $scope.Playlist[i-1].id; } }

                if ( i < ( $scope.Playlist.length - 1 ) ) {

                    if ( $scope.Playlist[i+1].type == 'TRACK' ) {

                        $scope.Playlist[i].down = $scope.Playlist[i+1].id; } } } }

        };

    $scope.ValidatePlaylistControls = function ( ) {

        if ( $scope.PlaylistControls.Values.track == '' ) {

            return false; }

        if ( $scope.PlaylistControls.Values.order < 1 || $scope.PlaylistControls.Values.order > 3 ) {

            return false; }

        if ( $scope.PlaylistControls.Values.value == '' ) {

            return false; }

        if ( $scope.PlaylistControls.Values.order == 1 ) {

            if ( !$scope.PlaylistControlsForm.Time.$valid ) {

                return false; } }

        else {

            var Found = false;

            for ( var i = 0; i < $scope.PlaylistControls.Schedule.length; i++ ) {

                if ( $scope.PlaylistControls.Schedule[i].id == $scope.PlaylistControls.Values.value ) {

                    Found = true;

                    break; } }

            if ( !Found ) {

                return false; } }

        return true;

        };

    $scope.AddTrackToPlaylist = function ( ) {

        var Direction = 1;
        var Begin = new Date();

        if ( $scope.PlaylistControls.Values.order == 1 ) {

            var Delta = 0;

            if ( $scope.PlaylistControls.Values.value.length == 7 ) {

                Delta = 1; }

            var Hours = parseInt( $scope.PlaylistControls.Values.value.substr( 0, 2 - Delta ) );
            var Minutes = parseInt( $scope.PlaylistControls.Values.value.substr( 3 - Delta, 2 ) );
            var Seconds = parseInt( $scope.PlaylistControls.Values.value.substr( 6 - Delta, 2 ) );

            Begin = new Date( $scope.PlaylistControls.Values.year, $scope.PlaylistControls.Values.month, $scope.PlaylistControls.Values.day, Hours, Minutes, Seconds ); }

        else {

            for ( var i = 0; i < $scope.Schedule.length; i++ ) {

                if ( $scope.Schedule[i].id == $scope.PlaylistControls.Values.value ) {

                    if ( $scope.PlaylistControls.Values.order == 2 ) {

                        Begin = new Date( $scope.Schedule[i].end ); }

                    else {

                        Direction = -1;
                        Begin = new Date( $scope.Schedule[i].begin ); }

                    break; } } }

        $http.post( '/playlist/add', {

            track: $scope.PlaylistControls.Values.track,
            begin: Begin.getTime(),
            direction: Direction

            } ).then(

                function ( response ) {

                    // NOTHING

                    },

                function ( response ) {

                    console.log( "ERROR #" + response.status + " IN ADD_TRACK_TO_PLAYLIST: " + response.data );

                    if ( response.status == 409 ) {

                        $mdToast.show(

                            $mdToast.simple()
                                .textContent( 'Ścieżka jest w konflikcie z inną ścieżką. Wprowadź poprawny czas odtwarzania.' )
                                .position( 'bottom right' )
                                .hideDelay( 5000 )

                            );

                        }

                    else {

                        $mdToast.show(

                            $mdToast.simple()
                                .textContent( 'Podczas dodawania ścieżki do playlisty wystąpił błąd! Spróbuj ponownie.' )
                                .position( 'bottom right' )
                                .hideDelay( 5000 )

                            );

                        }

                    }

                );

        };

    $scope.SwapTracksInPlaylist = function ( first, second ) {

        $http.post( '/playlist/swap', {

            first: first,
            second: second

            } ).then(

                function ( response ) {

                    // NOTHING

                    },

                function ( response ) {

                    console.log( "ERROR #" + response.status + " IN SWAP_TRACKS_IN_PLAYLIST: " + response.data );

                    $mdToast.show(

                        $mdToast.simple()
                            .textContent( 'Podczas zamieniania kolejności ścieżek wystąpił błąd. Spróbuj ponownie.' )
                            .position( 'bottom right' )
                            .hideDelay( 5000 )

                        );

                    }

                );

        };

    $scope.RemoveTrackFromPlaylist = function ( track ) {

        $http.post( '/playlist/remove', {

            id: track

            } ).then(

                function ( response ) {

                    // NOTHING

                    },

                function ( response ) {

                    console.log( "ERROR #" + response.status + " IN REMOVE_TRACK_FROM_PLAYLIST: " + response.data );

                    $mdToast.show(

                        $mdToast.simple()
                            .textContent( 'Podczas usuwania ścieżki wystąpił błąd. Spróbuj ponownie.' )
                            .position( 'bottom right' )
                            .hideDelay( 5000 )

                        );

                    }

                );

        };

    $scope.SearchInCatalog = function ( ) {

        $scope.Tracks = [];

        if ( $scope.SearchText.length >= 3 ) {

            for ( var i = 0; i < $scope.Catalog.length && $scope.Tracks < 100; i++ ) { // TODO: SHOW SOMETHING AT i >= 100

                if ( $scope.Catalog[i].title.toLowerCase().search( $scope.SearchText.toLowerCase() ) != -1 ||
                     $scope.Catalog[i].album.toLowerCase().search( $scope.SearchText.toLowerCase() ) != -1 ||
                     $scope.Catalog[i].author.toLowerCase().search( $scope.SearchText.toLowerCase() ) != -1 ) {

                    $scope.Tracks.push( $scope.Catalog[i] ); } } }

        else {

            $scope.Tracks = $scope.Catalog; }

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

                        volume: response.volume,
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

        $http.post( '/library/remove', {

            id: track

            } ).then(

            function ( response ) {

                // CODE

                },

            function ( response ) {

                console.log( "ERROR #" + response.status + " IN REMOVE_TRACK: " + response.data );

                $mdToast.show(

                    $mdToast.simple()
                        .textContent( 'Podczas usuwania ścieżki wystąpił błąd! Spróbuj ponownie.' )
                        .position( 'bottom right' )
                        .hideDelay( 5000 )

                    );

                }

            );

        };

    $scope.SelectTrack = function ( track ) {

        $scope.ActiveTab = 1;
        $scope.PlaylistControls.Values.track = track;

        };

    $scope.ToggleTrack = function ( track ) {

        if ( $scope.Audio.playing && $scope.Audio.track == track ) {

            $scope.StopTrack( track ); }

        else {

            $scope.PlayTrack( track ); }

        };

    $scope.PlayTrack = function ( track ) {

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

                    if ( response.status == 409 ) {

                        $mdToast.show(

                            $mdToast.simple()
                                .textContent( 'Ścieżka nie może zostać odtworzona podczas zastrzeżonych godzin.' )
                                .position( 'bottom right' )
                                .hideDelay( 5000 )

                            );

                        }

                    else {

                        $mdToast.show(

                            $mdToast.simple()
                                .textContent( 'Podczas odtwarzania ścieżki wystąpił błąd! Spróbuj ponownie.' )
                                .position( 'bottom right' )
                                .hideDelay( 5000 )

                            );

                        }

                    }

                );

        };

    $scope.StopTrack = function ( track ) {

        $http.get( '/playlist/stop' ).then(

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

    $scope.EditTimeIntervals = function ( event, intervals, trigger ) {

        if ( typeof( trigger ) != 'undefined' ) {

            if ( trigger == false ) {

                return; } }

        $mdDialog.show( {

            controller: EditTimeIntervalsController,
            templateUrl: 'k361-edit-time-intervals.html',
            locals: { intervals: intervals },
            parent: angular.element( document.body ),
            targetEvent: event,
            clickOutsideToClose: false,
            fullscreen: true

            } ).then(

                function ( response ) {

                    // NOTHING

                    },

                function ( ) {

                    // NOTHING

                    }

                );

        };

    $scope.CleanPlaylist = function ( ) {

        $http.get( '/playlist/clean' ).then(

            function ( response ) {

                $mdToast.show(

                    $mdToast.simple()
                        .textContent( 'Playlista została wyczyszczona pomyślnie!' )
                        .position( 'bottom right' )
                        .hideDelay( 3000 )

                    );

                },

            function ( response ) {

                console.log( "ERROR #" + response.status + " IN CLEAN_PLAYLIST: " + response.data );

                $mdToast.show(

                    $mdToast.simple()
                        .textContent( 'Podczas czyszczenia playlisty wystąpił błąd! Spróbuj ponownie.' )
                        .position( 'bottom right' )
                        .hideDelay( 5000 )

                    );

                }

            );

        };

    $scope.ClearServerData = function ( event ) {

        var Dialog = $mdDialog.confirm ( )
            .title( 'Czyszczenie danych serwera' )
            .textContent( 'Akcja ta spowoduje nieodwracalne usunięcie wszelkich danych z serwera, w tym zawartości biblioteki oraz playlisty. Czy na pewno chcesz kontynuować?' )
            .ariaLabel( 'Czyszczenie danych serwera' )
            .targetEvent( event )
            .ok( 'Tak, kontynuuj' )
            .cancel( 'Nie, przerwij akcję' );

        $mdDialog.show( Dialog ).then(

            function ( ) {

                $http.get( '/state/reset' ).then(

                    function ( response ) {

                        $window.location.href = '/';

                        },

                    function ( response ) {

                        console.log( "ERROR #" + response.status + " IN CLEAR_SERVER_DATA: " + response.data );

                        $mdToast.show(

                            $mdToast.simple()
                                .textContent( 'Podczas czyszczenia danych serwera wystąpił błąd! Spróbuj ponownie.' )
                                .position( 'bottom right' )
                                .hideDelay( 5000 )

                            );

                        }

                    );

                },

            function ( ) {

                // NOTHING

                }

            );

    };

    $scope.ShutdownServer = function ( ) {

        $http.get( '/state/shutdown' ).then(

            function ( response ) {

                $window.location.href = '/';

                },

            function ( response ) {

                console.log( "ERROR #" + response.status + " IN SHUTDOWN_SERVER: " + response.data );

                $mdToast.show(

                    $mdToast.simple()
                        .textContent( 'Podczas wyłączania serwera wystąpił błąd! Spróbuj ponownie.' )
                        .position( 'bottom right' )
                        .hideDelay( 5000 )

                    );

                }

            );

        };

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

        $http.post( '/state/synchronize', {

            catalog: $scope.Synchronization.catalog,
            schedule: $scope.Synchronization.schedule,
            settings: $scope.Synchronization.settings

            } ).then(

                function ( response ) {

                    $scope.Audio = response.data.audio;

                    if ( response.data.catalog.timestamp > $scope.Synchronization.catalog ) {

                        $scope.Synchronization.catalog = response.data.catalog.timestamp;

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

                        $scope.Catalog.sort(

                            function ( a, b ) {

                                if ( a.author < b.author ) {

                                    return -1; }

                                if ( a.author > b.author ) {

                                    return 1; }

                                if ( a.album < b.album ) {

                                    return -1; }

                                if ( a.album > b.album ) {

                                    return 1; }

                                if ( a.title < b.title ) {

                                    return -1; }

                                if ( a.title > b.title ) {

                                    return 1; }

                                return 0; } );

                        $scope.SearchInCatalog(); }

                    if ( response.data.schedule.timestamp > $scope.Synchronization.schedule ) {

                        $scope.Schedule = response.data.schedule.data;
                        $scope.Synchronization.schedule = response.data.schedule.timestamp;

                        for ( var i = 0; i < $scope.Schedule.length; i++ ) {

                            var Title = '';
                            var Album = '';
                            var Author = '';

                            for ( var j = 0; j < $scope.Catalog.length; j++ ) {

                                if ( $scope.Catalog[j].id == $scope.Schedule[i].track ) {

                                    Title = $scope.Catalog[j].title;
                                    Album = $scope.Catalog[j].album;
                                    Author = $scope.Catalog[j].author;

                                    break; } }

                            $scope.Schedule[i].title = Title;
                            $scope.Schedule[i].album = Album;
                            $scope.Schedule[i].author = Author;

                            if ( Title.length > 23 ) {

                                Title = Title.substr( 0, 20 ) + '...'; }

                            if ( Author.length > 23 ) {

                                Author = Author.substr( 0, 20 ) + '...'; }

                            $scope.Schedule[i].text = $scope.TimeToText( $scope.GetTimeFromDate( $scope.Schedule[i].begin ), true ) + ' | ' + Title + ' - ' + Author; }

                        $scope.UpdatePlaylistControls(); }

                    if ( response.data.settings.timestamp > $scope.Synchronization.settings ) {

                        $scope.SettingsBuffer.hold = true;

                        $scope.Settings = response.data.settings.data;
                        $scope.Synchronization.settings = response.data.settings.timestamp;

                        $scope.SettingsBuffer.playlist_designer_launch_time = $scope.TimeToText( $scope.Settings.playlist_designer_launch_time,true ); }

                    $scope.SynchronizeToolbar();

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

    $scope.SynchronizeToolbar = function ( ) {

        $scope.ToolbarText = 'Życie jest lepsze z muzyką!'; // EN: Life's better with music!

        if ( $scope.Audio.playing ) {

            for ( var i = 0; i < $scope.Catalog.length; i++ ) {

                if ( $scope.Catalog[i].id == $scope.Audio.track ) {

                    $scope.ToolbarText = $scope.Catalog[i].title + ' | ' + $scope.Catalog[i].author + ' - ' + $scope.Catalog[i].album;

                    break; } } }

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

                    $interval( $scope.Synchronize, $scope.Settings.synchronization_delay ); }

                $scope.Catalog.sort(

                    function ( a, b ) {

                        if ( a.author < b.author ) {

                            return -1; }

                        if ( a.author > b.author ) {

                            return 1; }

                        if ( a.album < b.album ) {

                            return -1; }

                        if ( a.album > b.album ) {

                            return 1; }

                        if ( a.title < b.title ) {

                            return -1; }

                        if ( a.title > b.title ) {

                            return 1; }

                        return 0; } );

                $scope.SearchInCatalog();

                if ( PlaylistReady ) {

                    for ( var i = 0; i < $scope.Schedule.length; i++ ) {

                        var Title = '';
                        var Album = '';
                        var Author = '';

                        for ( var j = 0; j < $scope.Catalog.length; j++ ) {

                            if ( $scope.Catalog[j].id == $scope.Schedule[i].track ) {

                                Title = $scope.Catalog[j].title;
                                Album = $scope.Catalog[j].album;
                                Author = $scope.Catalog[j].author;

                                break; } }

                        $scope.Schedule[i].title = Title;
                        $scope.Schedule[i].album = Album;
                        $scope.Schedule[i].author = Author;

                        if ( Title.length > 23 ) {

                            Title = Title.substr( 0, 20 ) + '...'; }

                        if ( Author.length > 23 ) {

                            Author = Author.substr( 0, 20 ) + '...'; }

                        $scope.Schedule[i].text = $scope.TimeToText( $scope.GetTimeFromDate( $scope.Schedule[i].begin ), true ) + ' | ' + Title + ' - ' + Author; } }

                },

            function ( response ) {

                console.log( "ERROR #" + response.status + " IN SETUP: " + response.data );

                // TODO: ERROR MESSAGE

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

                    $interval( $scope.Synchronize, $scope.Settings.synchronization_delay ); }

                $scope.InitPlaylistControls();

                if ( LibraryReady ) {

                    for ( var i = 0; i < $scope.Schedule.length; i++ ) {

                        var Title = '';
                        var Album = '';
                        var Author = '';

                        for ( var j = 0; j < $scope.Catalog.length; j++ ) {

                            if ( $scope.Catalog[j].id == $scope.Schedule[i].track ) {

                                Title = $scope.Catalog[j].title;
                                Album = $scope.Catalog[j].album;
                                Author = $scope.Catalog[j].author;

                                break; } }

                        $scope.Schedule[i].title = Title;
                        $scope.Schedule[i].album = Album;
                        $scope.Schedule[i].author = Author;

                        if ( Title.length > 23 ) {

                            Title = Title.substr( 0, 20 ) + '...'; }

                        if ( Author.length > 23 ) {

                            Author = Author.substr( 0, 20 ) + '...'; }

                        $scope.Schedule[i].text = $scope.TimeToText( $scope.GetTimeFromDate( $scope.Schedule[i].begin ), true ) + ' | ' + Title + ' - ' + Author; } }

                },

            function ( response ) {

                console.log( "ERROR #" + response.status + " IN SETUP: " + response.data );

                // TODO: ERROR MESSAGE

                }

            );

        $http.get( '/state' ).then(

            function ( response ) {

                $scope.SettingsBuffer.hold = true;

                $scope.Settings = response.data.settings;
                $scope.Synchronization.settings = response.data.timestamp;

                $scope.SettingsBuffer.playlist_designer_launch_time = $scope.TimeToText( $scope.Settings.playlist_designer_launch_time,true );

                SettingsReady = true;

                if ( LibraryReady && PlaylistReady ) {

                    $scope.ContentReady = true;

                    $interval( $scope.Synchronize, $scope.Settings.synchronization_delay ); }

                },

            function ( response ) {

                console.log( "ERROR #" + response.status + " IN SETUP: " + response.data );

                // TODO: ERROR MESSAGE

                }

            );

        };

    $scope.$watch( function ( ) { return $mdMedia('gt-sm'); }, function( DesktopMode ) {

        $scope.MobileMode = !DesktopMode;

        } );

    $scope.$watch( function ( ) { return $scope.PlaylistControls.Values; }, function ( ) {

        $scope.UpdatePlaylistControls();

        }, true );

    $scope.$watch( function ( ) { return $scope.SettingsBuffer.playlist_designer_launch_time }, function( ) {

        if ( typeof ( $scope.Settings.playlist_designer_launch_time ) == 'undefined' ) {

            return; }

        var Input = $scope.SettingsBuffer.playlist_designer_launch_time;

        if ( typeof ( Input ) == 'undefined' ) {

            return; }

        if ( Input == '' ) {

            return; }

        var Delta = 0;

        if ( Input.length == 7 ) {

            Delta = 1; }

        var Hours = parseInt( Input.substr( 0, 2 - Delta ) );
        var Minutes = parseInt( Input.substr( 3 - Delta, 2 ) );
        var Seconds = parseInt( Input.substr( 6 - Delta, 2 ) );

        var Output = Hours * 3600 + Minutes * 60 + Seconds;

        if ( Output == $scope.Settings.playlist_designer_launch_time ) {

            return; }

        $scope.Settings.playlist_designer_launch_time = Output;

        } );

    $scope.$watch( function ( ) { return $scope.Settings; }, function ( ) {

        if ( angular.equals( $scope.Settings, {} ) ) {

            return; }

        if ( $scope.SettingsBuffer.hold ) {

            $scope.SettingsBuffer.hold = false;

            return; }

        $http.post( '/state', {

            settings: $scope.Settings

            } ).then(

                function ( response ) {

                    // NOTHING

                    },

                function ( response ) {

                    console.log( "ERROR #" + response.status + " IN SYNCHRONIZE: " + response.data );

                    }

                );

        }, true );

    } ] ).config( function( $mdThemingProvider ) {

        $mdThemingProvider.theme('default')
            .primaryPalette('indigo')
            .accentPalette('red');

        } );

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

        volume: 0,
        rate: 0

        };

    $scope.TimeToText = function ( time, force_hours ) {

        var Text = '';

        if ( time > 3600 || force_hours === true ) {

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
                $scope.Track.volume = response.data.volume;
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

function EditTimeIntervalsController ( $scope, $mdDialog, $mdMedia, intervals ) {

    $scope.$mdMedia = $mdMedia;

    $scope.Selected = intervals.length;
    $scope.Days = [ false, false, false, false, false, false, false ];
    $scope.Begin = '00:00:00';
    $scope.End = '00:00:00';

    $scope.Intervals = intervals;

    $scope.TimeToText = function ( time, force_hours ) {

        var Text = '';

        if ( time > 3600 || force_hours === true ) {

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

    $scope.Validate = function ( ) {

        var Days = false;

        for ( var i = 0; i < 7; i++ ) {

            if ( $scope.Days[i] == true ) {

                Days = true;

                break; } }

        if ( !Days ) {

            return false; }

        if ( $scope.Begin.length == 0 || $scope.End.length == 0 ) {

            return false; }

        if ( $scope.Begin.length == $scope.End.length && $scope.Begin >= $scope.End ) {

            return false; }

        if ( $scope.Begin.length > $scope.End.length && $scope.Begin >= ( '0' + $scope.End ) ) {

            return false; }

        if ( $scope.Begin.length < $scope.End.length && ( '0' + $scope.Begin ) >= $scope.End ) {

            return false; }

        return true;

        };

    $scope.SelectTimeInterval = function ( ) {

        if ( $scope.Selected != $scope.Intervals.length ) {

            $scope.Days = [];

            for ( var i = 0; i < $scope.Intervals[ $scope.Selected ].days.length; i++ ) {

                $scope.Days.push( $scope.Intervals[ $scope.Selected ].days[i] ); }

            $scope.Begin = $scope.TimeToText( $scope.Intervals[ $scope.Selected ].begin, true );
            $scope.End = $scope.TimeToText( $scope.Intervals[ $scope.Selected ].end, true ); }

        else {

            $scope.Days = [ false, false, false, false, false, false, false ];

            $scope.Begin = '00:00:00';
            $scope.End = '00:00:00'; }

        };

    $scope.CreateTimeInterval = function ( ) {

        var Interval = {

            days: [],
            begin: 0,
            end: 0,

            text: ''

            };

        var Delta = 0;

        if ( $scope.Begin.length == 7 ) {

            Delta = 1; }

        var BeginHours = parseInt( $scope.Begin.substr( 0, 2 - Delta ) );
        var BeginMinutes = parseInt( $scope.Begin.substr( 3 - Delta, 2 ) );
        var BeginSeconds = parseInt( $scope.Begin.substr( 6 - Delta, 2 ) );

        Interval.begin = BeginHours * 3600 + BeginMinutes * 60 + BeginSeconds;
        Interval.text = Delta > 0 ? '0' + $scope.Begin : $scope.Begin;

        Delta = 0;

        if ( $scope.End.length == 7 ) {

            Delta = 1; }

        var EndHours = parseInt( $scope.End.substr( 0, 2 - Delta ) );
        var EndMinutes = parseInt( $scope.End.substr( 3 - Delta, 2 ) );
        var EndSeconds = parseInt( $scope.End.substr( 6 - Delta, 2 ) );

        Interval.end = EndHours * 3600 + EndMinutes * 60 + EndSeconds;
        Interval.text = Interval.text + ' - ' + ( Delta > 0 ? '0' + $scope.End : $scope.End );

        Interval.days = $scope.Days;

        if ( Interval.days[0] ) {

            Interval.text = 'Nd, ' + Interval.text; }

        if ( Interval.days[6] ) {

            Interval.text = 'Sob, ' + Interval.text; }

        if ( Interval.days[5] ) {

            Interval.text = 'Pt, ' + Interval.text; }

        if ( Interval.days[4] ) {

            Interval.text = 'Czw, ' + Interval.text; }

        if ( Interval.days[3] ) {

            Interval.text = 'Śr, ' + Interval.text; }

        if ( Interval.days[2] ) {

            Interval.text = 'Wt, ' + Interval.text; }

        if ( Interval.days[1] ) {

            Interval.text = 'Pon, ' + Interval.text; }

        $scope.Intervals.push(Interval);

        };

    $scope.UpdateTimeInterval = function ( ) {

        var Delta = 0;

        if ( $scope.Begin.length == 7 ) {

            Delta = 1; }

        var BeginHours = parseInt( $scope.Begin.substr( 0, 2 - Delta ) );
        var BeginMinutes = parseInt( $scope.Begin.substr( 3 - Delta, 2 ) );
        var BeginSeconds = parseInt( $scope.Begin.substr( 6 - Delta, 2 ) );

        $scope.Intervals[ $scope.Selected ].begin = BeginHours * 3600 + BeginMinutes * 60 + BeginSeconds;
        $scope.Intervals[ $scope.Selected ].text = Delta > 0 ? '0' + $scope.Begin : $scope.Begin;

        Delta = 0;

        if ( $scope.End.length == 7 ) {

            Delta = 1; }

        var EndHours = parseInt( $scope.End.substr( 0, 2 - Delta ) );
        var EndMinutes = parseInt( $scope.End.substr( 3 - Delta, 2 ) );
        var EndSeconds = parseInt( $scope.End.substr( 6 - Delta, 2 ) );

        $scope.Intervals[ $scope.Selected ].end = EndHours * 3600 + EndMinutes * 60 + EndSeconds;
        $scope.Intervals[ $scope.Selected ].text = $scope.Intervals[ $scope.Selected ].text + ' - ' + ( Delta > 0 ? '0' + $scope.End : $scope.End );

        $scope.Intervals[ $scope.Selected ].days = $scope.Days;

        if ( $scope.Intervals[ $scope.Selected ].days[0] ) {

            $scope.Intervals[ $scope.Selected ].text = 'Nd, ' + $scope.Intervals[ $scope.Selected ].text; }

        if ( $scope.Intervals[ $scope.Selected ].days[6] ) {

            $scope.Intervals[ $scope.Selected ].text = 'Sob, ' + $scope.Intervals[ $scope.Selected ].text; }

        if ( $scope.Intervals[ $scope.Selected ].days[5] ) {

            $scope.Intervals[ $scope.Selected ].text = 'Pt, ' + $scope.Intervals[ $scope.Selected ].text; }

        if ( $scope.Intervals[ $scope.Selected ].days[4] ) {

            $scope.Intervals[ $scope.Selected ].text = 'Czw, ' + $scope.Intervals[ $scope.Selected ].text; }

        if ( $scope.Intervals[ $scope.Selected ].days[3] ) {

            $scope.Intervals[ $scope.Selected ].text = 'Śr, ' + $scope.Intervals[ $scope.Selected ].text; }

        if ( $scope.Intervals[ $scope.Selected ].days[2] ) {

            $scope.Intervals[ $scope.Selected ].text = 'Wt, ' + $scope.Intervals[ $scope.Selected ].text; }

        if ( $scope.Intervals[ $scope.Selected ].days[1] ) {

            $scope.Intervals[ $scope.Selected ].text = 'Pon, ' + $scope.Intervals[ $scope.Selected ].text; }

        };

    $scope.DeleteTimeInterval = function ( ) {

        $scope.Intervals.splice( $scope.Selected, 1 );

        };

    $scope.hide = function ( ) {

        $mdDialog.hide();

        };

    $scope.cancel = function ( ) {

        $mdDialog.cancel();

        };

    }
