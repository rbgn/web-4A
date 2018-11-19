const dbClasses = require('../database/classes');

exports.list = async function (res) {
    return await dbClasses.getClasses()
        .then(resolve => {
            console.log(resolve);
            return resolve;
        }, reject => {
            res.status(501).send('Database connection error : ' + reject);
        });
};

exports.new = async function (req) {

    const dbInsert = await dbClasses.insertNewClasse(req.body.name);
    return dbInsert;

};

exports.exists = function (typedName, res) {

    return new Promise(async function (free, used) {
        dbClasses.doesClasseExists(typedName)
            .then(async resolve => {
                console.log(resolve);
                // True si l'utilisateur demandé existe
                if (resolve.length > 0) {
                    return used("Classe already exists.");
                } else {
                    return free(1);
                }

            })
            .catch(async reject => {
                res.status(501).send('Database connection error : ' + reject);
            });
    })

};

exports.delete = async function (classeName) {

    const userDeleted = await dbClasses.deleteClasse(classeName);

    if (userDeleted === 0) {
        return 0;
    } else {
        return 2;
    }
};

exports.rename = async function (newClasseName, oldClassName, res) {
    await dbClasses.rename(newClasseName, oldClassName)
        .then(resolve =>{
            res.redirect('/admin');
        })
        .catch(reject => {
            throw(res.send(reject));
        });
};