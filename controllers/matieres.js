const session = require('./session');
const matieresModels = require('../models/matieres');


exports.list = async function(req, res, next) {
    if (await session.controlSession(req.cookies.session) === 1) {
        res.json(await matieresModels.list(res));
    } else {
        res.status(403).send("Unauthorized access.");
    }
};

exports.new = async function (req, res, next) {
    if (await session.controlSession(req.cookies.session) === 1) {

        matieresModels.exists(req.body.name, req.body.coef)
            .then(async () => {
                const dbInsert = await matieresModels.new(req);
                if (dbInsert === 0) {
                    res.redirect('/admin');
                    //         res.status(200);
                } else if (dbInsert === 1) {
                    res.status(501).send("User creation error.")
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
        if(await matieresModels.delete(req.query.name) === 0) {
            res.status(200).send("Matiere deleted.");
        } else {
            res.status(204).send("Unknown Matiere.");
        }
    } else {
        res.status(403).send("Unauthorized access.");
    }
};
