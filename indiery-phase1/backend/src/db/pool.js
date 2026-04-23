const { Pool } = require('pg');

let pool;

function initDB() {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  return pool.query('SELECT NOW()').then(() => {
    console.log('✅ PostgreSQL connected');
  });
}

function getPool() {
  return pool;
}

module.exports = { initDB, getPool };
