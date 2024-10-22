const mysql = require('mysql2/promise');

class expense {
    constructor(pool) {
        this.pool = pool;
    }

    /**
     * Check if the input type string is valid ('transportation' / 'food' / 'others)
     * @param {string} typeString type string
     * @returns {boolean} true if valid, else false
     */
    isValidType(typeString) {
        // invalid type
        if(!['transportation', 'food', 'others'].includes(typeString)) {
            return false;
        }

        return true;
    }

    /**
     * Check if the input date string is in the format 'YYYY-MM-DD'
     * @param {string} dateString date string
     * @returns {boolean} true if valid, else false
     */
    isValidDate(dateString) {
        const date = new Date(dateString);
        // invalid date
        if(isNaN(date)) {
            return false;
        }

        // valid date but not in the format 'YYYY-MM-DD'
        if(dateString != date.toISOString().split('T')[0]) {
            return false;
        }

        return true;
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
    
            if(typeof(filtersQuery._date_from) != 'undefined') {
                if(!this.isValidDate(filtersQuery._date_from)) {
                    return new Error(`Invalid _date_from: ${filtersQuery._date_from}`);
                }
                filters.push({
                    sql: 'DATE(date) >= ?',
                    value: filtersQuery._date_from
                });
            }
    
            if(typeof(filtersQuery._date_to) != 'undefined') {
                if(!this.isValidDate(filtersQuery._date_to)) {
                    return new Error(`Invalid _date_to: ${filtersQuery._date_to}`);
                }
                filters.push({
                    sql: 'DATE(date) <= ?',
                    value: filtersQuery._date_to
                });
            }
            
            if(typeof(filtersQuery.type) != 'undefined') {
                if(!this.isValidType(filtersQuery.type)) {
                    return new Error(`Invalid type: ${filtersQuery.type}`);
                }
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
            if(typeof(ordersQuery.date) != 'undefined') {
                if(!['ASC', 'DESC'].includes(ordersQuery.date)) {
                    return new Error(`Invalid type ordering direction : ${ordersQuery.date}`);
                }
                orders.push({
                    sql: `date ${ordersQuery.date}`
                });
            }
    
            if(typeof(ordersQuery.amount) != 'undefined') {
                if(!['ASC', 'DESC'].includes(ordersQuery.amount)) {
                    return new Error(`Invalid amount ordering direction: ${ordersQuery.amount}`);
                }
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
        if(!this.isValidDate(entry.date)) {
            return new Error(`Invalid date: ${entry.date}`);
        }
        if(!this.isValidType(entry.type)) {
            return new Error(`Invalid type: ${entry.type}`);
        }
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
        if(!this.isValidDate(entry.date)) {
            return new Error(`Invalid date: ${entry.date}`);
        }
        if(!this.isValidType(entry.type)) {
            return new Error(`Invalid type: ${entry.type}`);
        }
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