var db = require('./db.js'); // ATH-XXX-XXX
var config = require('./config.js');
var auth = {};

auth.validate = function ( req ) {

    if ( req.cookies.token === undefined ) {

        return false; }

    var entry = db.dread('ATH-TOKENS');

    if ( !entry.valid ) {

        return false; }

    var tokens = entry.obj.list;

    for ( var i = 0; i < tokens.length; i++ ) {

        if ( tokens[i].hash === req.cookies.token ) {

            clearTimeout( tokens[i].timeout );
            tokens[i].timeout = setTimeout( function ( ) { auth.logout(req.cookies.token) }, config.token_expiration_time );

            return true; } }

    return false;

    };

auth.login = function ( token, res ) {

    var entry = db.dread('ATH-TOKENS');
    var tokens = {};

    if ( entry.valid ) {

        tokens = entry.obj.list; }

    else {

        tokens = []; }

    for ( var i = 0; i < tokens.length; i++ ) {

        if ( tokens[i].hash === token ) {

            return; } }

    tokens.push( { hash: token, timeout: setTimeout( function ( ) { auth.logout(token) }, config.token_expiration_time ) } );

    db.dwrite( 'ATH-TOKENS', { list: tokens, count: tokens.length } );
    res.cookie( 'token' , token );

    };

auth.logout = function ( token ) {

    var entry = db.dread('ATH-TOKENS');

    if ( !entry.valid ) {

        return; }

    var tokens = entry.obj.list;

    for ( var i = 0; i < tokens.length; i++ ) {

        if ( tokens[i].hash === token ) {

            tokens.splice( i, 1 );

            break; } }

    db.dwrite( 'ATH-TOKENS', { list: tokens, count: tokens.length } );

    };

module.exports = auth;