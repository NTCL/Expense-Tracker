const mysql = require('mysql2/promise');
require('dotenv').config();

const init = async () => {
    try {
        const con = await mysql.createConnection({
            host: 'localhost',
            user: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD
        });

        await con.connect();

        await con.query('CREATE DATABASE IF NOT EXISTS expense_tracker');

        await con.query('USE expense_tracker');

        await con.query(`
            CREATE TABLE IF NOT EXISTS expense (
                id INT(11) NOT NULL AUTO_INCREMENT,
                description VARCHAR(255) NOT NULL DEFAULT '',
                amount DECIMAL(11,1) NOT NULL DEFAULT 0.0,
                date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                type VARCHAR(255) NOT NULL DEFAULT 'Others',
                PRIMARY KEY (id)
            )
        `);
    }
    catch (err) {
        console.log(err);
    }
};

const pool = mysql.createPool({
    host: 'localhost',
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'expense_tracker'
});

const factory = (tableName) => {
    const tableClass = require('./tables/' + tableName);
    const table = new tableClass(pool);
    return table;
}

module.exports = {
    init,
    factory
};