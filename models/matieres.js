const dbMatieres = require('../database/matieres');

exports.list = async function (res) {
    return dbMatieres.getMatieres()
        .then(resolve => {
            console.log(resolve);
            return resolve;
        }, reject => {
            res.status(501).send('Database connection error : ' + reject);
        });
};

exports.new = async function (req) {
    const dbInsert = await dbMatieres.insertNewMatiere(req.body.name, req.body.coef, req.body.prof, req.body.classe);
    return dbInsert;
};

exports.exists = function (newMatiere, classe) {

    return new Promise(async function (free, used) {
        dbMatieres.doesMatiereExists(newMatiere, classe)
            .then(async resolve => {
                console.log(resolve);
                // True si la matière demandé existe
                if (resolve.length > 0) {
                    return used("Matiere already exists.");
                } else {
                    return free(1);
                }

            })
            .catch(async reject => {
                res.status(501).send('Database connection error : ' + reject);
            });
    })

};

exports.delete = async function (matiereName) {

    const userDeleted = await dbMatieres.deleteMatiere(matiereName);

    if (userDeleted === 0) {
        return 0;
    } else {
        return 2;
    }
};