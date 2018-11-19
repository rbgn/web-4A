const express = require('express');
const router = express.Router();

const eleveControl = require('../controllers/eleves');

router.get('/getnotes', async function (req, res, next) {
    await eleveControl.getNotes(req, res, next);
});

module.exports = router;