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
            'FROM "projet-web".notes AS n ' +
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

exports.doesNoteExists = async function(matiere, eleve) {

    test = await pool.query('SELECT 1 as result ' +
                        'FROM "projet-web".notes ' +
                        'WHERE "matiereId" = (SELECT id ' +
                        '   FROM "projet-web".matiere ' +
                        '   WHERE name = $1) ' +
                        'AND "eleveId" = (SELECT id ' +
                        '   FROM "projet-web".users ' +
                        '   WHERE name = $2);', [matiere, eleve])
    if(test.rowCount > 0) {
        return true;
    } else {
        return false
    }

};

exports.updateNote = async function (note, matiere, eleve) {

    const client = await pool.connect();

    return new Promise(async function (resolve, reject) {

        try {

            await client.query('BEGIN;');
            await client.query('UPDATE "projet-web".notes ' +
                'SET note = ($1) ' +
                'WHERE ("matiereId" = (SELECT id ' +
                '       FROM "projet-web".matiere ' +
                '       WHERE name = $2) ' +
                '   AND "eleveId" = (SELECT id ' +
                '       FROM "projet-web".users ' +
                '       WHERE name = $3));', [note, matiere, eleve]);

            const test2 = await pool.query('SELECT * FROM "projet-web".notes');

            const test = await pool.query('SELECT 1 AS "result" ' +
            'FROM "projet-web".notes ' +
            'WHERE "matiereId" = (SELECT id ' +
            'FROM "projet-web".matiere ' +
            'WHERE name = $1) ' +
            'AND "eleveId" = (SELECT id ' +
            'FROM "projet-web".users ' +
            'WHERE name = $2) ' +
            'AND note = $3;', [matiere, eleve, note]);

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

exports.newNote = async function (note, matiere, eleve) {

    const client = await pool.connect();
    return new Promise(async function (resolve, reject) {

        try {

            await client.query('BEGIN;');
            await client.query('INSERT INTO "projet-web".notes ' +
                '(note,"matiereId", "eleveId") ' +
                'VALUES ($1, (SELECT id ' +
                '        FROM "projet-web".matiere ' +
                '        WHERE name = $2), ' +
                '        (SELECT id ' +
                '        FROM "projet-web".users ' +
                '        WHERE name = $3));', [note, matiere, eleve]);

            const test = await client.query('SELECT 1 "result" ' +
                            'FROM "projet-web".notes ' +
                            'WHERE (note = $1 AND ' +
                            '   "matiereId" = (SELECT id ' +
                            '        FROM "projet-web".matiere ' +
                            '        WHERE name = $2) AND ' +
                            '   "eleveId" = (SELECT id ' +
                            '        FROM "projet-web".users ' +
                            '        WHERE name = $3));', [note, matiere, eleve])

            if (test.rowCount === 1) {
                await client.query('COMMIT');
                resolve(1)
            } else {
                await client.query('ROLLBACK');
                reject('Insert error.')
            }
        } catch (e) {
            await client.query('ROLLBACK');
            reject('Insert error.')

        } finally {
            client.release()
        }
    })
};