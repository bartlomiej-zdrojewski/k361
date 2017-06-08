var fs = require('fs');
var db = {};

db.dmem = []; // [ id : STRING, obj: OBJECT ]
db.smem = []; // [ id : STRING, obj: OBJECT ]

db.init = function ( ) {

    console.log('Initiating database');

    try {

        db.smem = JSON.parse( fs.readFileSync( './db.json', 'utf8' ) ); }

    catch ( err ) {

        console.log( 'While initiating database an error occurred: ' + err );

        db.reset();
        db.init(); }

    };

db.reset = function ( ) {

    console.log('Resetting database');

    db.dmem = [];
    db.smem = [

        { id: 'ATH-PASSWORD', obj: { password: '', timestamp: Date.now() } },
        { id: 'LIB-CATALOG', obj: { catalog: [], tracks: [], timestamp: Date.now() } },
        { id: 'STE-SETTINGS', obj: { settings: {

            playlist_designer: false,
            playlist_designer_launch_time: 10800,
            playlist_designer_time_intervals: [],
            reserved_time_intervals: [],
            synchronization_delay: 2000

            }, timestamp: Date.now() } }

        ];

    fs.writeFileSync( './db.json', JSON.stringify( db.smem ), 'utf8' );

    };

db.swap = function ( mem, i, j ) {

    var tmp = mem[i];

    mem[i] = mem[j];
    mem[j] = tmp;

    };

db.read = function ( mem, id, json_friendly ) { // TODO: CHANGE LINEAR SEARCH TO BINARY SEARCH

    if ( id === undefined || id === '' ) {

        return { id: id, obj: {}, valid: false }; }

    var data = { id: id, obj: {}, valid: false };

    for ( var i = 0; i < mem.length; i++ ) {

        if ( mem[i].id == id ) {

            if ( typeof( json_friendly ) != 'boolean' ) {

                data.obj = JSON.parse( JSON.stringify( mem[i].obj ) ); }

            else if ( json_friendly ) {

                data.obj = JSON.parse( JSON.stringify( mem[i].obj ) ); }

            else {

                data.obj = mem[i].obj; }

            data.valid = true;

            if ( i > 0 ) {

                db.swap( mem, i, i - 1 ); }

            break; } }

    return data;

    };

db.write = function ( mem, id, obj, json_friendly ) { // TODO: CHANGE LINEAR SEARCH TO BINARY SEARCH AND USE BINARY INSERTION AFTERWARDS

    if ( id === undefined || id === '' ) {

        return; }

    for ( var i = 0; i < mem.length; i++ ) {

        if ( mem[i].id == id ) {

            if ( typeof( json_friendly ) != 'boolean' ) {

                mem[i].obj = JSON.parse( JSON.stringify( obj ) ); }

            else if ( json_friendly ) {

                mem[i].obj = JSON.parse( JSON.stringify( obj ) ); }

            else {

                mem[i].obj = obj; }

            if ( i > 0 ) {

                db.swap( mem, i, i - 1 ); }

            return; } }

    mem.push( { id: id, obj: obj } );

    };

db.remove = function ( mem, id ) { // TODO: CHANGE LINEAR SEARCH TO BINARY SEARCH

    if ( id === undefined || id === '' ) {

        return; }

    for ( var i = 0; i < mem.length; i++ ) {

        if ( mem[i].id == id ) {

            mem.splice( i, 1 );

            break; } }

    };

db.dread = function ( id ) {

    return db.read( db.dmem, id, false );

    };

db.dwrite = function ( id, obj ) {

    db.write( db.dmem, id, obj, false );

    };

db.dremove = function ( id ) {

    db.remove( db.dmem, id );

    };

db.sread = function ( id ) {

    return db.read( db.smem, id );

    };

db.swrite = function ( id, obj, callback ) {

    db.write( db.smem, id, obj );

    fs.writeFile( './db.json', JSON.stringify( db.smem ), 'utf8', function ( err ) {

        if ( err ) {

            console.log( 'While writing to database an error occurred: ' + err ); }

        if ( callback !== undefined ) {

            callback(); }

        } );

    };

db.sremove = function ( id, callback ) {

    db.remove( db.smem, id );

    fs.writeFile( './db.json', JSON.stringify( db.smem ), 'utf8', function ( err ) {

        if ( err ) {

            console.log( 'While removing from database an error occurred: ' + err ); }

        if ( callback !== undefined ) {

            callback(); }

        } );

    };

module.exports = db;