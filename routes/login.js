var express = require('express');
var router = express.Router();

var shortid = require('shortid');

var db = require('../db.js'); // ATH-XXX-XXX
var auth = require('../auth.js');

router.post( '/', function( req, res ) { // { password : STRING }

    var Password = db.sread('ATH-PASSWORD');

    if ( !Password.valid ) {

        res.status(500).send('Password is inaccessible!'); return; }

    if ( Password.obj.password === req.body.password ) {

        auth.login( shortid.generate(), res ); }

    else {

        res.status(400).send('Passwords do not match.'); return; }

    res.sendStatus(200);

    } );

module.exports = router;