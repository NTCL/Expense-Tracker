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

        let values = [];

        let filters = [];

        if(typeof(query.filters) != 'undefined') {
            const filtersQuery = JSON.parse(query.filters);
            if(typeof(filtersQuery._search) != 'undefined' && filtersQuery._search != '') {
                filters.push({
                    sql: 'description LIKE ?',
                    value: `%${filtersQuery._search}%`
                });
            }
    
            if(typeof(filtersQuery._date_from) != 'undefined' && filtersQuery._date_from != '') {
                filters.push({
                    sql: 'DATE(date) >= ?',
                    value: filtersQuery._date_from
                });
            }
    
            if(typeof(filtersQuery._date_to) != 'undefined' && filtersQuery._date_to != '') {
                filters.push({
                    sql: 'DATE(date) <= ?',
                    value: filtersQuery._date_to
                });
            }
            
            if(typeof(filtersQuery.type) != 'undefined' && filtersQuery.type != 'all') {
                filters.push({
                    sql: 'type = ?',
                    value: filtersQuery.type
                });
            }

        }

        if(filters.length) {
            sql += ' WHERE ';
            filters.forEach((filter, index) => {
                sql += (index ? ' AND ' : '') + filter.sql;
                values.push(filter.value);
            });
        }

        let orders = [];

        if(typeof(query.orders) != 'undefined') {
            const ordersQuery = JSON.parse(query.orders);
            if(typeof(ordersQuery.date) != 'undefined' && ['ASC', 'DESC'].includes(ordersQuery.date)) {
                orders.push({
                    sql: `date ${ordersQuery.date}`
                });
            }
    
            if(typeof(ordersQuery.amount) != 'undefined' && ['ASC', 'DESC'].includes(ordersQuery.amount)) {
                orders.push({
                    sql: `amount ${ordersQuery.amount}`
                });
            }
        }

        if(orders.length) {
            sql += ' ORDER BY ';
            orders.forEach((order, index) => {
                sql += (index ? ', ' : '') + order.sql;
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