var express = require('express');
var router = express.Router();

var player = require('play-sound')(opts={});

var db = require('../db.js'); // PLT-XXX-XXX
var auth = require('../auth.js');

router.get( '/', function( req, res ) {

    if ( !auth.validate(req) ) {

        res.status(401).send('Unauthorized'); return; }

    var Audio = db.dread( 'PLT-AUDIO' );

    if ( !Audio.valid ) {

        console.log('Audio stream is inaccessible!'); return; }

    var Schedule = db.sread( 'PLT-SCHEDULE' );

    if ( !Schedule.valid ) {

        console.log('Playlist schedule is inaccessible!'); return; }

    res.json( { audio: { playing: Audio.obj.playing, track: Audio.obj.track }, schedule: Schedule.obj.schedule } );

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

    var Audio = db.dread( 'PLT-AUDIO' );

    if ( !Audio.valid ) {

        res.status(400).send('Audio stream is inaccessible!'); return; }

    if ( Audio.obj.playing ) {

        Audio.obj.stream.kill(); }

    Audio.obj.stream = player.play( 'tracks/' + Track.obj.path, { mplayer: [ '-ss', Track.obj.begin, '-really-quiet' ] }, function( err ) {

        if ( err && !err.killed ) {

            var Audio = db.dread( 'PLT-AUDIO' );

            if ( !Audio.valid ) {

                Audio.obj.playing = false;
                Audio.obj.track = '';

                db.dwrite( 'PLT-AUDIO', Audio.obj ); }

            throw err; }

        } );

    Audio.obj.playing = true;
    Audio.obj.track = Track.obj.id;

    db.dwrite( 'PLT-AUDIO', Audio.obj );
    clearTimeout( req.app.locals.PlaylistManagerTimeout );

    req.app.locals.PlaylistManagerTimeout = setTimeout( function ( ) {

        var Audio = db.dread( 'PLT-AUDIO' );

        if ( Audio.valid ) {

            Audio.obj.stream.kill();

            Audio.obj.playing = false;
            Audio.obj.track = '';

            db.dwrite( 'PLT-AUDIO', Audio.obj ); }

        req.app.locals.PlaylistManager( req.app, db );

        }, ( Track.obj.end - Track.obj.begin ) * 1000 );

    res.send('Done');

    } );

router.post( '/stop', function( req, res ) {

    if ( !auth.validate(req) ) {

        res.status(401).send('Unauthorized'); return; }

    var Audio = db.dread( 'PLT-AUDIO' );

    if ( !Audio.valid ) {

        res.status(400).send('Audio stream is inaccessible!'); return; }

    if ( Audio.obj.playing ) {

        Audio.obj.stream.kill();

        Audio.obj.playing = false;
        Audio.obj.track = '';

        db.dwrite( 'PLT-AUDIO', Audio.obj ); }

    req.app.locals.PlaylistManager( req.app, db );

    res.send('Done');

    } );

module.exports = router;
