var express = require('express');
var router = express.Router();

var fs = require('fs');

var db = require('../db.js');
var auth = require('../auth.js');

router.get( '/', function( req, res ) {

    if ( !auth.validate(req) ) {

        res.status(401).send('Unauthorized'); return; }

    console.log('Resetting the entire server');

    var Audio = db.dread( 'PLT-AUDIO' );

    if ( Audio.valid ) {

        if ( Audio.obj.playing ) {

            Audio.obj.stream.kill(); } }

    var Catalog = db.sread('LIB-CATALOG');

    if ( Catalog.valid ) {

        for ( var i = 0; i < Catalog.obj.tracks.length; i++ ) {

            var Track = db.sread('LIB-TRACK-' + Catalog.obj.tracks[i]);

            if ( Track.valid ) {

                if ( fs.existsSync( 'tracks/' + Track.obj.path ) ) {

                    setTimeout( function ( ) {

                        fs.unlink( 'tracks/' + Track.obj.path , function ( err ) {

                            if ( err ) {

                                console.log( 'While deleting file \'tracks/' + Track.obj.path + '\' an error occurred: ' + err ); }

                            } ) },

                        250 ); } } } }

    db.reset();
    req.app.locals.PlaylistManager( req.app, db );

    res.sendStatus(200);

    } );

module.exports = router;
