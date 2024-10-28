const db = require('../database'); 

class type {
    constructor(pool) {
        this.pool = pool;
    }

    /**
     * Validate and Process request body for adding or updating records
     * @param {object} body request body 
     * @returns {boolean|object} processed object on success, or error object on failure
     */
    async validateAndProcessBody(body) {
        if(typeof(body.name) == 'undefined') {
            return new Error(`Missing name`);
        }

        if(body.name === '') {
            return new Error(`Empty name`);
        }

        const type = db.factory('type');
        const types = await type.getTypes();
        // duplicate name
        if(types.map(t => t.name).includes(body.name)) {
            return new Error(`Duplicate name ${body.name}`);
        }

        return {
            name: body.name
        };
    }

    /**
     * Get all types
     * @returns {Array|object} Array of types on success, or error object on failure
     */
    async getTypes() {
        let sql = `
            SELECT
                id,
                name
            FROM
                type
        `;

        let values = [];

        try {
            const [ret] = await this.pool.query(sql, values);
            return ret;
        }
        catch (err) {
            return err;
        }
    }

    /**
     * Add a type
     * @param {object} body request body
     * @returns {boolean|object} true on success, or error object on failure
     */
    async addType(body) {
        const values = await this.validateAndProcessBody(body);

        if(values instanceof Error) {
            return values;
        }

        try {
            await this.pool.query(`
                INSERT INTO
                    type
                SET
                    ?
            `, values);
    
            return true;
        }
        catch (err) {
            return err;
        }
    }
}

module.exports = type;