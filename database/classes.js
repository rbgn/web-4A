const { Pool } = require('pg')
var config = {
    host: 'localhost',
    user: 'projet-web',
    password: 'password',
    database: 'projet-web',
    max: 20,
    idleTimeoutMillis: 30000 // how long a client is allowed to remain idle before being closed
};
const pool = new Pool(config);


exports.getClasses = function() {

    return new Promise(function (resolve, reject) {
        pool.query('SELECT name FROM "projet-web".classe',
            (err, result) => {
                if (err) {
                    reject(err)
                }
                resolve(result.rows);
            }
        )
    })
};

exports.doesClasseExists = async function(typedName) {
    return new Promise(async function (resolve, reject) {
        await pool.query('SELECT 1 as "result" FROM "projet-web".classe WHERE name = $1;', [typedName],
            (err, result) => {

                if (err) {
                    reject(err)
                }

                resolve(result.rows);
            })
    })
};

exports.insertNewClasse = async function (name) {

    // note: we don't try/catch this because if connecting throws an exception
    // we don't need to dispose of the client (it will be undefined)
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        await client.query(
            'INSERT INTO "projet-web".classe (name) ' +
            'VALUES ($1);', [name]);

        const test = await client.query('SELECT name FROM "projet-web".classe WHERE name = $1', [name]);

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

exports.deleteClasse = async function (classeName) {

    return new Promise(function (resolve, reject) {

        pool.query('DELETE FROM "projet-web".classe WHERE "name" = $1;', [classeName],
            (err, result) => {

                if (err) {
                    reject(err)
                }
                resolve(0);
            }
        )
    })
};

exports.rename = async function (newClassName, oldClassName) {

    const client = await pool.connect();

    return new Promise(async function (resolve, reject) {

        try {

            await client.query('BEGIN');
            await client.query('UPDATE "projet-web".classe SET name = ($1) WHERE name = $2;', [newClassName, oldClassName]);

            const test = await client.query('SELECT name FROM "projet-web".classe WHERE name = $1', [newClassName]);

            if (test.rows.length === 1) {
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