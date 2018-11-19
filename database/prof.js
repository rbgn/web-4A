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

exports.myClasses = function (profName) {
    return new Promise(function (resolve, reject) {

        pool.query('SELECT m.name "name", c.name "classe" ' +
                    'FROM "projet-web".matiere AS m ' +
                    'RIGHT JOIN "projet-web".classe AS c ' +
                    '   ON m."classeId" = c.id ' +
                    'WHERE (m.name IS NOT NULL ' +
                        'AND' +
                    '       m.prof = (SELECT id ' +
                    '                 FROM "projet-web".users AS u ' +
                    '       WHERE u.name = $1));',
                [profName],
                (err, result) => {
                    if (err) {
                        reject(err)
                    }
                    resolve(result.rows);
                })
        })
    };


exports.getMatiereNotes = function (promo, matiere) {
    return new Promise(function (resolve, reject) {
        pool.query(
            'SELECT eleves.classe "promo", eleves.eleve "eleve", n.note "note", n."noteMax", n.coef, n."eleveId" ' +
            'FROM "projet-web".note AS n ' +
            'FULL JOIN (SELECT c.name AS "classe", u.name "eleve", m.id "matiereId", u.id ' +
            '           FROM "projet-web".users AS u ' +
            '           JOIN "projet-web".classe AS c ' +
            '               ON c.id = u."classeId" ' +
            '           LEFT JOIN "projet-web".matiere AS m ' +
            '           ON c.id = m."classeId" ' +
            '           WHERE m.name = $2) "eleves" ' +
            'ON n."matiereId" = eleves."matiereId" ' +
            '   AND n."eleveId" = eleves.id ' +
            'WHERE eleves.classe = $1; ', [promo, matiere],
            (err, result) => {
                if (err) {
                    reject(err)
                }
                resolve(result.rows);
            }
        )
    })
};
