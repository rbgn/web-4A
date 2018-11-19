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


exports.getNotes = function (userName) {

    return new Promise(function (resolve, reject) {
    pool.query(
            'SELECT n.note, m.name ' +
            'FROM "projet-web".users u ' +
            'FULL JOIN "projet-web".notes n ' +
            '    ON u.id = n."eleveId" ' +
            'JOIN "projet-web".matiere m ' +
            '    ON m.id = n."matiereId" ' +
            'WHERE u.name = $1;', [userName],

        (err, result) => {
            if (err) {
                reject(err)
            }
            resolve(result.rows);
        })
        });
};