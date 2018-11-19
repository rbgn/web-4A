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

exports.getMatieres = function () {
    return new Promise(function (resolve, reject) {
        pool.query('SELECT "projet-web".matiere.name "name", ' +
                        '"projet-web".matiere.coef "coef", ' +
                        '"projet-web".users.name "prof", ' +
                        '"projet-web".classe.name "classe" ' +
                    'FROM "projet-web".matiere ' +
                    'RIGHT JOIN "projet-web".classe ' +
                        'ON "projet-web".matiere."classeId" = "projet-web".classe.id ' +
                    'JOIN "projet-web".users ' +
                        'ON "projet-web".matiere.prof = "projet-web".users.id;',
        (err, result) => {
            if (err) {
                reject(err)
            }
            resolve(result.rows);
        })
    })
};

exports.insertNewMatiere = async function (newMatiere, coef, prof, classe) {

    const client = await pool.connect();

    try {

        await client.query('BEGIN');
        await client.query('INSERT INTO "projet-web".matiere (name, coef, prof, "classeId") ' +
            'VALUES ($1, $2, ' +
            '    (SELECT id FROM "projet-web".users ' +
            '       WHERE "name" = $3), ' +
            '    (SELECT id FROM "projet-web".classe ' +
            '       WHERE name = $4));', [newMatiere, coef, prof, classe]);

        const test = await client.query('SELECT 1 "result" ' +
            'FROM "projet-web".matiere ' +
            'WHERE (name = $1 ' +
            '       AND "classeId" = ' +
            '           (SELECT id ' +
            '           FROM "projet-web".classe' +
            '           WHERE name = $2));', [newMatiere, classe]);

        if (test.rowCount === 1) {
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

exports.doesMatiereExists = async function (newMatiere, classe) {

    return new Promise(async function (resolve, reject) {
        await pool.query('SELECT 1 as "result" FROM "projet-web".matiere ' +
            '            WHERE name = $1 AND ' +
            '               "classeId" = (SELECT id ' +
            '                       FROM "projet-web".classe ' +
            '                       WHERE name = $2);', [newMatiere, classe],
            (err, result) => {

                if (err) {
                    reject(err)
                }
                resolve(result.rows);
            })
    });
};

exports.deleteMatiere = async function (matiereName) {

    return new Promise(function (resolve, reject) {

        pool.query('DELETE FROM "projet-web".matiere WHERE "name" = $1;', [matiereName],
            (err, result) => {

                if (err) {
                    reject(err)
                }
                resolve(0);
            }
        )
    })
};