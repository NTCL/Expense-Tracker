const mysql = require('mysql2/promise');
require('dotenv').config();

class expense {
    constructor(pool) {
        this.pool = pool;
    }

    async getEntries() {
        try {
            const [ret] = await this.pool.query(`
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

    async addEntry(entry) {
        try {
            await this.pool.query(`
                INSERT INTO
                    expense
                SET
                    ?
            `, entry);
    
            return entry;
        }
        catch (err) {
            console.log(err);
            return err;
        }
    }
}

module.exports = expense;