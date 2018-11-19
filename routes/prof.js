const express = require('express');
const router = express.Router();

const session = require('../controllers/session');
const profControl = require('../controllers/prof');

router.get('/myclasses', function (req, res, next) {
    profControl.myClasses(req, res, next);
});

router.post('/notesbymatiere', function (req, res, next) {
    profControl.getMatiereNotes(req, res, next);
});

router.post('/newnote', function (req, res, next) {
    profControl.newNote (req, res, next);
});

module.exports = router;