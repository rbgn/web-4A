const { Pool } = require('pg');
var config = {
    host: 'localhost',
    user: 'projet-web',
    password: 'password',
    database: 'projet-web',
    max: 20,
    idleTimeoutMillis: 30000 // how long a client is allowed to remain idle before being closed
};
const pool = new Pool(config);


exports.getUsers = function () {

    return new Promise(function (resolve, reject) {
        pool.query('SELECT "projet-web".users.name "name", ' +
                    '"projet-web".profile.name "profile",' +
                    ' "projet-web".classe.name "classe" ' +
                'FROM "projet-web".users ' +
                'JOIN "projet-web".profile ' +
            'ON "projet-web".users."profileId" = "projet-web".profile.id ' +
            'LEFT JOIN "projet-web".classe ' +
            'ON "projet-web".users."classeId" = "projet-web".classe.id;',
            (err, result) => {
             if (err) {
                    reject(err)
                }
                resolve(result.rows);
            }
        )
    })

};

exports.getProfs = function () {

    return new Promise(function (resolve, reject) {
        pool.query('SELECT "projet-web".users.name "name" ' +
            'FROM "projet-web".users ' +
            'JOIN "projet-web".profile ' +
            'ON "projet-web".users."profileId" = "projet-web".profile.id ' +
            'WHERE "projet-web".users."profileId" = ( ' +
            '   SELECT id ' +
            '        FROM "projet-web".profile ' +
            '        WHERE name = \'prof\');',
            (err, result) => {
                if (err) {
                    reject(err)
                }
                resolve(result.rows);
            }
        )
    })

};

exports.authenticateUser = function (id, password) {

    return new Promise(function (resolve, reject) {
        pool.query('SELECT "profileId" FROM "projet-web".users WHERE "name" = $1 AND "password" = $2', [id, password],
            (err, result) => {

                if (err) {
                    reject(err)
                }

                resolve(result.rows);
            }
        )
    })

};

exports.doesUserExists = async function(typedName) {
    return new Promise(function (resolve, reject) {
        pool.query('SELECT 1 as "result" FROM "projet-web".users WHERE name = $1;', [typedName],
            (err, result) => {

                if (err) {
                    reject(err)
                }

                resolve(result.rows);
            })
    })
};

exports.insertNewUser = async function (name, salt, password, profileId, classeId) {

        // note: we don't try/catch this because if connecting throws an exception
        // we don't need to dispose of the client (it will be undefined)
        const client = await pool.connect();

        try {
            await client.query('BEGIN');
            await client.query(
                'INSERT INTO "projet-web".users (name, salt, password, "profileId", "classeId") ' +
                'VALUES ($1, $2, $3, ' +
                '(SELECT id FROM "projet-web".profile ' +
                'WHERE "name" = $4), ' +
                '(SELECT id FROM "projet-web".classe ' +
                'WHERE name = $5)' +
                '); ', [name, salt, password, profileId, classeId]);

            const test = await client.query('SELECT * FROM "projet-web".users WHERE name = $1', [name]);


            if (test.rows.length === 1) {
                await client.query('COMMIT');
                return 0;
            } else {
                await client.query('ROLLBACK');
                return 1;
            }

        } catch (e) {
            await client.query('ROLLBACK');
            return 1;

        } finally {
            client.release()
        }
};

exports.deleteUser = async function (userName) {
    return new Promise(function (resolve, reject) {

        pool.query('DELETE FROM "projet-web".users WHERE "name" = $1;', [userName],
            (err, result) => {

                if (err) {
                    reject(err)
                }
                resolve(0);
            }
        )
    })
};

exports.changeUserPassword = async function (newPassword, newSalt, name) {

    const client = await pool.connect();

    try {

        await client.query('BEGIN');
        await client.query('UPDATE "projet-web".users SET (password, salt) = ($1, $2) WHERE name = $3;',
            [newPassword, newSalt, name]);

        const test = await client.query('SELECT 1 FROM "projet-web".users WHERE (password = $1 AND salt = $2);', [newPassword, newSalt]);

        if(test.rowCount === 1) {
            await client.query('COMMIT');
            return 0;
        } else {
            await client.query('ROLLBACK');
            return 1;
        }


    } catch (e) {
        await client.query('ROLLBACK');
        return 1;

    } finally {
        client.release()
    }

};

exports.getUserSalt = async function (userName, res) {
    return new Promise(function (resolve, reject) {
        pool.query('SELECT salt FROM "projet-web".users WHERE name = $1;', [userName],
            (err, result) => {

                if (err) {
                    reject(err)
                }
                if (result.rowCount === 1){
                    resolve(result.rows["0"].salt);
                } else {
                    reject("Unknown user.");
                }

            })
    })
};

exports.editUser = async function (newName, oldName, newProfile, newClasse) {

    const client = await pool.connect();

    return new Promise(async function (resolve, reject) {
        try {


            if (newClasse === undefined) {
                newClasse = " ";
            }


            await client.query('BEGIN');
            await client.query('UPDATE "projet-web".users AS u ' +
                                'SET (name, "profileId", "classeId") = ' +
                                '   ($1, ' +
                                '   (SELECT id ' +
                                '       FROM "projet-web".profile AS p ' +
                                '       WHERE p.name = $3), ' +
                                '   (SELECT id ' +
                                '       FROM "projet-web".classe AS u ' +
                                '       WHERE u.name = $4)) ' +
                                'WHERE u.name = $2;', [newName, oldName, newProfile, newClasse]);

            const test = await client.query('SELECT 1 "result" ' +
                                            'FROM "projet-web".users  ' +
                                            'WHERE (name = $1 AND ' +
                                            '   "profileId" = (SELECT id ' +
                                            '                  FROM "projet-web".profile AS p' +
                                            '                  WHERE p.name = $2) ' +
                                            '   AND ' +
                                            '   "classeId" = (SELECT id ' +
                                            '                  FROM "projet-web".classe AS c' +
                                            '                  WHERE c.name = $3)); ', [newName, newProfile, newClasse]);

            if (test.rowCount === 1) {
                await client.query('COMMIT');
                resolve(1)
            } else {
                await client.query('ROLLBACK');
                reject('Update error.')
            }
        } catch (e) {
            await client.query('ROLLBACK');
            reject('Update error.')

        } finally {
            client.release()
        }
    })
};