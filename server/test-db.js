const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:admin%40123@localhost:5432/miniapp_test',
  ssl: false
});

async function testConnection() {
  try {
    console.log('Testing PostgreSQL connection...');
    
    // Test basic connection
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Connection successful:', result.rows[0]);
    
    // Test if tables exist
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('�� Tables in database:', tables.rows.map(t => t.table_name));
    
    // Test products table
    const products = await pool.query('SELECT COUNT(*) as count FROM products');
    console.log('��️ Products count:', products.rows[0].count);
    
    // Test users table
    const users = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log('👥 Users count:', users.rows[0].count);
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  } finally {
    await pool.end();
  }
}

testConnection();
