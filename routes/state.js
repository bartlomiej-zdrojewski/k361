var express = require('express');
var router = express.Router();

var db = require('../db.js'); // STE-XXX-XXX
var auth = require('../auth.js');
var config = require('../config.js');

router.get( '/', function( req, res ) {

    if ( !auth.validate(req) ) {

        res.status(401).send('Unauthorized'); return; }

    // SETTINGS

    var Response = {

        settings: {

            SynchronizationDelay: config.synchronization_delay

            },

        timestamp: 0

        };

    res.json( Response );

    } );

router.post( '/synchronize', function( req, res ) { // { catalog: DATE, schedule: DATE, settings: DATE }

    if ( !auth.validate(req) ) {

        res.status(401).send('Unauthorized'); return; }

    var Audio = db.dread( 'PLT-AUDIO' );

    if ( !Audio.valid ) {

        res.status(400).send('Audio stream is inaccessible!'); return; }

    var Catalog = db.sread('LIB-CATALOG');

    if ( !Catalog.valid ) {

        res.status(500).send('Library catalog is inaccessible!'); return; }

    var Schedule = db.sread( 'PLT-SCHEDULE' );

    if ( !Schedule.valid ) {

        console.log('Playlist schedule is inaccessible!'); return; }
/*
    var Settings = db.sread( 'STE-SETTINGS' );

    if ( !Settings.valid ) {

        console.log('Settings are inaccessible!'); return; }
*/
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

            timestamp: 0, //Settings.obj.timestamp,
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
/*
    if ( Settings.obj.timestamp > req.body.settings ) {

        Response.settings.data = Settings.obj.settings; }
*/
    res.json( Response );

    } );

module.exports = router;
