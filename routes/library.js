var express = require('express');
var router = express.Router();

var fs = require('fs');
var shortid = require('shortid');
var youtube = require('youtube-mp3-downloader');
var youtubeInfo = require('youtube-info');

var db = require('../db.js'); // LIB-XXX-XXX
var auth = require('../auth.js');
var config = require('../config.js');

router.get( '/', function( req, res ) {

    if ( !auth.validate(req) ) {

        res.status(401).send('Unauthorized'); return; }

    var Catalog = db.sread('LIB-CATALOG');

    if ( !Catalog.valid ) {

        res.status(500).send('Library catalog is inaccessible!'); return; }

    res.json( Catalog.obj.catalog );

    } );

router.get( '/tracks', function( req, res ) {

    if ( !auth.validate(req) ) {

        res.status(401).send('Unauthorized'); return; }

    var Catalog = db.sread('LIB-CATALOG');

    if ( !Catalog.valid ) {

        res.status(500).send('Library catalog is inaccessible!'); return; }

    var Tracks = [];

    for ( var i = 0; i < Catalog.obj.tracks.length; i++ ) {

        var Track = db.sread( 'LIB-TRACK-' + Catalog.obj.tracks[i] );

        if ( Track.valid ) {

            Tracks.push( Track.obj ); } }

    res.json( Tracks );

    } );

router.get( '/track', function( req, res ) { // { id: STRING }

    if ( !auth.validate(req) ) {

        res.status(401).send('Unauthorized'); return; }

    var Track = db.sread( 'LIB-TRACK-' + req.query.id );

    if ( !Track.valid ) {

        res.status(400).send('Track has not been found.'); return; }

    res.json( Track.obj );

    } );

router.post( '/update', function( req, res ) { // { id: STRING, title: STRING, album: STRING, author: STRING, begin: NUMBER, end: NUMBER }

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

    if ( typeof( req.body.title ) !== 'undefined' ) {

        Track.obj.title = req.body.title; }

    if ( typeof( req.body.album ) !== 'undefined' ) {

        Track.obj.album = req.body.album; }

    if ( typeof( req.body.author ) !== 'undefined' ) {

        Track.obj.author = req.body.author; }

    if ( typeof( req.body.begin ) !== 'undefined' ) {

        Track.obj.begin = req.body.begin; }

    if ( typeof( req.body.end ) !== 'undefined' ) {

        Track.obj.begin = req.body.end; }

    var Catalog = db.sread('LIB-CATALOG');

    if ( !Catalog.valid ) {

        console.log('Library catalog is inaccessible!'); return; }
        
    for ( var i = 0; i < Catalog.obj.catalog.length; i++ ) {
        
        if ( Catalog.obj.catalog[i].id === Track.obj.id ) {

            Catalog.obj.catalog[i].title = Track.obj.title;
            Catalog.obj.catalog[i].album = Track.obj.album;
            Catalog.obj.catalog[i].author = Track.obj.author;
            Catalog.obj.catalog[i].length = Track.obj.end - Track.obj.begin;
            Catalog.obj.catalog[i].begin = Track.obj.begin;
            Catalog.obj.catalog[i].end = Track.obj.end;
            
            break; } }
        
    db.swrite( 'LIB-TRACK-' + Track.obj.id, Track.obj, function ( ) {

        db.swrite( 'LIB-CATALOG', Catalog.obj );

        } );
        
    res.send('Done');

    } );

router.post( '/upload', function( req, res ) {

    if ( !auth.validate(req) ) {

        res.status(401).send('Unauthorized'); return; }

    // TODO: UPLOAD TRACK

    } );

router.post( '/download', function( req, res ) { // { service: STRING, code: STRING }

    if ( !auth.validate(req) ) {

        res.status(401).send('Unauthorized'); return; }

    if ( req.body.service === 'YOUTUBE' ) {

        var Catalog = db.sread('LIB-CATALOG');

        if ( !Catalog.valid ) {

            console.log('Library catalog is inaccessible!'); return; }

        var Track = {

            id: shortid.generate(),

            title: '',
            album: '',
            author: '',

            length: 0,
            begin: 0,
            end: 0,

            path: '',
            state: 'DOWNLOAD'

            };

        Catalog.obj.tracks.push( Track.id );

        db.swrite( 'LIB-CATALOG', Catalog.obj );
        db.swrite( 'LIB-TRACK-' + Track.id, Track, function ( ) {

            var File = new youtube( {

                'ffmpegPath': config.ffmpeg_path,
                'outputPath': 'tracks',
                'youtubeVideoQuality': 'highest',
                'queueParallelism': 10,
                'progressTimeout': 5000

                } );

            File.download( req.body.code, Track.id + '.mp3' );

            File.on( 'finished', function( data ) {

                var Catalog = db.sread('LIB-CATALOG');

                if ( !Catalog.valid ) {

                    console.log('Library catalog is inaccessible!'); return; }

                youtubeInfo( req.body.code, function ( err, videoInfo ) {

                    Track.path = Track.id + '.mp3';
                    Track.state = 'READY';

                    if ( err ) {

                        Track.title = Track.id;
                        Track.album = 'Youtube';
                        Track.author = 'Unknown';
                        Track.length = 300;
                        Track.end = Track.length;

                        Catalog.obj.catalog.push( {

                            id: Track.id,
                            title: Track.title,
                            album: Track.album,
                            author: Track.author,
                            length: Track.length

                            } );

                        db.swrite( 'LIB-TRACK-' + Track.id, Track, function ( ) {

                            db.swrite( 'LIB-CATALOG', Catalog.obj );

                            } );

                        throw err; }

                    Track.title = videoInfo.title;
                    Track.album = 'Youtube';
                    Track.author = videoInfo.owner;
                    Track.length = videoInfo.duration;
                    Track.end = Track.length;

                    Catalog.obj.catalog.push( {

                        id: Track.id,
                        title: Track.title,
                        album: Track.album,
                        author: Track.author,
                        length: Track.length

                        } );

                    db.swrite( 'LIB-TRACK-' + Track.id, Track, function ( ) {

                        db.swrite( 'LIB-CATALOG', Catalog.obj );

                        } );

                    } );

                console.log( 'Track #' + Track.id + ' has been downloaded. It\'s now ready to use.' );

                } );

            File.on( 'error', function( error ) {

                Track.path = Track.id + '.mp3';
                Track.state = 'ERROR';

                db.swrite( 'LIB-TRACK-' + Track.id, Track );

                console.log( 'While downloading track #' + Track.id + ' error occurred: ' + error ); } );

            File.on( 'progress', function( progress ) {

                console.log( 'Downloading track ' + Track.id + ' - ' + progress.progress.percentage.toFixed(2) + '%' ); } );

            res.send( Track.id );

            } );

        }

    else {

        res.status(400).send('Unknown service'); }

    } );

router.post( '/remove', function( req, res ) { // { id: STRING }

    if ( !auth.validate(req) ) {

        res.status(401).send('Unauthorized'); return; }

    var Catalog = db.sread('LIB-CATALOG');

    if ( !Catalog.valid ) {

        res.status(500).send('Library catalog is inaccessible!'); return; }

    var Track = db.sread( 'LIB-TRACK-' + req.body.id );

    if ( !Track.valid ) {

        res.status(400).send('Track has not been found.'); return; }

    for ( var i = 0; i < Catalog.obj.catalog.length; i++ ) {

        if ( Catalog.obj.catalog[i].id === Track.obj.id ) {

            Track.obj.state = 'REMOVED';
            Catalog.obj.catalog.splice( i, 1 ); } }

    db.swrite( 'LIB-TRACK-' + Track.obj.id, Track.obj, function ( ) {

        db.swrite( 'LIB-CATALOG', Catalog.obj );

        } );

    res.send('Done');

    } );

router.post( '/restore', function( req, res ) { // { id: STRING }

    if ( !auth.validate(req) ) {

        res.status(401).send('Unauthorized'); return; }

    var Catalog = db.sread('LIB-CATALOG');

    if ( !Catalog.valid ) {

        res.status(500).send('Library catalog is inaccessible!'); return; }

    var Track = db.sread( 'LIB-TRACK-' + req.body.id );

    if ( !Track.valid ) {

        res.status(400).send('Track has not been found.'); return; }
        
    if ( Track.obj.state !== 'REMOVED' ) {

        res.status(400).send('Track has not been removed.'); return; }

    for ( var i = 0; i < Catalog.obj.catalog.length; i++ ) {

        if ( Catalog.obj.catalog[i].id === Track.obj.id ) {

            Track.obj.state = 'READY';

            Catalog.obj.catalog.push( {

                id: Track.id,
                title: Track.title,
                album: Track.album,
                author: Track.author,
                length: Track.end - Track.begin

                } );

            break; } }

    db.swrite( 'LIB-TRACK-' + Track.obj.id, Track.obj, function ( ) {

        db.swrite( 'LIB-CATALOG', Catalog.obj );

        } );

    res.send('Done');

    } );

router.get( '/clean', function( req, res ) {

    if ( !auth.validate(req) ) {

        res.status(401).send('Unauthorized'); return; }

    var Catalog = db.sread('LIB-CATALOG');

    if ( !Catalog.valid ) {

        res.status(500).send('Library catalog is inaccessible!'); return; }

    for ( var i = 0; i < Catalog.obj.tracks.length; i++ ) {

        var Track = db.sread( 'LIB-TRACK-' + Catalog.obj.tracks[i] );

        if ( Track.valid ) {

            if ( Track.obj.state === 'ERROR' || Track.obj.state === 'REMOVED' ) {

                if ( fs.existsSync( 'tracks/' + Track.obj.path ) ) {

                    fs.unlink( 'tracks/' + Track.obj.path ); }

                db.sremove( Track.obj.id );

                Catalog.obj.tracks.splice( i, 1 ); } }

        else {

            Catalog.obj.tracks.splice( i, 1 ); } }

    res.send('Done');

    } );

module.exports = router;
