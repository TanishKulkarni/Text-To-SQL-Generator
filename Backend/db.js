import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// PostgreSQL Client Setup using a connection pool
const pool = new pg.Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DB,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});

/**
 * Dynamically fetches the database schema and formats it for the LLM.
 * @returns {Promise<string>} The formatted schema as a string.
 */
export const getDbSchema = async () => {
    const client = await pool.connect();
    try {
        const query = `
            SELECT
                t.table_name,
                c.column_name,
                c.data_type
            FROM
                information_schema.tables t
            JOIN
                information_schema.columns c ON t.table_name = c.table_name
            WHERE
                t.table_schema = 'public' AND t.table_type = 'BASE TABLE'
            ORDER BY
                t.table_name, c.ordinal_position;
        `;
        const result = await client.query(query);
        
        const schema = {};
        result.rows.forEach(row => {
            const tableName = row.table_name;
            if (!schema[tableName]) {
                schema[tableName] = [];
            }
            schema[tableName].push(`${row.column_name} (${row.data_type})`);
        });

        let schemaString = '';
        for (const table in schema) {
            schemaString += `\nTABLE ${table} (\n`;
            schemaString += schema[table].map(col => `  ${col}`).join(',\n');
            schemaString += '\n);';
        }
        return schemaString.trim();
    } finally {
        client.release();
    }
};

/**
 * Executes a given SQL query against the database.
 * @param {string} sql The SQL query to execute.
 * @returns {Promise<Array<object>>} The query results.
 */
export const executeSql = async (sql) => {
    const client = await pool.connect();
    try {
        const result = await client.query(sql);
        return result.rows;
    } finally {
        client.release();
    }
};
