var express = require('express');
var router = express.Router();

var db = require('../db.js'); // ATH-XXX-XXX
var auth = require('../auth.js');

router.get( '/', function( req, res ) {

    res.send("");

    } );

module.exports = router;
