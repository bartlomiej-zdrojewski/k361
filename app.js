var express = require('express');
var path = require('path');
var http = require('http');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var ResetRoute = require('./routes/reset.js');
var LoginRoute = require('./routes/login.js');
var LogoutRoute = require('./routes/logout.js');
var StateRoute = require('./routes/state.js');
var LibraryRoute = require('./routes/library.js');
var PlaylistRoute = require('./routes/playlist.js');

var app = express();
var config = require('./config.js');
var db = require('./db.js'); db.init();

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use( logger('dev') );
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded( { extended: true } ) );
app.use( cookieParser() );
app.use( express.static( path.join( __dirname, 'public' ) ) );

app.use( '/reset', ResetRoute );
app.use( '/login', LoginRoute );
app.use( '/logout', LogoutRoute );
app.use( '/state', StateRoute );
app.use( '/library', LibraryRoute );
app.use( '/playlist', PlaylistRoute );

app.use( function( req, res, next ) {

    var err = new Error('Not Found');
    err.status = 404;

    next(err);

    } );

app.use( function( err, req, res, next ) {

    res.status( err.status || 500 );

    switch ( err.status ) {

        case 404 : res.sendFile( path.join( __dirname, 'public', '404.html' ) ); break;
        case 500 : res.sendFile( path.join( __dirname, 'public', '500.html' ) ); break;

        default : res.sendFile( path.join( __dirname, 'public', '500.html' ) ); }

    } );

var server = http.createServer(app);

server.listen( config.port );
server.on( 'error', onError );
server.on( 'listening', onListening );

function onError ( error ) {

    if ( error.syscall !== 'listen' ) {

        throw error; }

    var bind = typeof config.port === 'string' ? 'Pipe ' + config.port : 'Port ' + config.port;

    switch ( error.code ) {

        case 'EACCES':

            console.error( bind + ' requires elevated privileges' );
            process.exit(1);

            break;

        case 'EADDRINUSE':

            console.error( bind + ' is already in use' );
            process.exit(1);

            break;

        default: throw error; } }

function onListening ( ) {

    var addr = server.address();
    var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;

    console.log( 'Listening on ' + bind ); }

module.exports = app;
