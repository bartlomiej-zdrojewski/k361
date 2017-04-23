var express = require('express');
var path = require('path');
var http = require('http');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var player = require('play-sound')(opts={});

var LoginRoute = require('./routes/login.js');
var LogoutRoute = require('./routes/logout.js');
var LibraryRoute = require('./routes/library.js');
var PlaylistRoute = require('./routes/playlist.js');
var StateRoute = require('./routes/state.js');

var app = express();
var config = require('./config.js');
var db = require('./db.js'); db.init();

app.locals.GetAudioAccessPermission = function ( db ) { // TODO: TEST

    var Settings = db.sread( 'STE-SETTINGS' );

    if ( !Settings.valid ) {

        return 0; }

    var Now = new Date();
    var Today = Now.getDay();
    var Time = Now.getHours() * 3600 + Now.getMinutes() * 60 + Now.getSeconds();

    for ( var i = 0; i < Settings.obj.settings.reserved_time_intervals.length; i++ ) {

        var DayMatch = false;

        for ( var j = 0; j < Settings.obj.settings.reserved_time_intervals.days.length; j++ ) {

            if ( Settings.obj.settings.reserved_time_intervals[i].days[j] == Today ) {

                DayMatch = true;

                break; } }

        if ( !DayMatch ) {

            continue; }

        if ( Settings.obj.settings.reserved_time_intervals[i].begin <= Time && Settings.obj.settings.reserved_time_intervals[i].end >= Time ) {

            return ( Settings.obj.settings.reserved_time_intervals[i].end - Time ); } }

    return 0;

    };

app.locals.AudioAccessWatchman = function ( app, db ) { // TODO: TEST

    clearTimeout( app.locals.AudioAccessWatchmanTimeout );
    app.locals.AudioAccessWatchmanTimeout = setTimeout( function ( ) { app.locals.AudioAccessWatchman( app, db ); }, 1000 );

    var Audio = db.dread( 'PLT-AUDIO' );

    if ( !Audio.valid ) {

        return; }

    if ( Audio.obj.playing ) {

        if ( app.locals.GetAudioAccessPermission( db ) ) {

            Audio.obj.stream.kill();

            Audio.obj.playing = false;
            Audio.obj.track = '';

            db.dwrite( 'PLT-AUDIO', Audio.obj );

            clearTimeout( app.locals.PlaylistManagerTimeout );
            app.locals.PlaylistManagerTimeout = setTimeout( function ( ) { app.locals.PlaylistManager( app, db, player ); }, app.locals.GetAudioAccessPermission( db ) ); } }

    };

app.locals.PlaylistManager = function ( app, db, player ) {

    clearTimeout( app.locals.PlaylistManagerTimeout );

    var Audio = db.dread( 'PLT-AUDIO' );

    if ( !Audio.valid ) {

        db.dwrite( 'PLT-AUDIO', { stream: {}, playing: false, track: '' } );

        Audio.obj = { stream: {}, playing: false, track: '' }; }

    var Schedule = db.sread( 'PLT-SCHEDULE' );

    if ( !Schedule.valid ) {

        console.log('Resetting playlist schedule');

        Schedule.valid = true;
        Schedule.obj = { schedule: [], timestamp: Date.now() };

        db.swrite( 'PLT-SCHEDULE', Schedule.obj ); }

    if ( Schedule.obj.schedule.length > 0 ) {

        var Now = Date.now();
        var Next = -1;
        var Current = -1;

        var l = 0;
        var r = Schedule.obj.schedule.length - 1;

        while ( l < r ) {

            var m = Math.floor( ( l + r ) / 2 );

            if ( Schedule.obj.schedule[m].begin < Now ) {

                l = m + 1; }

            else {

                r = m - 1; } }

        if ( l > 0 || ( l == 0 && Schedule.obj.schedule[l].begin < Now ) ) {

            if ( Schedule.obj.schedule[l].begin > Now ) {

                l--; }

            if ( Schedule.obj.schedule[r].begin < Now ) {

                r++; }

            Next = r;

            if ( Schedule.obj.schedule[l].end >= Now ) {

                Next = l + 1;
                Current = l; }

            else if ( r < Schedule.obj.schedule.length ) {

                if ( Schedule.obj.schedule[r].begin <= Now ) {

                    Next = r + 1;
                    Current = r; } } }

        else {

            Next = 0;

            if ( Schedule.obj.schedule[0].begin <= Now ) {

                Next = 1;
                Current = 0; } }

        if ( Current >= 0 ) {

            var Track = db.sread( 'LIB-TRACK-' + Schedule.obj.schedule[Current].track );

            if ( Track.valid && Track.obj.state == 'READY' ) {

                Audio.obj.stream = player.play( 'tracks/' + Track.obj.path, { mplayer: [ '-ss', ( Track.obj.begin + Math.floor( ( Now - Schedule.obj.schedule[Current].begin ) / 1000 ) ), '−volume', Track.obj.volume, '-really-quiet' ] }, function( err ) {

                    if ( err && !err.killed ) {

                        var Audio = db.dread( 'PLT-AUDIO' );

                        if ( !Audio.valid ) {

                            Audio.obj.playing = false;
                            Audio.obj.track = '';

                            db.dwrite( 'PLT-AUDIO', Audio.obj ); }

                        console.log( 'While playing track an error occurred: ' + err ); }

                    } );

                Audio.obj.playing = true;
                Audio.obj.track = Track.obj.id;
                Track.obj.views = Track.obj.views + 1;

                db.dwrite( 'PLT-AUDIO', Audio.obj );
                db.swrite( 'LIB-TRACK-' + Track.obj.id, Track.obj );

                app.locals.PlaylistManagerTimeout = setTimeout( function ( ) {

                    var Audio = db.dread( 'PLT-AUDIO' );

                    if ( Audio.valid ) {

                        Audio.obj.stream.kill();

                        Audio.obj.playing = false;
                        Audio.obj.track = '';

                        db.dwrite( 'PLT-AUDIO', Audio.obj ); }

                    app.locals.PlaylistManager( app, db, player );

                    }, Schedule.obj.schedule[Current].end - Now );

                app.locals.AudioAccessWatchman( app, db );

                }

            else {

                app.locals.PlaylistManagerTimeout = setTimeout( function ( ) { app.locals.PlaylistManager( app, db, player ); }, Schedule.obj.schedule[Next].begin - Now ); } }

        else if ( Next >= 0 && Next < Schedule.obj.schedule.length ) {

            app.locals.PlaylistManagerTimeout = setTimeout( function ( ) { app.locals.PlaylistManager( app, db, player ); }, Schedule.obj.schedule[Next].begin - Now ); } }

    };

app.locals.PlaylistDesigner = function ( app, db ) {

    clearTimeout( app.locals.PlaylistDesignerTimeout );

    var Settings = db.sread( 'STE-SETTINGS' );

    if ( !Settings.valid ) {

        app.locals.PlaylistDesignerTimeout = setTimeout( function ( ) { app.locals.PlaylistDesigner( app, db ); }, 1000 );

        return; }

    // TODO: PLAYLIST DESIGNER

    var Now = new Date();
    var TimeoutDelay = 1000 * ( Now.getHours() * 3600 + Now.getMinutes() * 60 + Now.getSeconds() - Settings.obj.settings.playlist_designer_launch_time );

    if ( TimeoutDelay < 0 ) {

        TimeoutDelay = TimeoutDelay + 86400000; }

    app.locals.PlaylistDesignerTimeout = setTimeout( function ( ) { app.locals.PlaylistDesigner( app, db ); }, TimeoutDelay );

    };

app.locals.AudioAccessWatchmanTimeout = setTimeout( function ( ) { app.locals.AudioAccessWatchman( app, db ); }, 0 );
app.locals.PlaylistManagerTimeout = setTimeout( function ( ) { app.locals.PlaylistManager( app, db, player ); }, 0 );
app.locals.PlaylistDesignerTimeout = setTimeout( function ( ) { app.locals.PlaylistDesigner( app, db ); }, 0 );

//app.use( favicon( path.join( __dirname, 'public', 'favicon.ico' ) ) );
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded( { extended: true } ) );
app.use( cookieParser() );
app.use( express.static( path.join( __dirname, 'public' ) ) );

app.use( '/login', LoginRoute );
app.use( '/logout', LogoutRoute );
app.use( '/state', StateRoute );
app.use( '/library', LibraryRoute );
app.use( '/playlist', PlaylistRoute );

app.use( function( req, res, next ) {

    var err = new Error('Not Found');
    err.status = 404;

    next(err);

    } );

app.use( function( err, req, res, next ) {

    res.status( err.status || 500 );

    switch ( err.status ) {

        case 404 : res.sendFile( path.join( __dirname, 'public', '404.html' ) ); break;
        case 500 : res.sendFile( path.join( __dirname, 'public', '500.html' ) ); break;

        default : res.sendFile( path.join( __dirname, 'public', '500.html' ) ); }

    } );

var server = http.createServer(app);

server.listen( config.port );
server.on( 'error', onError );
server.on( 'listening', onListening );

function onError ( error ) {

    if ( error.syscall !== 'listen' ) {

        throw error; }

    var bind = typeof config.port === 'string' ? 'Pipe ' + config.port : 'Port ' + config.port;

    switch ( error.code ) {

        case 'EACCES':

            console.error( bind + ' requires elevated privileges!' );
            process.exit(1);

            break;

        case 'EADDRINUSE':

            console.error( bind + ' is already in use!' );
            process.exit(1);

            break;

        default: throw error; } }

function onListening ( ) {

    var addr = server.address();
    var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;

    console.log( 'Listening on ' + bind ); }

module.exports = app;
