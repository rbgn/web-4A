const dbProfiles = require('../database/profiles');

exports.list = async function (res) {
    return await dbProfiles.getProfiles()
        .then(resolve => {
            console.log(resolve);
            return resolve;
        }, reject => {
            res.status(501).send('Database connection error : ' + reject);
        });
};