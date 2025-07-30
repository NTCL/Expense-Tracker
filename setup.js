const mysql = require('mysql2/promise');
require('dotenv').config();

const init = async () => {
    try {
        const con = await mysql.createConnection({
            host: 'db',
            user: 'root',
            password: process.env.DB_ROOT_PASSWORD
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
                type_id INT(11) NOT NULL DEFAULT 0,
                PRIMARY KEY (id)
            )
        `);

        await con.query(`
            CREATE TABLE IF NOT EXISTS type (
                id INT(11) NOT NULL AUTO_INCREMENT,
                name VARCHAR(255) NOT NULL DEFAULT '' UNIQUE,
                PRIMARY KEY (id)
            )
        `);

        await con.end();
    }
    catch (err) {
        console.log(err);
        process.exit(1);
    }
};
init();