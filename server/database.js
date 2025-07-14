const { Pool } = require('pg');
require('dotenv').config();

console.log('Connecting to PostgreSQL...');

const pool = new Pool({
  connectionString: 'postgresql://miniappuser:sFQ9m14uTarUsYCL9CD1B8NrimxfdMNs@dpg-d1q3kkqdbo4c73c40g30-a.oregon-postgres.render.com/miniappdb',
  ssl: false
});

const db = {
  run: async (sql, params = []) => {
    let returningId = false;
    if (/insert/i.test(sql) && !/returning/i.test(sql)) {
      sql += ' RETURNING id';
      returningId = true;
    }
    const result = await pool.query(sql, params);
    if (returningId && result.rows && result.rows[0] && result.rows[0].id !== undefined) {
      return { lastID: result.rows[0].id };
    }
    return {};
  },
  get: async (sql, params = []) => {
    const result = await pool.query(sql, params);
    return result.rows[0];
  },
  all: async (sql, params = []) => {
    const result = await pool.query(sql, params);
    return result.rows;
  }
};

db.isPostgres = true;

module.exports = db; 
