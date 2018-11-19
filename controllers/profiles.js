const session = require('./session');
const profilesModels = require('../models/profiles');
const auth = require('./auth');

exports.list = async function(req, res, next) {

    if (await session.controlSession(req.cookies.session) === 1) {
        res.json(await profilesModels.list(res));
    } else {
        res.status(403).send("Unauthorized access.");
    }
};