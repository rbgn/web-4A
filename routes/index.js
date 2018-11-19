var express = require('express');
var router = express.Router();
var path = require('path');

const session = require('../controllers/session');


/* GET home page. */
router.get('/', function(req, res, next) {
//  res.render('index', { title: 'Express' });
    res.sendFile(__dirname + '/html/index.html');
});



router.get('/admin', function (req, res, next) {

    var profile_id = session.controlSession(req.cookies.session);
    if(profile_id === 1){
        res.sendFile(__dirname + '/html/admin.html');
    } else {
        res.redirect('/');
    }
});

router.get('/prof', function (req, res, next) {

    if(session.controlSession(req.cookies.session) === 2){
        res.sendFile(__dirname + '/html/prof.html');
    } else {
        res.redirect('/');
    }
});

router.get('/eleve', function (req, res, next) {

    if(session.controlSession(req.cookies.session) === 3){
        res.sendFile(__dirname + '/html/eleve.html');
    } else {
        res.redirect('/');
    }
});


/*
router.get('/test',
    dbUsers.getUsersList()
        .then(function (result) {
                res.send(result);
            }

        )
        .catch((err) => res.send(err))

);
*/


module.exports = router;
