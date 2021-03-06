const sqlite3 = require('sqlite3').verbose();

export function AddTokenToDB(token){
    if (token === null)
        return;
    let db = new sqlite3.Database('./db/statistics.db', (err) => {
        if (err) {
            console.error(err.message);
        }
       // console.log('Connected to the statistics database.');
    });

    //console.log('token = ', token);
    db.run(`INSERT INTO statistics(token) VALUES(${token})`, function(err) {
        if (err) {
            console.log(err.message);
        }
        // get the last insert id
       // console.log(`A row has been inserted with token ${token}`);
    });

    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
      //  console.log('Close the statistics database.');
    });
    return token;
}

export function ShowRowInDB(token){
    if (token === null)
        return;

    let result = [];
    let db = new sqlite3.Database('./db/statistics.db', (err) => {
        if (err) {
            console.error(err.message);
        }
        //console.log('Connected to the statistics database.');
    });

    db.each(`SELECT * FROM statistics WHERE token = ${token}`, (err, row) => {
        if (err) {
            console.log(err.message);
        }

        result.push(row.token, row.played_times, row.collected_chests, row.killed_enemies);
    });

    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
    });

    return result;
}

export function CreateDB() {
    let db = new sqlite3.Database('./db/statistics.db', (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to the statistics database.');
    });
    db.run('CREATE TABLE IF NOT EXISTS statistics (' +
        'token TEXT PRIMARY KEY,' +
        'played_times INTEGER DEFAULT 0,' +
        'collected_chests INTEGER DEFAULT 0,' +
        'killed_enemies INTEGER DEFAULT 0)', (err) => console.log(err));
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Close the statistics database.');
    });
}

export function DropDB() {
    let db = new sqlite3.Database('./db/statistics.db', (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to the statistics database.');
    });
    db.run('DROP TABLE IF EXISTS statistics', (err) => console.error(err));
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Close the statistics database.');
    });
}

export function DropRowInDB(token) {
    if (token === null)
        return;

    let db = new sqlite3.Database('./db/statistics.db', (err) => {
        if (err) {
            console.error(err.message);
        }
    //    console.log('Connected to the statistics database.');
    });
    db.run(`DELETE FROM statistics WHERE token = ${token}`, (err) => console.error(err));
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
       // console.log('Close the statistics database.');
    });
}

export function UpdateDBByToken(token, chests, enemies){
    if (token === null)
        return;

    let db = new sqlite3.Database('./db/statistics.db', (err) => {
        if (err) {
            console.log(err);
        }
       // console.log('Connected to the statistics database.');
    });
    console.log(`token ${token}`);
    db.get(`SELECT * FROM statistics WHERE token = ${token}`, (err, row) => {
        if (err) {
            console.log(err);
        }
        if (row !== undefined)
            db.run(`UPDATE statistics 
                SET played_times = ${row.played_times + 1},
                    collected_chests = ${row.collected_chests + chests},
                    killed_enemies = ${row.killed_enemies + enemies}
                WHERE token = ${token}`, (err) => {
                if (err) {
                    console.log(err);
                }
            });
    });
    db.close((err) => {
        if (err) {
            console.log(err);
        }
    });
}