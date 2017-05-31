var express = require('express');
var router = express.Router();

var fs = require('fs');
var player = require('play-sound')(opts={});

var db = require('../db.js'); // STE-XXX-XXX
var auth = require('../auth.js');
var config = require('../config.js');

router.get( '/', function( req, res ) {

    if ( !auth.validate(req) ) {

        res.status(401).send('Unauthorized'); return; }

    var Settings = db.sread('STE-SETTINGS');

    if ( !Settings.valid ) {

        res.status(500).send('Settings are inaccessible!'); return; }

    res.json( { settings: Settings.obj.settings, timestamp: Settings.obj.timestamp } );

    } );

router.post( '/', function( req, res ) { // { settings: OBJECT }

    if ( !auth.validate(req) ) {

        res.status(401).send('Unauthorized'); return; }

    var Settings = db.sread('STE-SETTINGS');

    if ( !Settings.valid ) {

        res.status(500).send('Settings are inaccessible!'); return; }

    if ( typeof( req.body.settings.playlist_designer ) == 'boolean' ) {

        Settings.obj.settings.playlist_designer = req.body.settings.playlist_designer; }

    if ( typeof( req.body.settings.playlist_designer_launch_time ) == 'number' ) {

        Settings.obj.settings.playlist_designer_launch_time = req.body.settings.playlist_designer_launch_time; }

    if ( typeof( req.body.settings.playlist_designer_time_intervals ) == 'object' ) {

        Settings.obj.settings.playlist_designer_time_intervals = req.body.settings.playlist_designer_time_intervals; }

    if ( typeof( req.body.settings.reserved_time_intervals ) == 'object' ) {

        Settings.obj.settings.reserved_time_intervals = req.body.settings.reserved_time_intervals; }

    if ( typeof( req.body.settings.synchronization_delay ) == 'number' ) {

        Settings.obj.settings.synchronization_delay = req.body.settings.synchronization_delay; }

    if ( Settings.obj.settings.playlist_designer_launch_time < 0 ) {

        Settings.obj.settings.playlist_designer_launch_time = 0; }

    if ( Settings.obj.settings.playlist_designer_launch_time > 86399 ) {

        Settings.obj.settings.playlist_designer_launch_time = 86399; }

    // TODO: CHECK playlist_designer_time_intervals AND reserved_time_intervals

    if ( Settings.obj.settings.synchronization_delay < 100 ) {

        Settings.obj.settings.synchronization_delay = 100; }

    if ( Settings.obj.settings.synchronization_delay > 5000 ) {

        Settings.obj.settings.synchronization_delay = 5000; }

    Settings.obj.timestamp = Date.now();

    db.swrite( 'STE-SETTINGS', Settings.obj );

    var Audio = db.dread( 'PLT-AUDIO' );

    if ( Audio.valid ) {

        if ( !Audio.obj.playing ) {

            req.app.locals.PlaylistManager( req.app, db, player ); } }

    res.sendStatus(200);

    } );

router.post( '/synchronize', function( req, res ) { // { catalog: DATE, schedule: DATE, settings: DATE }

    if ( !auth.validate(req) ) {

        res.status(401).send('Unauthorized'); return; }

    var Audio = db.dread('PLT-AUDIO');

    if ( !Audio.valid ) {

        res.status(500).send('Audio stream is inaccessible!'); return; }

    var Catalog = db.sread('LIB-CATALOG');

    if ( !Catalog.valid ) {

        res.status(500).send('Library catalog is inaccessible!'); return; }

    var Schedule = db.sread('PLT-SCHEDULE');

    if ( !Schedule.valid ) {

        res.status(500).send('Playlist schedule is inaccessible!'); return; }

    var Settings = db.sread('STE-SETTINGS');

    if ( !Settings.valid ) {

        res.status(500).send('Settings are inaccessible!'); return; }

    var Response = {

        audio: {

            playing: Audio.obj.playing,
            track: Audio.obj.track

            },

        catalog: {

            timestamp: Catalog.obj.timestamp,

            updated: [],
            removed: []

            },

        schedule: {

            timestamp: Schedule.obj.timestamp,
            data: []

            },

        settings: {

            timestamp: Settings.obj.timestamp,
            data: []

            }

        };

    if ( Catalog.obj.timestamp > req.body.catalog ) {

        for ( var i = 0; i < Catalog.obj.catalog.length; i++ ) {

            if ( Catalog.obj.catalog[i].timestamp > req.body.catalog ) {

                Response.catalog.updated.push( Catalog.obj.catalog[i] ); } }

        for ( var i = 0; i < Catalog.obj.tracks.length; i++ ) {

            var Track = db.sread( 'LIB-TRACK-' + Catalog.obj.tracks[i] );

            if ( Track.valid ) {

                if ( Track.obj.state === 'REMOVED' ) {

                    Response.catalog.removed.push( Track.obj ); } } } }

    if ( Schedule.obj.timestamp > req.body.schedule ) {

        Response.schedule.data = Schedule.obj.schedule; }

    if ( Settings.obj.timestamp > req.body.settings ) {

        Response.settings.data = Settings.obj.settings; }

    res.json( Response );

    } );

router.get( '/password', function( req, res ) {

    var Password = db.sread('ATH-PASSWORD');

    if ( !Password.valid ) {

        res.status(500).send('Password is inaccessible!'); return; }

    if ( Password.obj.password == '' ) {

        res.json( { available: false } ); }

    else {

        res.json( { available: true } ); }

    } );

router.post( '/password', function( req, res ) { // { old_password: STRING, new_password: STRING }

    var Password = db.sread('ATH-PASSWORD');

    if ( !Password.valid ) {

        res.status(500).send('Password is inaccessible!'); return; }

    if ( typeof ( req.body.new_password ) != 'string' ) {

        res.status(401).send('Password type other than string is not allowed.'); return; }

    if ( req.body.new_password.length == 0 ) {

        res.status(401).send('Password length must be greater than zero.'); return; }

    if ( Password.obj.password !== req.body.old_password ) {

        res.status(401).send('Passwords do not match.'); return; }

    Password.obj.password = req.body.new_password;

    db.swrite( 'ATH-PASSWORD', { password: Password.obj.password, timestamp: Date.now() } );

    res.sendStatus(200);

    } );

router.get( '/shutdown', function( req, res ) {

    if ( !auth.validate(req) ) {

        res.status(401).send('Unauthorized'); return; }

    var Audio = db.dread('PLT-AUDIO');

    if ( Audio.valid ) {

        if ( Audio.obj.playing ) {

            Audio.obj.stream.kill(); } }

    res.sendStatus(200);

    console.log('Terminating process by user\'s request');
    process.exit(2);

    } );

router.get( '/reset', function( req, res ) {

    if ( !auth.validate(req) ) {

        res.status(401).send('Unauthorized'); return; }

    console.log('Resetting entire server');

    var Audio = db.dread('PLT-AUDIO');

    if ( Audio.valid ) {

        if ( Audio.obj.playing ) {

            Audio.obj.stream.kill(); } }

    var Catalog = db.sread('LIB-CATALOG');

    if ( Catalog.valid ) {

        for ( var i = 0; i < Catalog.obj.tracks.length; i++ ) {

            var Track = db.sread( 'LIB-TRACK-' + Catalog.obj.tracks[i] );

            if ( Track.valid ) {

                if ( fs.existsSync( 'tracks/' + Track.obj.path ) ) {

                    setTimeout( function ( ) {

                            fs.unlink( 'tracks/' + Track.obj.path , function ( err ) {

                                if ( err ) {

                                    console.log( 'While deleting file \'tracks/' + Track.obj.path + '\' an error occurred: ' + err ); }

                            } ) },

                        250 ); } } } }

    db.reset();
    req.app.locals.PlaylistManager( req.app, db, player );

    res.sendStatus(200);

    } );

module.exports = router;
