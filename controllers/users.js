const session = require('./session');
const usersModels = require('../models/users');
const auth = require('./auth');

let session_id;

exports.login = async function (req, res, next) {

    switch (await auth.loginCheck(req.body.id, req.body.password, res)) {
        case 0:
            res.redirect('/');
        case 1:
            session_id = await session.newSession(req.body.id, "admin");
            res.cookie("session",session_id);
            res.redirect('/admin');
        case 2:
            session_id = await session.newSession(req.body.id, "prof");
            res.cookie("session",session_id);
            res.redirect('/prof');
        case 3:
            session_id = await session.newSession(req.body.id, "eleve");
            res.cookie("session",session_id);
            res.redirect('/eleve');
    }
};

exports.list = async function(req, res, next) {

    if (session.controlSession(req.cookies.session) === 1) {
        res.json(await usersModels.list(res));
    } else {
        res.status(403).send("Unauthorized access.");
    }
};

exports.getProfs = async function(req, res, next) {

    if (session.controlSession(req.cookies.session) === 1) {
        res.json(await usersModels.getProfs(res));
    } else {
        res.status(403).send("Unauthorized access.");
    }
};

exports.new = async function(req, res, next) {

    if (await session.controlSession(req.cookies.session) === 1) {

        // Vérifie si l'utilisateur existe
        if (await usersModels.exists(req.body.name))
            res.send("User already exists.");

        const dbInsert = await usersModels.new(req);
        if (dbInsert === 0) {
            res.redirect('/admin');
   //         res.status(200);
        } else if (dbInsert === 1) {
            res.status(501).send("User creation error.")
        }

    } else {
        res.status(403).send("Unauthorized access.");
    }
};

exports.resetPasswordByAdmin = async function (req, res, next) {
    if (await session.controlSession(req.cookies.session) === 1) {

        if (req.body.newPassword === req.body.newPassword2) {
            await usersModels.changePassword(req.body.name, req.body.newPassword)
        } else {
            res.send("Missmatch between the two typed passwords. ")
        }
    } else {
        res.status(403).send("Unauthorized access.");
    }
};

exports.changePassword = function (req, res, next) {

    // Authentifié
    if (session.controlSession(req.cookies.session) === 0) {
        res.send("You must be authenticated.");
    }

    // Match du nouveau mot de passe avec sa confirmation
    if (req.body.newPassword.valueOf() !== req.body.newPassword2.valueOf()) {
        res.send("Bad password confirmation.");
    }

    // Test du mot de passe actuel
    if (auth.loginCheck(session.getUser(req.cookies.session), req.body.currentPassword) === 0) {
        res.send("Bad current password.")
    }

    usersModels.changePassword(session.getUser(req.cookies.session), req.body.newPassword)
};

exports.delete = async function(req, res, next) {
    if (await session.controlSession(req.cookies.session) === 1) {
        if(await usersModels.delete(req.query.name) === 0) {
            res.status(200).send("User deleted.");
        } else {
            res.status(204).send("Unknown user.");
        }
    } else {
        res.status(403).send("Unauthorized access.");
    }
};

exports.edit = async function (req, res, next) {
    if (await session.controlSession(req.cookies.session) === 1) {

        await usersModels.edit(req, res, next)
    } else {
    res.status(403).send("Unauthorized access.");
}
};
