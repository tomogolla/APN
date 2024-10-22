const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'Thomas',
    password: 'Nairobi12345',
    database: 'APN'
});

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to database');
});

module.exports = db;
