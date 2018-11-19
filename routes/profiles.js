const express = require('express');
const router = express.Router();

const session = require('../controllers/session');
const profilesControl = require('../controllers/profiles');



router.get('/list', function (req, res, next) {
    profilesControl.list(req, res, next);
});


module.exports = router;