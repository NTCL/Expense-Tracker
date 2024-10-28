const db = require('../database'); 

class expense {
    constructor(pool) {
        this.pool = pool;
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
     * Check if the input type id is valid
     * @param {string} typeId type id
     * @returns {boolean} true if valid, else false
     */
    async isValidTypeId(typeId) {
        const type = db.factory('type');
        const types = await type.getTypes();
        // invalid type
        if(!types.map(t => t.id).includes(typeId)) {
            return false;
        }

        return true;
    }

    /**
     * Validate and Process request body for adding or updating records
     * @param {object} body request body 
     * @returns {boolean|object} processed object on success, or error object on failure
     */
    async validateAndProcessBody(body) {
        if(typeof(body.description) == 'undefined') {
            return new Error(`Missing description`);
        }

        if(typeof(body.amount) == 'undefined') {
            return new Error(`Missing amount`);
        }
        
        if(typeof(body.date) == 'undefined') {
            return new Error(`Missing date`);
        }

        if(!this.isValidDate(body.date)) {
            return new Error(`Invalid date: ${body.date}`);
        }

        if(typeof(body.type_id) == 'undefined') {
            return new Error(`Missing type_id`);
        }

        if(body.type_id != '0' && !await this.isValidTypeId(body.type_id)) {
            return new Error(`Invalid type_id: ${body.type_id}`);
        }

        return {
            description: body.description,
            amount: body.amount,
            date: body.date,
            type_id: parseInt(body.type_id)
        }
    }

    /**
     * Get all entries
     * @param {object} query request query
     * @returns {Array|object} Array of entries on success, or error object on failure
     */
    async getEntries(query) {
        let sql = `
            SELECT
                expense.id,
                expense.description,
                expense.amount,
                DATE_FORMAT(expense.date, '%Y-%m-%d') AS date,
                expense.type_id,
                type.name AS type_id_name
            FROM
                expense
            LEFT JOIN
                type
            ON
                expense.type_id = type.id
        `;

        let values = [];

        let filters = [];

        if(typeof(query.filters) != 'undefined') {
            const filtersQuery = JSON.parse(query.filters);
            if(typeof(filtersQuery._search) != 'undefined' && filtersQuery._search != '') {
                filters.push({
                    sql: 'expense.description LIKE ?',
                    value: `%${filtersQuery._search}%`
                });
            }
    
            if(typeof(filtersQuery._date_from) != 'undefined') {
                if(!this.isValidDate(filtersQuery._date_from)) {
                    return new Error(`Invalid _date_from: ${filtersQuery._date_from}`);
                }
                filters.push({
                    sql: 'DATE(expense.date) >= ?',
                    value: filtersQuery._date_from
                });
            }
    
            if(typeof(filtersQuery._date_to) != 'undefined') {
                if(!this.isValidDate(filtersQuery._date_to)) {
                    return new Error(`Invalid _date_to: ${filtersQuery._date_to}`);
                }
                filters.push({
                    sql: 'DATE(expense.date) <= ?',
                    value: filtersQuery._date_to
                });
            }
            
            if(typeof(filtersQuery.type_id) != 'undefined') {
                if(!await this.isValidTypeId(filtersQuery.type_id)) {
                    return new Error(`Invalid type_id: ${filtersQuery.type_id}`);
                }
                filters.push({
                    sql: 'expense.type_id = ?',
                    value: parseInt(filtersQuery.type_id)
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
                    sql: `expense.date ${ordersQuery.date}`
                });
            }
    
            if(typeof(ordersQuery.amount) != 'undefined') {
                if(!['ASC', 'DESC'].includes(ordersQuery.amount)) {
                    return new Error(`Invalid amount ordering direction: ${ordersQuery.amount}`);
                }
                orders.push({
                    sql: `expense.amount ${ordersQuery.amount}`
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
     * @param {object} body request body
     * @returns {boolean|object} true on success, or error object on failure
     */
    async addEntry(body) {
        const values = await this.validateAndProcessBody(body);

        if(values instanceof Error) {
            return values;
        }

        try {
            await this.pool.query(`
                INSERT INTO
                    expense
                SET
                    ?
            `, values);
    
            return true;
        }
        catch (err) {
            return err;
        }
    }

    /**
     * Update an entry
     * @param {number} id id of expense entry to be updated
     * @param {object} body request body
     * @returns {boolean|object} true on success, or error object on failure
     */
    async updateEntry(id, body) {        
        if(Number.isNaN(parseInt(id)) || id < 1) {
            return new Error(`Invalid id ${id}`);
        }

        const values = await this.validateAndProcessBody(body);

        if(values instanceof Error) {
            return values;
        }

        try {
            await this.pool.query(`
                UPDATE
                    expense
                SET
                    ?
                WHERE
                    id = ?
            `, [values, id]);
    
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
        if(Number.isNaN(parseInt(id)) || id < 1) {
            return new Error(`Invalid id ${id}`);
        }

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