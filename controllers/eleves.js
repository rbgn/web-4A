const dbEleves = require('../database/eleves');
const session = require('../controllers/session');

exports.getNotes = async function (req, res, next) {

    if (await session.controlSession(req.cookies.session) === 3) {
        dbEleves.getNotes(session.getUser(req.cookies.session))
        .then(resolve => {
            res.json(resolve);
        },
        reject => {
            res.status(500).send("Database error : " + reject);
        })
    } else {
        res.status(403).send("Unauthorized access.");
    }
};