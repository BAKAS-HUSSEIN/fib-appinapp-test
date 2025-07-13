const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
  db.run('DROP TABLE IF EXISTS products', (err) => {
    if (err) {
      console.error('Failed to drop products table:', err.message);
    } else {
      console.log('Products table dropped successfully.');
    }
    db.close();
  });
}); 