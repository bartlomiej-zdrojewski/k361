var express = require('express');
var router = express.Router();

var db = require('../db.js'); // PLT-XXX-XXX
var auth = require('../auth.js');

router.get( '/', function( req, res ) {

    if ( !auth.validate(req) ) {

        res.status(401).send('Unauthorized'); }

    // ...

    res.json( {} );

    } );

module.exports = router;
