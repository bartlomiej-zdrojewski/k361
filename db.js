var fs = require('fs');
var db = {};

db.smem = []; // [ id : STRING, obj: OBJECT ]
db.dmem = []; // [ id : STRING, obj: OBJECT ]

db.init = function ( ) {

    db.smem = JSON.parse( fs.readFileSync( 'db.json', 'utf8' ) );

    };

db.read = function ( mem, id ) {

    if ( id === undefined || id == "" ) {

        return { id: id, data: {}, valid: false }; }

    var obj = { id: id, valid: false };

    for ( var i = 0; i < mem.length; i++ ) {

        if ( mem[i].id == id ) {

            obj.data = mem[i].data;
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

db.sread = function ( id ) {

    return db.read( db.smem, id );

    };

db.swrite = function ( id, obj ) {

    db.write( db.smem, id, obj );

    };

db.dread = function ( id ) {

    return db.read( db.dmem, id );

    };

db.dwrite = function ( id, obj ) {

    db.write( db.dmem, id, obj );

    };

module.exports = db;