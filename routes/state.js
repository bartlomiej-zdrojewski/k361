var express = require('express');
var router = express.Router();

var db = require('../db.js'); // STE-XXX-XXX
var auth = require('../auth.js');

router.get( '/', function( req, res ) {

    res.json( db.dmem );

    /*

    if ( !auth.validate(req) ) {

    res.status(401).send('Unauthorized'); }

    // ...

    res.json( {} );

    */

    } );

module.exports = router;
