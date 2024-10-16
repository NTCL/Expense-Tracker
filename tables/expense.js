const mysql = require('mysql2/promise');
require('dotenv').config();

const getEntries = async () => {
    const con = await mysql.createConnection({
        host: 'localhost',
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: 'expense_tracker'
    });

    try {
        const [ret] = await con.query(`
            SELECT 
                description,
                amount,
                DATE_FORMAT(date, '%Y-%m-%d') AS date,
                type
            FROM
                expense
        `);
        return ret;
    }
    catch (err) {
        return err;
    }
}

const addEntry = async (entry) => {
    const con = await mysql.createConnection({
        host: 'localhost',
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: 'expense_tracker'
    });

    try {
        await con.query(`
            INSERT INTO
                expense (description, amount, date, type)
            VALUES
                ('${entry.description}', ${entry.amount}, '${entry.date}', '${entry.type}')
        `);

        return entry;
    }
    catch (err) {
        return err;
    }
}

module.exports = {
    getEntries,
    addEntry
};