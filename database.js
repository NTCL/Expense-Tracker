const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: 'db',
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
    factory
};