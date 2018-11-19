const dbProf = require('../database/prof');


exports.myClasses = async function (profName) {
    return dbProf.myClasses(profName)
        .then(resolve => {
            console.log(resolve);
            return resolve;
        }, reject => {
            res.status(501).send('Database connection error : ' + reject);
        });
};

exports.getMatiereNotes = function (promo, matiere) {
    return dbProf.getMatiereNotes(promo, matiere)
        .then(resolve => {
            console.log(resolve);
            return resolve;
        }, reject => {
            res.status(501).send('Database connection error : ' + reject);
        });
}