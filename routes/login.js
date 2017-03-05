var express = require('express');
var shortid = require('shortid');
var router = express.Router();


var db = require('../db.js'); // ATH-XXX-XXX
var auth = require('../auth.js');

router.post( '/', function( req, res ) {

    var Password = db.sread('ATH-PASSWORD');

    if ( !Password.valid ) {

        res.status(500).send('Password is inaccessible'); }

    if ( Password.obj.data == req.body.password ) {

        auth.login( shortid.generate(), res );

        res.send('Done'); }

    else {

        res.status(400).send('Wrong password'); }

    } );

module.exports = router;