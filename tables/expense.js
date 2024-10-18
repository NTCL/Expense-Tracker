const mysql = require('mysql2/promise');
require('dotenv').config();

class expense {
    constructor(pool) {
        this.pool = pool;
    }

    /**
     * Get all entries
     * @param {object} query query parameters
     * @returns {Array|object} Array of entries on success, or error object on failure
     */
    async getEntries(query) {
        let sql = `
            SELECT
                id,
                description,
                amount,
                DATE_FORMAT(date, '%Y-%m-%d') AS date,
                type
            FROM
                expense
        `;

        let filters = [];

        if(typeof(query._search) !='undefined') {
            filters.push({
                sql: 'description LIKE ?',
                value: `%${query._search}%`
            });
        }
        
        if(typeof(query.type) != 'undefined') {
            filters.push({
                sql: 'type = ?',
                value: query.type
            });
        }

        let values = [];

        if(filters.length) {
            sql += ' WHERE ';
            filters.forEach((filter, index) => {
                sql += (index ? ' AND ' : ' ') + filter.sql + ' ';
                values.push(filter.value);
            });
        }

        try {
            const [ret] = await this.pool.query(sql, values);
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