const mysql = require('mysql2');
require('dotenv').config();

const init = () => {
    const con = mysql.createConnection({
        host: 'localhost',
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD
    });

    con.connect((err) => {
        if(err) throw err;
    });

    con.query('CREATE DATABASE IF NOT EXISTS expense_tracker', (err) => {
        if(err) throw err;
    });

    con.query('USE expense_tracker', (err) => {
        if(err) throw err;
    });

    con.query(`
        CREATE TABLE IF NOT EXISTS expenses (
            id INT(11) NOT NULL AUTO_INCREMENT,
            description VARCHAR(255) NOT NULL DEFAULT '',
            amount DECIMAL(11,1) NOT NULL DEFAULT 0.0,
            date DATE NOT NULL DEFAULT '1000-01-01',
            type VARCHAR(255) NOT NULL DEFAULT 'Others',
            PRIMARY KEY (id)
        )
    `, (err) => {
        if(err) throw err;
    });
};

const factory = (tableName) => {
    return require('./tables/' + tableName);
}

module.exports = {
    init,
    factory
};