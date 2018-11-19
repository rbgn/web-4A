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


exports.getProfiles = function() {

    return new Promise(function (resolve, reject) {
        pool.query('SELECT name FROM "projet-web".profile',
            (err, result) => {
                if (err) {
                    reject(err)
                }
                resolve(result.rows);
            }
        )
    })
};