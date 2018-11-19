const express = require('express');
const router = express.Router();

const matieresControl = require('../controllers/matieres');


router.get('/list', function (req, res, next) {
    matieresControl.list(req, res, next);
});

router.post('/new', function (req, res, next) {
    matieresControl.new(req, res, next);
});

router.delete('/delete', function (req, res, next) {
    matieresControl.delete(req, res, next);
});

router.post('/edit', function (req, res, next) {
    matieresControl.edit(req, res, next);
});

module.exports = router;