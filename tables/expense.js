const mysql = require('mysql2/promise');
require('dotenv').config();

class expense {
    constructor(pool) {
        this.pool = pool;
    }

    /**
     * Get all entries
     * @returns {Array|object} Array of entries on success, or error object on failure
     */
    async getEntries() {
        try {
            const [ret] = await this.pool.query(`
                SELECT
                    id,
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

    /**
     * Add an entry
     * @param {object} entry expense object
     * @returns {boolean|object} true on success, or error object on failure
     */
    async addEntry(entry) {
        try {
            await this.pool.query(`
                INSERT INTO
                    expense
                SET
                    ?
            `, entry);
    
            return true;
        }
        catch (err) {
            return err;
        }
    }

    /**
     * Update an entry
     * @param {number} id id of expense entry to be updated
     * @param {object} entry expense object
     * @returns {boolean|object} true on success, or error object on failure
     */
    async updateEntry(id, entry) {
        try {
            await this.pool.query(`
                UPDATE
                    expense
                SET
                    ?
                WHERE
                    id = ?
            `, [entry, id]);
    
            return true;
        }
        catch (err) {
            return err;
        }
    }

    /**
     * Delete an entry
     * @param {number} id id of expense entry to be deleted
     * @returns {boolean|object} true on success, or error object on failure
     */
    async deleteEntry(id) {
        try {
            await this.pool.query(`
                DELETE FROM
                    expense
                WHERE
                    id = ?
            `, [id]);
    
            return true;
        }
        catch (err) {
            return err;
        }
    }
}

module.exports = expense;