class type {
    constructor(pool) {
        this.pool = pool;
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
}

module.exports = type;