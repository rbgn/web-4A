const session = require('./session');
const profModels = require('../models/prof');

exports.myClasses = async function (req, res, next) {
    if (await session.controlSession(req.cookies.session) === 2) {

        const profName = await session.getUser(req.cookies.session);
        res.json(await profModels.myClasses(profName));

    } else {
        res.status(403).send("Unauthorized access.");
    }
};

exports.getMatiereNotes = async function (req, res, next) {

    if (await session.controlSession(req.cookies.session) === 2) {
        res.json(await profModels.getMatiereNotes(req.body.promo, req.body.matiere))
    } else {
        res.status(403).send("Unauthorized access.");
    }

}