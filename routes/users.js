const express = require('express');
const router = express.Router();

const session = require('../controllers/session');

const usersControl = require('../controllers/users');


router.post('/login', async function (req, res, next) {
    await usersControl.login(req, res, next)
});

router.get('/logout', function (req, res, next)  {

    session.logout(req.cookies.session);
    res.clearCookie("session");
    res.redirect('/');

});

router.get('/list', function (req, res, next) {
    usersControl.list(req, res, next);
});

router.get('/getprofs', function (req, res, next) {
    usersControl.getProfs(req, res, next);
});

router.post('/new', function (req, res, next) {
    usersControl.new(req, res, next);
});

router.post('/changepassword', function (req, res, next) {
    usersControl.changePassword(req, res, next);
});

router.post('/adminresetpassword', function (req, res, next) {
    usersControl.resetPasswordByAdmin(req, res, next);
});

router.delete('/delete', function (req, res, next) {
    usersControl.delete(req, res, next);
});

router.post('/edit', function (req, res, next) {
    usersControl.edit(req, res, next);
});

module.exports = router;