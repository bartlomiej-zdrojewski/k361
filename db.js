var fs = require('fs');
var db = {};

db.dmem = []; // [ id : STRING, obj: OBJECT ]
db.smem = []; // [ id : STRING, obj: OBJECT ]

db.init = function ( ) {

    db.smem = JSON.parse( fs.readFileSync( './db.json', 'utf8' ) );

    };

db.reset = function ( ) {

    db.dmem = [];
    db.smem = [];

    fs.writeFileSync( './db.json', JSON.stringify( db.smem ), 'utf8' );

    };

db.read = function ( mem, id ) {

    if ( id === undefined || id == "" ) {

        return { id: id, data: {}, valid: false }; }

    var obj = { id: id, data: {}, valid: false };

    for ( var i = 0; i < mem.length; i++ ) {

        if ( mem[i].id == id ) {

            obj.data = mem[i].obj;
            obj.valid = true;

            break; } }

    return obj;

    };

db.write = function ( mem, id, obj ) {

    if ( id === undefined || id == "" ) {

        return; }

    for ( var i = 0; i < mem.length; i++ ) {

        if ( mem[i].id == id ) {

            mem[i].obj = obj;

            return; } }

    mem.push( { id: id, obj: obj } );

    };

db.dread = function ( id ) {

    return db.read( db.dmem, id );

    };

db.dwrite = function ( id, obj ) {

    db.write( db.dmem, id, obj );

    };

db.sread = function ( id ) {

    return db.read( db.smem, id );

    };

db.swrite = function ( id, obj, callback ) {

    db.write( db.smem, id, obj );

    fs.writeFile( './db.json', JSON.stringify( db.smem ), 'utf8', function ( err ) {

        if ( err ) {

            throw err; }

        if ( callback !== undefined ) {

            callback(); }

        } );

    };

module.exports = db;