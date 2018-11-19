const crypto = require('crypto');
const dbUsers = require('../database/users');


// Input : password + id or password + salt
exports.hashPassword = function (password, userSalt) {

    const sha256sum =  crypto.createHash('sha256')
        .update(password)
        .update(String(userSalt));

    return sha256sum.digest('hex');

};

exports.list = async function (res) {
    return await dbUsers.getUsers()
        .then(resolve => {
            console.log(resolve);
            return resolve;
        }, reject => {
            res.status(501).send('Database connection error : ' + reject);
        });
};

exports.getProfs = async function (res) {
    return await dbUsers.getProfs()
        .then(resolve => {
            console.log(resolve);
            return resolve;
        }, reject => {
            res.status(501).send('Database connection error : ' + reject);
        });
};

exports.new = async function (req) {

    const salt = await crypto.randomBytes(32).toString('hex');
    const hashedPassword = await this.hashPassword(req.body.password, null, salt);

    let classe;
    if (req.body.profile === 'eleve') {
        classe = null
    } else {
        classe = req.body.classe;
    }
    const dbInsert = await dbUsers.insertNewUser(req.body.name, salt, hashedPassword, req.body.profile, classe);
    return dbInsert;
};

exports.exists = async function (typedName, res) {

    await dbUsers.doesUserExists(typedName)
        .then(resolve => {
            console.log(resolve);

            // True si l'utilisateur demandé existe
            if (resolve) {
                return true;
            } else {
                return false;
            }

        }, reject => {
            res.status(501).send('Database connection error : ' + reject);
        });
};

exports.changePassword = async function(userName, newPassword) {

    const newSalt = await crypto.randomBytes(32).toString('hex');
    const newHashedPassword = await this.hashPassword (newPassword, newSalt);


    const passwordChanged = await dbUsers.changeUserPassword(newHashedPassword, newSalt, userName);

    if (passwordChanged === 0)
        return 0;
    else
        return 1;

};

exports.delete = async function (userName) {

    const userDeleted = await dbUsers.deleteUser(userName);

    if (userDeleted === 0) {
        return 0;
    } else {
        return 2;
    }
};

exports.edit = async function (req, res, next) {
    await dbUsers.editUser(req.body.newname, req.body.oldname, req.body.newprofile, req.body.newclasse)
        .then(resolve =>{
            res.redirect('/admin');
        })
        .catch(reject => {
            throw(res.send(reject));
        });
};