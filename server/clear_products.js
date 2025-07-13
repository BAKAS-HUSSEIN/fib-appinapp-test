const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
  db.run('DELETE FROM products', (err) => {
    if (err) {
      console.error('Failed to clear products table:', err.message);
    } else {
      console.log('Products table cleared successfully.');
    }
    db.close();
  });
}); 