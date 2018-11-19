const session = require('./session');
const classesModels = require('../models/classes');
const auth = require('./auth');

exports.list = async function(req, res, next) {

    if (await session.controlSession(req.cookies.session) === 1) {
        res.json(await classesModels.list(res));
    } else {
        res.status(403).send("Unauthorized access.");
    }
};

exports.new = async function (req, res, next) {

    if (await session.controlSession(req.cookies.session) === 1) {
        // Vérifie si la classe existe
        classesModels.exists(req.body.name)
            .then(async () => {
                const dbInsert = await classesModels.new(req);
                if (dbInsert === 0) {
                    res.redirect('/admin');
                } else if (dbInsert === 1) {
                    res.status(501).send("Class creation error.")
                }
            })
            .catch(used => {
                res.sendStatus(403, {error : 'used'})
            });
    } else {
        res.status(403).send("Unauthorized access.");
    };
};

exports.delete = async function (req, res, next) {
    if (await session.controlSession(req.cookies.session) === 1) {
        if(await classesModels.delete(req.query.name) === 0) {
            res.status(200).send("User deleted.");
        } else {
            res.status(204).send("Unknown user.");
        }
    } else {
        res.status(403).send("Unauthorized access.");
    }
};

exports.rename = async function (req, res, next) {
    if (await session.controlSession(req.cookies.session) === 1) {

        await classesModels.rename(req.body.newname, req.body.oldname, res);

    } else {
        res.status(403).send("Unauthorized access.");
    }
};