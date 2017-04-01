var express = require('express');
var router = express.Router();

var fs = require('fs');

var db = require('../db.js');
var auth = require('../auth.js');

router.get( '/', function( req, res ) {

    if ( !auth.validate(req) ) {

        res.status(401).send('Unauthorized'); return; }

    var Catalog = db.sread('LIB-CATALOG');

    if ( Catalog.valid ) {

        for ( var i = 0; i < Catalog.obj.tracks.length; i++ ) {

            var Track = db.sread('LIB-TRACK-' + Catalog.obj.tracks[i]);

            if ( Track.valid ) {

                fs.unlink( '../tracks/' + Track.obj.path ); } } }

    db.reset();
    db.swrite( 'ATH-PASSWORD', { data: '', time: Date.now() } );
    db.swrite( 'LIB-CATALOG', { catalog: [], tracks: [] } );

    res.send('Done');

    } );

module.exports = router;
