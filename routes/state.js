var express = require('express');
var router = express.Router();

var db = require('../db.js'); // STE-XXX-XXX
var auth = require('../auth.js');

router.get( '/', function( req, res ) {

    if ( !auth.validate(req) ) {

        res.status(401).send('Unauthorized'); return; }

    // ...

    res.json( {} );

    } );

router.get( '/synchronize', function( req, res ) {

    if ( !auth.validate(req) ) {

        res.status(401).send('Unauthorized'); return; }

    var Audio = db.dread( 'PLT-AUDIO' );

    if ( !Audio.valid ) {

        res.status(400).send('Audio stream is inaccessible!'); return; }

    var Response = {

        update: {

            catalog: false, // TODO: TIMESTAMPS
            schedule: false, // TODO: TIMESTAMPS

            },

        catalog: [],
        schedule: [],

        audio: {

            playing: Audio.obj.playing,
            track: Audio.obj.track

            }

        };

    res.json( Response );

    } );

module.exports = router;
