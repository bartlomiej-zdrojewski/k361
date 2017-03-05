var express = require('express');
var router = express.Router();

var auth = require('../auth.js');

router.get( '/', function( req, res ) {

    if ( !auth.validate(req) ) {

        res.status(401).send('Unauthorized'); }

    auth.logout(req.cookies.token);

    res.send('Done');

    } );

module.exports = router;
