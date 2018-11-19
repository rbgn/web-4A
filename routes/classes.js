const express = require('express');
const router = express.Router();

const classesControl = require('../controllers/classes');



router.get('/list', function (req, res, next) {
    classesControl.list(req, res, next);
});

router.post('/new', function (req, res, next) {
   classesControl.new(req, res, next);
});

router.delete('/delete', function (req, res, next) {
    classesControl.delete(req, res, next);
});

router.post('/rename', function (req, res, next) {
    classesControl.rename(req, res, next);
});

module.exports = router;