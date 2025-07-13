console.log('Server started!');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const FormData = require('form-data');
const db = require('./database');
require('dotenv').config();

const FIB_BASE_URL = process.env.FIB_BASE_URL || 'https://fib.stage.fib.iq';
const FIB_CLIENT_ID = process.env.FIB_CLIENT_ID || 'icf-market';
const FIB_CLIENT_SECRET = process.env.FIB_CLIENT_SECRET || '15dba883-3c31-4bf4-b27d-d6ab51c177b0';

// FIB SSO credentials
const FIB_SSO_BASE_URL = process.env.FIB_SSO_BASE_URL || 'https://fib.stage.fib.iq';
const FIB_SSO_CLIENT_ID = process.env.FIB_SSO_CLIENT_ID || 'stageSSO';
const FIB_SSO_CLIENT_SECRET = process.env.FIB_SSO_CLIENT_SECRET || '215233bd-0624-4fba-98e7-3e3616fdbf08';

const FORCE_SAMPLE_PRODUCTS = true; // Force insertion of sample products

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// To update product prices, edit the 'price' field in the sampleProducts array below:
const sampleProducts = [
  {
    name: 'Wireless Headphones',
    description: 'High-quality wireless headphones with noise cancellation',
    price: 3000,
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    stock: 50
  },
  {
    name: 'Smart Watch',
    description: 'Feature-rich smartwatch with health monitoring',
    price: 4000,
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    stock: 30
  },
  {
    name: 'Laptop Backpack',
    description: 'Durable and spacious laptop backpack',
    price: 6000,
    image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
    stock: 100
  },
  {
    name: 'Bluetooth Speaker',
    description: 'Portable speaker with deep bass and long battery life',
    price: 2500,
    image_url: 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=400',
    stock: 40
  },
  {
    name: 'Fitness Tracker',
    description: 'Track your steps, heart rate, and sleep quality',
    price: 1800,
    image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
    stock: 60
  },
  {
    name: 'Gaming Mouse',
    description: 'High-precision mouse with customizable buttons',
    price: 2200,
    image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
    stock: 80
  },
  {
    name: 'USB-C Power Bank',
    description: 'Fast-charging power bank for all your devices',
    price: 3500,
    image_url: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400',
    stock: 70
  },
  {
    name: 'Noise Cancelling Earbuds',
    description: 'Compact earbuds with active noise cancellation',
    price: 3200,
    image_url: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400',
    stock: 90
  },
  {
    name: '4K Action Camera',
    description: 'Capture your adventures in stunning 4K resolution',
    price: 8000,
    image_url: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=400',
    stock: 25
  },
  {
    name: 'Wireless Charger',
    description: 'Convenient wireless charging pad for smartphones',
    price: 1500,
    image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
    stock: 120
  },
  {
    name: 'Smart LED Bulb',
    description: 'Control your lighting with your phone or voice',
    price: 900,
    image_url: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?w=400',
    stock: 200
  },
  {
    name: 'Tablet Stand',
    description: 'Adjustable stand for tablets and e-readers',
    price: 1100,
    image_url: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=400',
    stock: 150
  }
];

const insertSampleProducts = async () => {
  try {
    for (const product of sampleProducts) {
      const sql = db.isPostgres
        ? `INSERT INTO products (name, description, price, image_url, stock) VALUES ($1, $2, $3, $4, $5)`
        : `INSERT INTO products (name, description, price, image_url, stock) VALUES (?, ?, ?, ?, ?)`;
      await db.run(
        sql,
        [product.name, product.description, product.price, product.image_url, product.stock]
      );
    }
    console.log('Sample products inserted');
  } catch (error) {
    console.error('Error inserting sample products:', error);
  }
};

// Database setup
const initializeDatabase = async () => {
  try {
    console.log('Starting database initialization...');
    
    // Create tables
    await db.run(`CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      image_url TEXT,
      stock INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    console.log('✅ Products table created/verified');
    
    await db.run(`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      fib_phone TEXT,
      fib_iban TEXT,
      fib_name TEXT,
      fib_gender TEXT,
      fib_dob TEXT,
      fib_sso_user BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    console.log('✅ Users table created/verified');
    
    await db.run(`CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      payment_id TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);
    console.log('✅ Orders table created/verified');
    
    await db.run(`CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER,
      product_id INTEGER,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders (id),
      FOREIGN KEY (product_id) REFERENCES products (id)
    )`);
    console.log('✅ Order items table created/verified');
    
    // Check/insert sample products
    const row = await db.get("SELECT COUNT(*) as count FROM products");
    console.log('📊 Current products count:', row.count);
    
    if (row.count === 0 || FORCE_SAMPLE_PRODUCTS) {
      console.log('🔄 Inserting sample products...');
      if (FORCE_SAMPLE_PRODUCTS) {
        await db.run('DELETE FROM products');
        console.log('🗑️ Cleared existing products');
      }
      await insertSampleProducts();
      console.log('✅ Sample products inserted successfully');
      
      // Verify insertion
      const verifyRow = await db.get("SELECT COUNT(*) as count FROM products");
      console.log('📊 Products count after insertion:', verifyRow.count);
    } else {
      console.log('ℹ️ Products already exist, skipping insertion');
    }
    
    console.log('🎉 Database initialization completed successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
  }
};

// Initialize database
initializeDatabase();

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Get all products (with pagination)
app.get('/api/products', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const offset = (page - 1) * limit;

    const countSql = db.isPostgres ? 'SELECT COUNT(*) as count FROM products' : 'SELECT COUNT(*) as count FROM products';
    const row = await db.get(countSql);
    const total = db.isPostgres ? parseInt(row.count, 10) : row.count;
    const totalPages = Math.ceil(total / limit);
    const productsSql = db.isPostgres
      ? 'SELECT * FROM products LIMIT $1 OFFSET $2'
      : 'SELECT * FROM products LIMIT ? OFFSET ?';
    const rows = await db.all(productsSql, [limit, offset]);
    res.json({ products: rows, total, page, totalPages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const sql = db.isPostgres
      ? 'SELECT * FROM products WHERE id = $1'
      : 'SELECT * FROM products WHERE id = ?';
    const row = await db.get(sql, [req.params.id]);
    if (!row) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json(row);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User registration
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = db.isPostgres
      ? 'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)'
      : 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    const result = await db.run(
      sql,
      [username, email, hashedPassword]
    );
    const token = jwt.sign({ id: result.lastID, username }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
    res.json({ token, user: { id: result.lastID, username, email } });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed') || error.message.includes('duplicate key value')) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// User login
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const sql = db.isPostgres
      ? 'SELECT * FROM users WHERE username = $1'
      : 'SELECT * FROM users WHERE username = ?';
    const user = await db.get(sql, [username]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// FIB SSO Initiate endpoint (FormData)
app.post('/api/auth/fib-sso/initiate', async (req, res) => {
  try {
    const form = new (require('form-data'))(); // Empty FormData
    const response = await axios.post(
      `${FIB_SSO_BASE_URL}/external/v1/sso`,
      form,
      {
        auth: {
          username: FIB_SSO_CLIENT_ID,
          password: FIB_SSO_CLIENT_SECRET
        },
        headers: {
          ...form.getHeaders()
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('FIB SSO initiation error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to initiate FIB SSO', details: error.response?.data || error.message });
  }
});

// FIB SSO Get user details endpoint (FormData if required, else just headers)
app.get('/api/auth/fib-sso/details/:ssoAuthorizationCode', async (req, res) => {
  const { ssoAuthorizationCode } = req.params;
  try {
    const authHeader = 'Basic ' + Buffer.from(`${FIB_SSO_CLIENT_ID}:${FIB_SSO_CLIENT_SECRET}`).toString('base64');
    const cleanSsoCode = ssoAuthorizationCode.replace(/-/g, '');
    const fibUrl = `${FIB_SSO_BASE_URL}/external/v1/sso/${cleanSsoCode}/details`;
    // GET requests typically do not use FormData, so just send headers
    const response = await axios.get(fibUrl, {
      headers: {
        'Authorization': authHeader
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('FIB SSO get details error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get FIB SSO details', details: error.response?.data || error.message });
  }
});

// Create order
app.post('/api/orders', authenticateToken, async (req, res) => {
  const { items, total_amount, payment_id } = req.body;
  const user_id = req.user.id;

  if (!items || !total_amount) {
    return res.status(400).json({ error: 'Items and total amount are required' });
  }
  if (!payment_id) {
    return res.status(400).json({ error: 'Payment ID is required and must be valid.' });
  }

  try {
    const sql = db.isPostgres
      ? 'INSERT INTO orders (user_id, total_amount, payment_id) VALUES ($1, $2, $3)'
      : 'INSERT INTO orders (user_id, total_amount, payment_id) VALUES (?, ?, ?)';
    const result = await db.run(
      sql,
      [user_id, total_amount, payment_id]
    );
    const order_id = result.lastID;
    for (const item of items) {
      const itemSql = db.isPostgres
        ? 'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)'
        : 'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)';
      await db.run(
        itemSql,
        [order_id, item.product_id, item.quantity, item.price]
      );
    }
    res.json({ order_id, message: 'Order created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user orders
app.get('/api/orders', authenticateToken, async (req, res) => {
  const user_id = req.user.id;

  try {
    const sql = db.isPostgres
      ? `SELECT o.*, oi.product_id, oi.quantity, oi.price, p.name as product_name 
         FROM orders o 
         LEFT JOIN order_items oi ON o.id = oi.order_id 
         LEFT JOIN products p ON oi.product_id = p.id 
         WHERE o.user_id = $1`
      : `SELECT o.*, oi.product_id, oi.quantity, oi.price, p.name as product_name 
         FROM orders o 
         LEFT JOIN order_items oi ON o.id = oi.order_id 
         LEFT JOIN products p ON oi.product_id = p.id 
         WHERE o.user_id = ?`;
    const rows = await db.all(sql, [user_id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// FIB Payment integration endpoint
app.post('/api/payment/fib', async (req, res) => {
  const { amount, order_id, customer_details, description } = req.body;

  try {
    // 1. Get access token from FIB
    const tokenResponse = await axios.post(
      `${FIB_BASE_URL}/auth/realms/fib-online-shop/protocol/openid-connect/token`,
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: FIB_CLIENT_ID,
        client_secret: FIB_CLIENT_SECRET
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    const accessToken = tokenResponse.data.access_token;

    // 2. Create payment
    const paymentResponse = await axios.post(
      `${FIB_BASE_URL}/protected/v1/payments`,
      {
        monetaryValue: {
          amount: amount.toString(),
          currency: 'IQD'
        },
        description: description || `Order #${order_id}`,
        expiresIn: 'PT5M', // 5 minutes
        category: 'ECOMMERCE',
        refundableFor: 'P7D' // 7 days
        // Optionally: statusCallbackUrl: 'https://your-callback-url'
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // 3. Return payment info to frontend
    const { paymentId, qrCode, readableCode, personalAppLink, businessAppLink, corporateAppLink, validUntil } = paymentResponse.data;
    res.json({
      success: true,
      paymentId,
      qrCode,
      readableCode,
      personalAppLink,
      businessAppLink,
      corporateAppLink,
      validUntil
    });
  } catch (error) {
    console.error('FIB payment initiation error:', error.response?.data || error.message);
    res.status(500).json({ success: false, error: 'Failed to initiate FIB payment', details: error.response?.data || error.message });
  }
});

// Check FIB payment status endpoint
app.get('/api/payment/fib/status/:paymentId', async (req, res) => {
  const { paymentId } = req.params;
  try {
    // 1. Get access token from FIB
    const tokenResponse = await axios.post(
      `${FIB_BASE_URL}/auth/realms/fib-online-shop/protocol/openid-connect/token`,
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: FIB_CLIENT_ID,
        client_secret: FIB_CLIENT_SECRET
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    const accessToken = tokenResponse.data.access_token;

    // 2. Check payment status
    const statusResponse = await axios.get(
      `${FIB_BASE_URL}/protected/v1/payments/${paymentId}/status`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    res.json({ success: true, ...statusResponse.data });
  } catch (error) {
    console.error('FIB payment status check error:', error.response?.data || error.message);
    res.status(500).json({ success: false, error: 'Failed to check FIB payment status', details: error.response?.data || error.message });
  }
});

// Cancel FIB payment endpoint
app.post('/api/payment/fib/cancel/:paymentId', async (req, res) => {
  const { paymentId } = req.params;
  try {
    // 1. Get access token from FIB
    const tokenResponse = await axios.post(
      `${FIB_BASE_URL}/auth/realms/fib-online-shop/protocol/openid-connect/token`,
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: FIB_CLIENT_ID,
        client_secret: FIB_CLIENT_SECRET
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    const accessToken = tokenResponse.data.access_token;

    // 2. Cancel payment
    await axios.post(
      `${FIB_BASE_URL}/protected/v1/payments/${paymentId}/cancel`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    res.json({ success: true });
  } catch (error) {
    console.error('FIB payment cancel error:', error.response?.data || error.message);
    res.status(500).json({ success: false, error: 'Failed to cancel FIB payment', details: error.response?.data || error.message });
  }
});

// Serve static files from React build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 