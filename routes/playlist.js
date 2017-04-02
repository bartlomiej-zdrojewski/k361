var express = require('express');
var router = express.Router();

var player = require('play-sound')(opts={});

var db = require('../db.js'); // PLT-XXX-XXX
var auth = require('../auth.js');

router.get( '/', function( req, res ) {

    if ( !auth.validate(req) ) {

        res.status(401).send('Unauthorized'); return; }

    // ...

    res.json( {} );

    } );

router.post( '/play', function( req, res ) {

    if ( !auth.validate(req) ) {

        res.status(401).send('Unauthorized'); return; }

    var Track = db.sread( 'LIB-TRACK-' + req.body.id );

    if ( !Track.valid ) {

        res.status(400).send('Track has not been found.'); return; }

    if ( Track.obj.state === 'ERROR' ) {

        res.status(400).send('Track is corrupted.'); return; }

    else if ( Track.obj.state === 'REMOVED' ) {

        res.status(400).send('Track was removed.'); return; }

    else if ( Track.obj.state !== 'READY' ) {

        res.status(400).send('Track is not ready.'); return; }

    if ( req.app.locals.AudioPlaying ) {

        req.app.locals.AudioStream.kill(); }

    req.app.locals.AudioStream = player.play( 'tracks/' + Track.obj.path, { mplayer: [ '-ss', Track.obj.begin, '-really-quiet' ] }, function( err ) {

        if ( err && !err.killed ) {

            req.app.locals.AudioPlaying = false;

            throw err; }

        } );

    req.app.locals.AudioPlaying = true;

    res.send('Done');

    } );

router.get( '/stop', function( req, res ) {

    if ( !auth.validate(req) ) {

        res.status(401).send('Unauthorized'); return; }

    if ( req.app.locals.AudioPlaying ) {

        req.app.locals.AudioStream.kill();
        req.app.locals.AudioPlaying = false; }

    res.send('Done');

    } );

module.exports = router;
